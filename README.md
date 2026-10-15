# 169pi · `.github`

This is the **community health repository** for the [169pi](https://github.com/169Pi)
GitHub organization. It holds the org-wide defaults GitHub picks up automatically:

- **`profile/README.md`** → the public landing page you see at
  [github.com/169Pi](https://github.com/169Pi)
- **`PULL_REQUEST_TEMPLATE.md`** → the default PR template applied across org repos
- 
### @ashishkumarjaiswal999 — 32B brain, 16 GB budget

Alpie-Core packs 32B parameters into 4-bit weights. Same brain, a quarter of the memory:

```
 32B params @ 16-bit  ≈ 64 GB  ████████████████████████████████
 32B params @  4-bit  ≈ 16 GB  ████████
                                 └─ fits on a single consumer GPU 🎉

   GSM8K 92.75%  │  MMLU 81.28%  │  SWE-Bench 57.8%
        …and it still reasons like a big model.
```

*What it represents:* open reasoning models that don't need a data center.
**Contributed by [@ashishkumarjaiswal999](https://github.com/ashishkumarjaiswal999)**
- **`.github/workflows/`** → shared automation (e.g. the star-verification bot for the
  community README contest)
- **`CONTRIBUTING.md`** → how to add your entry to the profile README

> Looking to represent something we've built at 169pi and earn swag? Head to
> [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## What lives here

| File | Purpose |
|---|---|
| [`profile/README.md`](profile/README.md) | Org profile page — hosts the community README |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Guide for adding your entry |
| [`PULL_REQUEST_TEMPLATE.md`](PULL_REQUEST_TEMPLATE.md) | Default PR checklist |
| [`.github/workflows/verify-star.yml`](.github/workflows/verify-star.yml) | Verifies PR authors have starred `169Pi/Alpie-Core` |

---

## Links

- 🌐 Website — [169pi.ai](https://169pi.ai/)
- 🧠 Flagship model — [`169Pi/Alpie-Core`](https://github.com/169Pi/Alpie-Core)
- 🤗 Weights — [huggingface.co/169Pi/Alpie-Core](https://huggingface.co/169Pi/Alpie-Core)
- 💬 Community — [Discord](https://discord.gg/GwJP7MsZp7)
