# 🤝 Contributing to 169pi

👋 Hey — glad you're here.

The [profile/README.md](profile/README.md) on our org page isn't ours. It's a
space we've set aside for the people building alongside us. The
**[Make this README yours](profile/README.md#-make-this-readme-yours)** section
is where you can plant a flag, in whatever form feels like *you*, using
anything we've built at **169pi** as your reference point — a model, a
benchmark, a capability, a design decision.

Looking to contribute code, weights, or benchmarks? Head to the model repo
itself — currently [`169Pi/Alpie-Core`](https://github.com/169Pi/Alpie-Core).

---

## 💡 The idea

169pi builds open reasoning tools out of India. Right now that means
Alpie-Core — a 4-bit reasoning model that punches above its weight — and there
are more models and features on the way. Pick anything we've shipped that
resonates with you and turn *that* into something worth signing. The math
behind quantization, a benchmark you find striking, the vibe of a small model
doing big-model work, a design choice you noticed — your call.

In short - make your dent on our wall.

### 🎯 What we're looking for

We want the wall to feel like a portfolio of people, not a scroll of snippets.
So we hold entries to the standard of work you'd link from your own
site. Plain-text one-liners, generic haikus, and copy-paste code won't make it
in — not because they're "bad," but because they don't showcase you.

Well-executed entries tend to look like:

- **Custom SVG art or a hero image** — inline, light/dark-aware, made by you
- **A diagram that teaches something** — how 4-bit quantization preserves
  reasoning, how the context window compares, and so on. Mermaid, ASCII, or
  hand-drawn SVG all welcome, as long as it *explains* rather than just decorates
- **A benchmark visualization** — GSM8K, MMLU, SWE-Bench rendered as a chart,
  not just numbers in a table
- **A runnable micro-demo** — a short, self-contained snippet that computes,
  simulates, or visualises a real property of the model and prints something
  delightful
- **Structured ASCII art** — multi-line, drawn by you, actually depicting
  something (the model, a curve, a metaphor), inside a ```` ``` ```` code fence.
  Photos run through an image→ASCII converter don't count
- **Writing with a visual layout** — a poem, story, or metaphor where the
  formatting, typography, and imagery carry as much weight as the words
- **Something we haven't imagined yet** — surprise us

If your entry could be described in one sentence and nothing would be lost,
it's not there yet.

---

## 🛠️ How to add yours — in 5 steps

1. ⭐ **Star** [`169Pi/Alpie-Core`](https://github.com/169Pi/Alpie-Core)
   *(a bot checks this — we like knowing who's on the wall)*
2. 💬 **Join** our [Discord](https://discord.gg/GwJP7MsZp7) — this is
   where the community actually hangs out, and where we celebrate merges
3. 🍴 **Fork** this repo *(button, top-right of the GitHub page)*
4. ✍️ **Add your entry** to [`profile/README.md`](profile/README.md) between the
   `<!-- ENTRIES:START -->` and `<!-- ENTRIES:END -->` markers in the
   **Make this README yours** section — newest entries go at the top, right under
   `ENTRIES:START`. Don't touch anything outside those markers
5. 🚀 **Open a PR** titled `@your-github-handle: Your entry's title`
   (e.g. `@ada-lovelace: A tiny quantization diagram`)

We review every two weeks. When your PR merges, we'll ship you **169pi swag**
as a thank-you 🎁 — and shout you out on Discord.

New to our work? Poke around
[169pi on GitHub](https://github.com/169Pi) first — the wall works best when
your entry reflects something you actually connected with.

---

## 📝 Entry format

Add your entry as its own block **between the `<!-- ENTRIES:START -->` and
`<!-- ENTRIES:END -->` markers**, at the top of the list. Copy this template,
replace `your-github-handle` and `Your entry's title`, and fill in each
`<!-- … -->` comment:

````markdown
### @your-github-handle — Your entry's title

<!-- Replace this comment with your work: inline SVG, a diagram, Markdown,
     or ASCII art inside a ``` code fence. -->

*What it represents:* <!-- one line on the 169pi model, capability, or feature this shows -->
**Contributed by [@your-github-handle](https://github.com/your-github-handle)**
<!-- Optional — in a club? Uncomment: **Club:** Your Club Name -->
<!-- Optional — want to be found? Uncomment: *Find me:* your site or socials -->
````

The **Contributed by** line is required — it's how you get publicly credited on
the wall. Link it to **your own GitHub profile** (the account opening the PR).

The **Club** line is optional — include it only if you're contributing as part of a
club, campus group, or meetup. When you do, every member's PR counts toward your club
on the live **[Clubs Leaderboard](https://goodfirst.alpie.ai/leaderboard)**, and the
top club wins prizes. Contributing on your own? Leave it out — nothing about the wall
requires a club.

Keep entries self-contained — no external images that could break, no scripts,
no tracking pixels, no image files or base64 `data:image` pictures. Inline SVG,
ASCII, Markdown, and plain code fences are ideal.

---

## 🤖 What the bot checks

Every PR gets a checklist comment that updates on each push. A maintainer only
looks at your entry once **every item is green** — until then the PR is labelled
`needs-changes` and the check fails.

- ⭐ You've starred [`169Pi/Alpie-Core`](https://github.com/169Pi/Alpie-Core)
- The PR title is `@your-handle: Your entry's title` (your own handle, no `< >`)
- Only `profile/README.md` changed, and only between the `ENTRIES` markers —
  nothing existing edited or deleted
- The template is filled in: no leftover template text, and a real
  *What it represents* line
- **Contributed by** links to the GitHub account that opened the PR
- ASCII art sits inside a ```` ``` ```` code fence (otherwise GitHub turns `#`
  lines into headings and the art falls apart)
- It isn't a photo run through an image→ASCII converter
- It isn't a copy of another open PR or an entry already on the wall
- It's self-contained — no extra files, external images, or embedded pictures
- It's your only open PR

**To fix a failing check, push to the same branch** — don't open a new PR (a
second PR from you is closed automatically). If your PR stays red, the bot
follows up **3 and 7 days** after your last push; if there's still no new push
**3 days after the final reminder**, the PR is closed. Every push resets the
clock, and once it's fixed you can always open a fresh one.

---

## 📋 Ground rules

- Your entry must be **original** — your own work, or clearly attributed.
- It must genuinely reflect **something real about 169pi** — a model,
  capability, benchmark, or feature we've shipped — so the wall stays coherent.
- Be **respectful and inclusive**. No harassment, slurs, or targeted content.
  We follow the [Contributor Covenant](https://www.contributor-covenant.org/)
  spirit.
- One open PR per person at a time — put your best foot forward, and push
  fixes to that same PR.
- Star + Discord are how we know who's on the wall; we're not chasing metrics,
  we're building a room.
- Entries stay in the repo permanently. As the wall grows, older ones may
  rotate out of the visible section, but nothing gets deleted — git history
  keeps every signature.

---

## 🗓️ Review cadence

**Bi-weekly merges.** Next merge: **October 6, 2026**.
Get your PR in before then to be on the next drop.

---

## 🤔 Questions?

Stuck on your entry, the setup, or just what to build?

- 🧭 **Docs & guides:** [goodfirst.alpie.ai](https://goodfirst.alpie.ai)
- 🤖 **Ask Alpie:** [Alpie.ai](https://alpie.ai) — our own model can walk you through it
- 💬 **Talk to a human:** [Discord](https://discord.gg/GwJP7MsZp7)
- 🐛 **Bug or repo issue:** open an [issue](../../issues)
- 🌐 [169pi.ai](https://169pi.ai/)

Happy hacking. 🧠
