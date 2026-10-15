
# 👋 Hey, you found us!

We're **169pi** — building open reasoning models out of India.
This is our org profile; the good stuff lives across our repos and model hubs.

<p align="center">
  <a href="https://github.com/169Pi/Alpie-Core" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/github/stars/169Pi/Alpie-Core?style=social&label=Star%20Alpie-Core" alt="Star Alpie-Core"></a>
  <a href="https://discord.gg/GwJP7MsZp7" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Discord-Join%20us-5865F2?logo=discord&logoColor=white" alt="Join our Discord"></a>
  <a href="https://169pi.ai/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/🌐%20Website-169Pi%20AI-blue" alt="Website"></a>
  <a href="https://huggingface.co/169Pi/Alpie-Core" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/🤗-Hugging%20Face-yellow" alt="Hugging Face"></a>
  <a href="https://ollama.com/169pi" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/🦙-Ollama-000000" alt="Ollama"></a>
  <a href="https://www.kaggle.com/169pi" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/📊-Kaggle-20BEFF?logo=kaggle&logoColor=white" alt="Kaggle"></a>
</p>

---

## 🧠 Alpie-Core

Our first-generation reasoning model — **32B params, 4-bit**, Apache 2.0.

| GSM8K | MMLU | SWE-Bench Verified | Context Length | VRAM |
|---|---|---|---|---|
| **92.75%** | **81.28%** | **57.8%** | 65K | ~16 GB |

---

## 🎨 Make this README yours

Pick anything we've built at 169pi — a model, a capability, a benchmark — and
turn it into something that belongs on our front door: art, a diagram, a demo,
a visualization. **Merged PRs get exclusive 169pi swag. 🎁**

> 🗓️ **Monthly merges.** Next merge: **November 6, 2026**.
> Get your PR in before then to qualify → **[CONTRIBUTING.md](../CONTRIBUTING.md)**

> 🏫 **Contributing with a club, campus group or meetup?** Add one line —
> `**Club:** Your Club Name` — to your entry below (and to your PR description). Every
> member's PR then counts toward your club on the live
> **[Clubs Leaderboard](https://goodfirst.alpie.ai/leaderboard)**, and the top club wins prizes.
>
> **Flying solo? Ignore this — just add your entry. No club required.** 🧱

<!-- ────────────────────────────────────────────────────────────────── -->
<!-- ✍️  ADD YOUR ENTRY BELOW — put it between the two ENTRIES markers.   -->
<!--     Newest entries go at the TOP, right under ENTRIES:START.        -->
<!--     Don't edit anything outside the markers. Attribution required:  -->
<!--     end your block with `**Contributed by [@handle](profile URL)**`. -->
<!--     ASCII art goes inside a ``` code fence, or it won't render.    -->
<!--     A bot checks all of this on every push — see CONTRIBUTING.md.  -->
<!--     In a club? Add an optional `**Club:** Your Club Name` line too.  -->
<!--     Contributing on your own? Ignore it — no club needed.           -->
<!-- ────────────────────────────────────────────────────────────────── -->

<!-- ENTRIES:START -->

### @deepanshu12tt — Alpie-Core Inference and KV-Cache

<svg width="100%" viewBox="0 0 1200 780" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alpie-Core inference and KV-cache visualization">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
    <style>
      .title { font: 700 30px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #f8fafc; }
      .label { font: 600 18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #e2e8f0; }
      .small { font: 500 15px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #cbd5e1; }
      .tiny { font: 500 13px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; fill: #94a3b8; }
      .box { fill: #1e293b; stroke: #475569; stroke-width: 2; rx: 14; }
      .cache { fill: #172554; stroke: #6366f1; stroke-width: 2; rx: 14; }
      .arrow { stroke: #94a3b8; stroke-width: 2.5; fill: none; marker-end: url(#arrowhead); }
      .accent-line { stroke: url(#accent); stroke-width: 3; fill: none; marker-end: url(#arrowhead); }
    </style>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/>
    </marker>
  </defs>

  <rect width="1200" height="780" rx="24" fill="url(#bg)"/>

  <text x="60" y="62" class="title">Alpie-Core Inference &amp; KV-Cache</text>
  <text x="60" y="91" class="small">Conceptual view of autoregressive transformer inference</text>

  <rect x="60" y="135" width="180" height="86" class="box"/>
  <text x="150" y="170" text-anchor="middle" class="label">User Prompt</text>
  <text x="150" y="198" text-anchor="middle" class="small">Input tokens</text>

  <path d="M240 178 H300" class="arrow"/>

  <rect x="300" y="135" width="180" height="86" class="box"/>
  <text x="390" y="170" text-anchor="middle" class="label">Tokenization</text>
  <text x="390" y="198" text-anchor="middle" class="small">Tokens → IDs</text>

  <path d="M480 178 H540" class="arrow"/>

  <rect x="540" y="135" width="180" height="86" class="box"/>
  <text x="630" y="170" text-anchor="middle" class="label">Embeddings</text>
  <text x="630" y="198" text-anchor="middle" class="small">Token vectors</text>

  <path d="M720 178 H780" class="arrow"/>

  <rect x="780" y="125" width="320" height="106" class="box"/>
  <text x="940" y="164" text-anchor="middle" class="label">Transformer Layers</text>
  <text x="940" y="192" text-anchor="middle" class="small">Attention + feed-forward blocks</text>
  <text x="940" y="215" text-anchor="middle" class="tiny">Repeated across model depth</text>

  <path d="M940 231 V280" class="arrow"/>

  <rect x="70" y="285" width="430" height="190" class="cache"/>
  <text x="285" y="320" text-anchor="middle" class="label">Attention — Conceptual View</text>

  <rect x="95" y="350" width="105" height="58" class="box"/>
  <text x="147" y="375" text-anchor="middle" class="small">Current</text>
  <text x="147" y="395" text-anchor="middle" class="small">token</text>

  <path d="M200 379 H235" class="accent-line"/>

  <rect x="235" y="335" width="105" height="102" class="box"/>
  <text x="287" y="365" text-anchor="middle" class="small">Query</text>
  <text x="287" y="390" text-anchor="middle" class="tiny">Q</text>
  <text x="287" y="414" text-anchor="middle" class="tiny">current state</text>

  <rect x="365" y="335" width="110" height="102" class="box"/>
  <text x="420" y="365" text-anchor="middle" class="small">KV Cache</text>
  <text x="420" y="390" text-anchor="middle" class="tiny">K + V</text>
  <text x="420" y="414" text-anchor="middle" class="tiny">prior states</text>

  <path d="M340 379 H365" class="accent-line"/>

  <text x="285" y="458" text-anchor="middle" class="tiny">Q × Kᵀ → attention weights → weighted context</text>

  <rect x="570" y="285" width="530" height="190" class="box"/>
  <text x="835" y="320" text-anchor="middle" class="label">Why the KV Cache Matters</text>

  <text x="600" y="355" class="small">Without cache</text>
  <text x="600" y="380" class="tiny">Previously computed K/V states are recomputed.</text>

  <text x="600" y="420" class="small">With cache</text>
  <text x="600" y="445" class="tiny">Previously computed K/V states can be reused</text>
  <text x="600" y="465" class="tiny">while generating the next token.</text>

  <path d="M940 475 V525" class="arrow"/>

  <rect x="350" y="530" width="500" height="92" class="box"/>
  <text x="600" y="565" text-anchor="middle" class="label">Next-Token Prediction</text>
  <text x="600" y="595" text-anchor="middle" class="small">Logits → decoding → next token</text>

  <path d="M850 576 H1040 V645 H160 V576 H350" class="accent-line"/>

  <rect x="350" y="665" width="500" height="60" class="cache"/>
  <text x="600" y="702" text-anchor="middle" class="small">Update KV Cache → repeat for the next token</text>
</svg>

*What it represents:* how a transformer processes tokens autoregressively and reuses cached Key/Value states during generation.

**Contributed by [@deepanshu12tt](https://github.com/deepanshu12tt)**

### @169pi — the first brick 🧱

This wall is yours to build on. Fork the repo, add your entry right here, and
open a PR — see **[CONTRIBUTING.md](../CONTRIBUTING.md)** for the 5-step guide.

*What it represents:* the open, collaborative spirit behind everything at 169pi.
**Contributed by [@169pi](https://github.com/169Pi)**

<!-- ENTRIES:END -->

---

<p align="center">
  Made with curiosity by the <strong>169pi</strong> team
</p>
