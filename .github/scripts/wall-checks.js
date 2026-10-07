// .github/scripts/wall-checks.js
//
// Shared gate for wall-entry PRs (ones that touch profile/README.md).
// Used by verify-star.yml (per-PR, on every push/edit) and wall-sweep.yml
// (daily: re-check the backlog and auto-close PRs that stayed red).
//
// Runs under pull_request_target with the base branch checked out — we only
// ever read the PR through the API, never execute anything from the fork.

const crypto = require('crypto');

const ENTRY_FILE = 'profile/README.md';
const STAR_REPO = { owner: '169Pi', repo: 'Alpie-Core' };
const MARKER = '<!-- verify-star-bot -->';
const LABEL_ENTRY = 'good first alpie';
const LABEL_FAIL = 'needs-changes';
const LABEL_OK = 'ready-for-review';
// Maintainer-only escape hatch (only triage+ can label): skips the gate and the sweep.
const LABEL_EXEMPT = 'wall-exempt';
const LABEL_COLORS = { [LABEL_FAIL]: 'D93F0B', [LABEL_OK]: '0E8A16', [LABEL_EXEMPT]: 'BFD4F2' };
// Repo permission, not author_association: 169Pi org memberships are private,
// so teammates show up as NONE/CONTRIBUTOR in webhook payloads.
const WRITERS = ['admin', 'maintain', 'write'];
const RETURNING = ['CONTRIBUTOR', 'OWNER', 'MEMBER', 'COLLABORATOR'];
// Red PRs get follow-ups (days since flagged / last push), then close if the
// last one goes unanswered — 3 + 7 + 3 = closed on day 10, inside one
// monthly merge cycle. A push at any point resets the clock.
const FOLLOWUP_MARKER = '<!-- wall-followup -->';
const FOLLOWUP_DAYS = [3, 7];
const CLOSE_DAYS_AFTER_LAST = 3;

const CONTRIB_LINK = '[`CONTRIBUTING.md`](https://github.com/169Pi/.github/blob/main/CONTRIBUTING.md)';
const DISCORD_LINK = '[Discord](https://discord.gg/GwJP7MsZp7)';

// Template text that should never survive into a real entry. Includes the
// pre-Oct-2026 template wording, which is still in plenty of forks.
const PLACEHOLDERS = [
  'your-github-handle',
  "your entry's title",
  "<what you're calling it>",
  'your club name',
  'replace this comment with your work',
  'your representation goes here',
  'one line on the 169pi model, capability, or feature this reflects',
  'optional — site, socials',
];

// Brightness ramp used by image→ASCII converters (" .:-=+*#%@").
const RAMP = new Set(' .:-=+*#%@');
const MIN_CONVERTER_LINES = 8;
const MIN_UNFENCED_ART_LINES = 3;
const MIN_FINGERPRINT_LINES = 6;

// ── Pure analysis (no API calls) ────────────────────────────────────────────

function parsePatch(patch) {
  const added = [];    // { text, line } — line is the new-file line number
  const removed = [];  // text of removed lines
  let newLine = 0;
  for (const l of (patch || '').split('\n')) {
    const h = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (h) { newLine = parseInt(h[1], 10); continue; }
    if (l.startsWith('+++') || l.startsWith('---')) continue;
    if (l.startsWith('+')) { added.push({ text: l.slice(1), line: newLine }); newLine++; }
    else if (l.startsWith('-')) removed.push(l.slice(1));
    else newLine++;
  }
  return { added, removed };
}

// A line straight out of an image→ASCII converter: long, made almost
// entirely of the brightness ramp, with real tonal variation.
function isConverterLine(s) {
  const t = s.replace(/\s+$/, '');
  if (t.length < 30) return false;
  let inRamp = 0;
  for (const c of t) if (RAMP.has(c)) inRamp++;
  const distinct = new Set(t.replace(/\s/g, ''));
  return inRamp / t.length >= 0.95 && distinct.size >= 3;
}

// Any line that reads as ASCII/box art rather than prose or Markdown.
// Outside a fence, GitHub mangles these (`###` → heading, `*` → italics).
function isArtLine(s) {
  const t = s.trim();
  if (t.length < 8) return false;
  if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\||<|!?\[)/.test(t)) return false;
  if (/^([-=_*~])\1+$/.test(t)) return false; // Markdown rules like `-----`
  const chars = [...t.replace(/\s/g, '')];
  const symbols = chars.filter(c => !/[\p{L}\p{N}]/u.test(c)).length;
  return symbols / chars.length >= 0.6;
}

function analyzeAdditions(lines) {
  let fence = false, pre = false, svg = false;
  let unfencedArt = 0;
  const converter = [];
  const art = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (/^(```|~~~)/.test(t)) { fence = !fence; continue; }
    if (/<pre\b/i.test(t)) pre = true;
    if (/<svg\b/i.test(t)) svg = true;
    const shielded = fence || pre || svg;
    if (isConverterLine(raw)) converter.push(t);
    if (isConverterLine(raw) || isArtLine(raw)) {
      art.push(t);
      if (!shielded) unfencedArt++;
    }
    if (/<\/pre>/i.test(t)) pre = false;
    if (/<\/svg>/i.test(t)) svg = false;
  }
  const fingerprint = art.length >= MIN_FINGERPRINT_LINES
    ? crypto.createHash('sha1').update(art.join('\n')).digest('hex')
    : null;
  return { converterLines: converter.length, unfencedArt, artLines: art, fingerprint };
}

function stripComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, '');
}

// Everything we can decide from the diff alone. `author` is the PR author.
function analyzePatch(patch, author) {
  const { added, removed } = parsePatch(patch);
  const lines = added.map(a => a.text);
  const text = lines.join('\n');
  const a = analyzeAdditions(lines);

  // Guidance lives in HTML comments, which don't render — only visible
  // leftovers count as unfilled template.
  const visible = stripComments(text).toLowerCase();
  const placeholders = PLACEHOLDERS.filter(p => visible.includes(p));
  const repMatch = stripComments(text).match(/\*What it represents:\*\s*(.*)/i);
  const represents = repMatch ? repMatch[1].trim() : '';
  const hasHeading = lines.some(l => /^###\s+\S/.test(l));

  const contrib = text.match(
    /contributed by\s*\[[^\]]*\]\(\s*https?:\/\/github\.com\/@?([A-Za-z0-9-]+)\/?\s*\)/i);
  const attributedTo = contrib ? contrib[1] : null;

  return {
    addedLineNos: added.map(x => x.line),
    deletedContent: removed.filter(l => l.trim() !== '').length,
    placeholders,
    filledIn: placeholders.length === 0 && represents.length > 0 && hasHeading,
    represents,
    hasHeading,
    attributedTo,
    attributionOk: !!attributedTo && attributedTo.toLowerCase() === author.toLowerCase(),
    externalAsset: lines.some(l =>
      /<script\b/i.test(l) ||
      /<img\b[^>]*src\s*=\s*["']https?:/i.test(l) ||
      /!\[[^\]]*\]\(https?:\/\//.test(l)),
    embeddedRaster: /data:image\//i.test(text),
    ...a,
  };
}

function titleCheck(title, author) {
  const m = (title || '').match(/^@([A-Za-z0-9-]+):\s*(.+)$/);
  if (!m) return { ok: false, note: 'rename the PR to `@your-handle: Your entry\'s title`' };
  if (m[1].toLowerCase() !== author.toLowerCase())
    return { ok: false, note: `the handle in the title should be \`@${author}\`` };
  if (/[<>]/.test(m[2]))
    return { ok: false, note: 'drop the `< >` brackets — they were only there to mark the placeholder' };
  return { ok: true };
}

// ── API helpers ──────────────────────────────────────────────────────────────

async function loadStargazers(github) {
  const set = new Set();
  const users = await github.paginate(github.rest.activity.listStargazersForRepo, {
    ...STAR_REPO, per_page: 100,
  });
  for (const u of users) set.add(u.login.toLowerCase());
  return set;
}

async function entryPatch(github, repo, number) {
  const files = await github.paginate(github.rest.pulls.listFiles, {
    ...repo, pull_number: number, per_page: 100,
  });
  const entry = files.find(f => f.filename === ENTRY_FILE);
  return { files, entry, patch: (entry && entry.patch) || '' };
}

const permissionCache = new Map();
async function canWrite(github, repo, username) {
  if (!permissionCache.has(username)) {
    let permission = 'none';
    try {
      ({ data: { permission } } = await github.rest.repos.getCollaboratorPermissionLevel({ ...repo, username }));
    } catch (e) { /* not a collaborator */ }
    permissionCache.set(username, WRITERS.includes(permission));
  }
  return permissionCache.get(username);
}

// Maintainers whose PRs always skip the gate, wall edits included (cadence
// banners, template tweaks). Set by the workflows.
const EXEMPT_AUTHORS = (process.env.EXEMPT_AUTHORS || '')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

// Infra PRs from people with write access skip the gate. Anything that touches
// the wall is checked for everyone, teammates included, unless a maintainer
// opts it out with the exempt label or is listed in EXEMPT_AUTHORS.
async function exemptReason(github, repo, pr, touchesEntry) {
  if ((pr.labels || []).some(l => l.name === LABEL_EXEMPT)) return `labelled \`${LABEL_EXEMPT}\``;
  if (EXEMPT_AUTHORS.includes(pr.user.login.toLowerCase())) return `by exempt maintainer @${pr.user.login}`;
  if (!touchesEntry && pr.user.type === 'Bot') return `infra PR by a bot (e.g. Dependabot)`;
  if (!touchesEntry && await canWrite(github, repo, pr.user.login)) return `infra PR by a writer`;
  return null;
}

// The account the workflow token acts as, so we only ever edit or count our
// own comments — a contributor pasting our marker can't hijack them. The
// workflow passes the App's `<slug>[bot]` login, since App tokens can't call
// /user; with a personal token we ask GitHub who we are.
let botLogin;
async function getBotLogin(github) {
  if (botLogin === undefined) {
    botLogin = process.env.BOT_LOGIN || null;
    if (!botLogin) {
      try { botLogin = (await github.rest.users.getAuthenticated()).data.login; }
      catch (e) { /* unknown — fall back to any bot account */ }
    }
  }
  return botLogin;
}

// Accounts that posted as the bot before it moved to a GitHub App. Their
// comments still count, so the switch-over doesn't duplicate checklists or
// reset the follow-up count.
const LEGACY_BOT_LOGINS = (process.env.LEGACY_BOT_LOGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

function isOurs(comment, login) {
  if (!comment.user) return false;
  if (LEGACY_BOT_LOGINS.includes(comment.user.login)) return true;
  return login ? comment.user.login === login : comment.user.type === 'Bot';
}

// Everything a run needs about *other* PRs, fetched once. The sweep reuses
// one index across the whole backlog so we don't refetch per PR.
async function buildIndex(github, repo) {
  const open = await github.paginate(github.rest.pulls.list, {
    ...repo, state: 'open', per_page: 100,
  });
  const prs = [];
  for (const p of open) {
    const { entry, patch } = await entryPatch(github, repo, p.number);
    const { added } = parsePatch(patch);
    prs.push({
      number: p.number,
      author: p.user.login,
      exempt: await exemptReason(github, repo, p, !!entry),
      fingerprint: analyzeAdditions(added.map(a => a.text)).fingerprint,
      pr: p,
    });
  }
  let baseLines = new Set();
  try {
    const { data } = await github.rest.repos.getContent({ ...repo, path: ENTRY_FILE });
    baseLines = new Set(Buffer.from(data.content, 'base64').toString('utf8')
      .split('\n').map(l => l.trim()).filter(Boolean));
  } catch (e) { /* first entry ever, or file moved */ }
  return { prs, baseLines, stargazers: await loadStargazers(github) };
}

async function ensureLabels(github, repo) {
  for (const [name, color] of Object.entries(LABEL_COLORS)) {
    try { await github.rest.issues.createLabel({ ...repo, name, color }); }
    catch (e) { /* already exists */ }
  }
}

// Swap to the label that matches the result, touching only what changed so we
// don't fire a fresh `labeled` event (and a Slack post) on every push.
async function syncLabels(github, repo, number, current, passing) {
  const want = passing ? LABEL_OK : LABEL_FAIL;
  const drop = passing ? LABEL_FAIL : LABEL_OK;
  if (current.includes(drop)) {
    try { await github.rest.issues.removeLabel({ ...repo, issue_number: number, name: drop }); }
    catch (e) { /* already gone */ }
  }
  if (!current.includes(want)) {
    await github.rest.issues.addLabels({ ...repo, issue_number: number, labels: [want] });
  }
}

async function upsertComment(github, repo, number, body) {
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...repo, issue_number: number, per_page: 100,
  });
  const login = await getBotLogin(github);
  const existing = comments.find(c => isOurs(c, login) && c.body && c.body.includes(MARKER));
  if (existing) {
    try {
      await github.rest.issues.updateComment({ ...repo, comment_id: existing.id, body });
      return;
    } catch (e) {
      // A legacy comment we may not be allowed to edit as the App — post fresh.
      if (existing.user.login === login) throw e;
      console.log(`Could not edit legacy comment ${existing.id} (${e.status}); posting a new one.`);
    }
  }
  await github.rest.issues.createComment({ ...repo, issue_number: number, body });
}

// ── Evaluate one PR ──────────────────────────────────────────────────────────

// `pr` is a pull request object (webhook payload or REST). `action` is the
// webhook action, or 'sweep' when re-checking the backlog.
async function evaluate({ github, context, core, pr, action, index }) {
  const repo = context.repo;
  const author = pr.user.login;
  const number = pr.number;

  // Non-writers are only here for the wall, so their PRs are gated even when
  // the entry landed in the wrong file.
  const { files, entry, patch } = await entryPatch(github, repo, number);
  const exempt = await exemptReason(github, repo, pr, !!entry);
  if (exempt) {
    console.log(`#${number}: ${exempt} — skipping the gate.`);
    return null;
  }

  index = index || await buildIndex(github, repo);
  const others = index.prs.filter(p => p.number !== number);

  // One PR per person: a brand-new PR from someone who already has one open is
  // closed straight away, pointing them back at the existing one.
  const mineOlder = others.filter(p =>
    p.author.toLowerCase() === author.toLowerCase() && p.number < number);
  if (action === 'opened' && mineOlder.length) {
    const keep = mineOlder[0].number;
    await github.rest.issues.createComment({
      ...repo, issue_number: number,
      body: `${MARKER}\n👋 Hey @${author} — you already have #${keep} open. ` +
        `Please push your changes to that PR's branch instead of opening a new one; ` +
        `the checks re-run on every push. Closing this one so your review stays in one place. ` +
        `See ${CONTRIB_LINK} for the full guide.`,
    });
    await github.rest.pulls.update({ ...repo, pull_number: number, state: 'closed' });
    console.log(`Closed #${number}: duplicate of open #${keep} by ${author}.`);
    return { passing: false, closed: true };
  }

  if (action === 'opened') {
    try {
      await github.rest.issues.addLabels({ ...repo, issue_number: number, labels: [LABEL_ENTRY] });
    } catch (e) { console.log(`Could not add label: ${e.message}`); }
  }

  const a = analyzePatch(patch, author);
  const hasStarred = index.stargazers.has(author.toLowerCase());
  const title = titleCheck(pr.title, author);

  // Zone: every added line strictly between the ENTRIES markers (head version).
  let zone = { status: 'skip', note: '' };
  try {
    const { data } = await github.rest.repos.getContent({
      ...repo, path: ENTRY_FILE, ref: pr.head.sha,
    });
    const headLines = Buffer.from(data.content, 'base64').toString('utf8').split('\n');
    const start = headLines.findIndex(l => l.includes('ENTRIES:START')) + 1;
    const end = headLines.findIndex(l => l.includes('ENTRIES:END')) + 1;
    if (!start || !end || start >= end) {
      zone = { status: 'fail', note: 'keep both `<!-- ENTRIES:START -->` and `<!-- ENTRIES:END -->` markers in place' };
    } else if (!a.addedLineNos.length) {
      zone = { status: 'fail', note: `no new lines in \`${ENTRY_FILE}\` — that's the only file your entry should go in` };
    } else if (a.addedLineNos.some(n => n <= start || n >= end)) {
      zone = { status: 'fail', note: 'some changes are outside the entry zone — add your entry between the markers only' };
    } else if (a.deletedContent) {
      zone = { status: 'fail', note: `this removes ${a.deletedContent} existing line(s) — only add, don't edit or delete what's there` };
    } else {
      zone = { status: 'pass' };
    }
  } catch (e) {
    console.log(`Could not fetch head content of ${ENTRY_FILE}: ${e.message}`);
  }

  // Duplicate art: same art block as another open PR, or already on the wall.
  let dupOf = null;
  if (a.fingerprint) {
    // Only the later PR is the copy — the original keeps passing.
    const twin = others.find(p => p.fingerprint === a.fingerprint && p.number < number);
    if (twin) dupOf = `#${twin.number}`;
    else if (a.artLines.every(l => index.baseLines.has(l))) dupOf = 'an entry already on the wall';
  }

  const extraFiles = files.filter(f => f.filename !== ENTRY_FILE).map(f => `\`${f.filename}\``);
  const repoLink = `[${STAR_REPO.owner}/${STAR_REPO.repo}](https://github.com/${STAR_REPO.owner}/${STAR_REPO.repo})`;
  const profileUrl = `https://github.com/${author}`;
  const ph = a.placeholders.map(p => `\`${p}\``).join(', ');

  const items = [
    {
      status: hasStarred ? 'pass' : 'fail',
      label: hasStarred ? `⭐ Starred ${repoLink}` : `⭐ **Star ${repoLink}** — required before review`,
    },
    {
      status: title.ok ? 'pass' : 'fail',
      label: 'Title follows `@your-handle: Your entry\'s title`',
      note: title.note,
    },
    {
      status: zone.status,
      label: 'Entry added between the `ENTRIES:START` / `ENTRIES:END` markers, nothing else touched',
      note: zone.note,
    },
    {
      status: a.filledIn ? 'pass' : 'fail',
      label: 'Template filled in — heading, your work, and a *What it represents* line',
      note: a.placeholders.length
        ? `replace the template text: ${ph}`
        : !a.hasHeading ? 'start your entry with a `### @you — Title` heading'
        : 'add a line after `*What it represents:*` saying what your entry shows about 169pi',
    },
    {
      status: a.attributionOk ? 'pass' : 'fail',
      label: 'Credited to you: `**Contributed by [@you](your GitHub profile)**`',
      note: a.attributedTo
        ? `the link points to \`${a.attributedTo}\` — it should be ${profileUrl}`
        : `add \`**Contributed by [@${author}](${profileUrl})**\` to your entry`,
    },
    {
      status: a.unfencedArt >= MIN_UNFENCED_ART_LINES ? 'fail' : 'pass',
      label: 'ASCII art is inside a ```` ``` ```` code fence',
      note: 'wrap your ASCII in a ```` ```text ```` … ```` ``` ```` fence — without it, GitHub turns `#` lines into headings and `*` into italics',
    },
    {
      status: a.converterLines >= MIN_CONVERTER_LINES ? 'fail' : 'pass',
      label: 'Original work — not an image run through an ASCII converter',
      note: 'this looks like a photo converted to ASCII. Make something by hand that shows a 169pi model, benchmark or idea',
    },
    {
      status: dupOf ? 'fail' : 'pass',
      label: 'Not a copy of another entry',
      note: dupOf ? `the art matches ${dupOf}` : '',
    },
    {
      status: !extraFiles.length && !a.externalAsset && !a.embeddedRaster ? 'pass' : 'fail',
      label: `Self-contained — only \`${ENTRY_FILE}\` changed; inline SVG / ASCII / Markdown, no external or embedded images`,
      note: extraFiles.length
        ? `remove ${extraFiles.join(', ')} — everything goes inline in \`${ENTRY_FILE}\``
        : a.embeddedRaster
          ? 'a base64 `data:image` is a pasted picture, not inline art — draw it as SVG/ASCII instead'
          : 'remove external images/scripts and inline your work',
    },
    {
      status: mineOlder.length ? 'fail' : 'pass',
      label: 'This is your only open PR',
      note: mineOlder.length ? `you also have #${mineOlder[0].number} open — close one of them` : '',
    },
  ];

  const failing = items.filter(i => i.status === 'fail');
  const passing = failing.length === 0;

  const renderItem = i =>
    i.status === 'pass' ? `- [x] ${i.label}`
      : i.status === 'skip' ? `- [ ] ${i.label} — couldn't auto-check, please self-confirm`
      : `- [ ] ${i.label}${i.note ? ` — ${i.note}` : ''}`;

  const firstTimer = !RETURNING.includes(pr.author_association);
  const greeting = passing
    ? (firstTimer ? `🎉 Thanks for your entry, @${author} — welcome to the wall!` : `🎉 Welcome back to the wall, @${author}!`)
    : (firstTimer ? `👋 Hey @${author}, thanks for contributing to the wall!` : `👋 Welcome back, @${author}!`);

  const statusLine = passing
    ? `**All ${items.length} checks pass.** ✅ Your entry is queued for human review at the next merge.`
    : `**${failing.length} of ${items.length} checks need fixing** before a maintainer will review this. ` +
      `Push a fix to this branch and I'll re-check automatically.\n\n` +
      `> ⏳ If this stays red, I'll follow up after ${FOLLOWUP_DAYS.join(' and ')} days. ` +
      `With no new push after that, the PR is closed — no hard feelings, just open a fresh one once it's fixed.`;

  const footer = firstTimer
    ? `New here? The full guide is in ${CONTRIB_LINK}. We review once a month — hang out on ${DISCORD_LINK} while you wait. 🧠`
    : `You know the drill — ${CONTRIB_LINK} if you need a refresher, and the crew's on ${DISCORD_LINK}. 🧠`;

  const body = [MARKER, greeting, '', statusLine, '', items.map(renderItem).join('\n'), '', footer].join('\n');

  await upsertComment(github, repo, number, body);
  await ensureLabels(github, repo);
  await syncLabels(github, repo, number, (pr.labels || []).map(l => l.name), passing);

  if (!passing && action !== 'sweep') {
    core.setFailed(`${failing.length} wall check(s) failing: ${failing.map(i => i.label).join(' | ')}`);
  }
  console.log(`#${number} by ${author}: ${passing ? 'PASS' : `FAIL (${failing.length})`}`);
  return { passing };
}

// ── Daily sweep ──────────────────────────────────────────────────────────────

async function sweep({ github, context, core, recheck, dryRun }) {
  const repo = context.repo;
  const index = await buildIndex(github, repo);
  const candidates = index.prs.filter(p => !p.exempt);

  // Daily, re-check every red PR (someone may have starred since, or the rules
  // changed); `recheck` widens that to every open PR. Comment edits don't
  // notify, and labels only change on a real flip. A dry run only re-checks
  // when asked to.
  if (recheck || !dryRun) {
    const toCheck = recheck
      ? candidates
      : candidates.filter(p => p.pr.labels.some(l => l.name === LABEL_FAIL));
    for (const p of toCheck) {
      try {
        await evaluate({ github, context, core, pr: p.pr, action: 'sweep', index });
      } catch (e) {
        core.warning(`Re-check of #${p.number} failed: ${e.message}`);
      }
    }
  }

  const now = Date.now();
  const DAY = 864e5;
  let nudged = 0, closed = 0;
  // One flaky API call shouldn't stop the rest of the backlog being handled.
  const followUp = async p => {
    const { data: fresh } = await github.rest.pulls.get({ ...repo, pull_number: p.number });
    if (fresh.state !== 'open' || !fresh.labels.some(l => l.name === LABEL_FAIL)) return;

    // The clock starts at whichever is later: being flagged, or the last push.
    // Any push resets it, so only follow-ups since then count.
    const events = await github.paginate(github.rest.issues.listEvents, {
      ...repo, issue_number: p.number, per_page: 100,
    });
    const flagged = events
      .filter(e => e.event === 'labeled' && e.label && e.label.name === LABEL_FAIL)
      .map(e => Date.parse(e.created_at));
    const commits = await github.paginate(github.rest.pulls.listCommits, {
      ...repo, pull_number: p.number, per_page: 100,
    });
    const lastCommit = commits.length
      ? Date.parse(commits[commits.length - 1].commit.committer.date) : 0;
    const since = Math.max(lastCommit, ...flagged, 0);

    const comments = await github.paginate(github.rest.issues.listComments, {
      ...repo, issue_number: p.number, per_page: 100,
    });
    const login = await getBotLogin(github);
    const followups = comments
      .filter(c => isOurs(c, login) && c.body && c.body.includes(FOLLOWUP_MARKER) &&
        Date.parse(c.created_at) > since)
      .map(c => Date.parse(c.created_at));
    const sent = followups.length;
    const redDays = (now - since) / DAY;

    // Still owed a follow-up: nudge once it's due.
    if (sent < FOLLOWUP_DAYS.length) {
      if (redDays < FOLLOWUP_DAYS[sent]) return;
      const last = sent === FOLLOWUP_DAYS.length - 1;
      console.log(`${dryRun ? '[dry run] would nudge' : 'Nudging'} #${p.number} (${sent + 1}/${FOLLOWUP_DAYS.length}) — red for ${Math.floor(redDays)}d.`);
      if (dryRun) return;
      await github.rest.issues.createComment({
        ...repo, issue_number: p.number,
        body: `${FOLLOWUP_MARKER}\n👋 @${p.author}, friendly nudge — your entry still has failing checks ` +
          `(see the checklist above), and we only review green PRs at the monthly merge. ` +
          `Push a fix to this branch and it re-checks automatically.` +
          (last
            ? `\n\n> ⏳ **Last reminder:** if there's no new push in the next ${CLOSE_DAYS_AFTER_LAST} days, ` +
              `this PR will be closed. You can always open a fresh one once it's fixed.`
            : '') +
          `\n\nStuck? Ask on ${DISCORD_LINK} — someone will help.`,
      });
      nudged++;
      return;
    }

    // Every follow-up went unanswered: close once the final grace period is up.
    const sinceLast = (now - Math.max(...followups)) / DAY;
    if (sinceLast < CLOSE_DAYS_AFTER_LAST) return;

    console.log(`${dryRun ? '[dry run] would close' : 'Closing'} #${p.number} — no push after ${sent} follow-ups.`);
    if (dryRun) return;
    await github.rest.issues.createComment({
      ...repo, issue_number: p.number,
      body: `Closing this for now, @${p.author} — the checks are still failing and there's been no new ` +
        `push since our ${sent} reminders. Nothing personal! When your entry passes the checklist, ` +
        `open a fresh PR and the bot will pick it up. Guide: ${CONTRIB_LINK} · Help: ${DISCORD_LINK}`,
    });
    await github.rest.pulls.update({ ...repo, pull_number: p.number, state: 'closed' });
    closed++;
  };
  for (const p of candidates) {
    try { await followUp(p); }
    catch (e) { core.warning(`Follow-up for #${p.number} failed: ${e.message}`); }
  }
  console.log(`Sweep done: ${candidates.length} open entry PR(s), ${nudged} nudged, ${closed} closed.`);
}

module.exports = { evaluate, sweep, analyzePatch, titleCheck, parsePatch };
