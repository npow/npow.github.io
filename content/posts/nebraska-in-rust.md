+++
title = "Nebraska in Rust"
date = 2026-03-17
draft = true
tags = ["rust", "open-source", "security", "dependencies"]
description = "Rust guarantees memory safety. One person guarantees your Windows builds."
summary = "Rust guarantees memory safety. One person guarantees your Windows builds."
ShowToc = false
+++

*Part of the Nebraska series. Previous: [npm](/posts/finding-nebraska/), [Go](/posts/nebraska-in-go/), [Ruby](/posts/nebraska-in-ruby/).*

---

Rust's selling point is guarantees. The compiler won't let you write code with data races. It won't let you use freed memory. It won't let you have dangling references. These are enforced at compile time, not convention.

The dependency graph is a different question.

---

[`winapi-x86_64-pc-windows-gnu`](https://crates.io/crates/winapi-x86_64-pc-windows-gnu) — 102,690 repos. One maintainer. 25,672×.

[`winapi-i686-pc-windows-gnu`](https://crates.io/crates/winapi-i686-pc-windows-gnu) — 102,690 repos. Same maintainer. Same ratio.

These are the architecture-specific helper crates for the `winapi` bindings — the Rust interface to the Windows API. Any crate that targets Windows needs them. Both are maintained by [retep998](https://github.com/retep998).

102,000 crates. Both Windows architectures. One person.

---

The rest of the top of the Rust list is proc macro helpers.

Proc macros are how Rust implements compile-time code generation. They run at build time, have access to the full compiler API, and produce code that becomes part of your binary. A proc macro with a malicious update isn't a runtime vulnerability. It runs when you compile.

[`wasm-bindgen-macro`](https://crates.io/crates/wasm-bindgen-macro) — 54,075 repos, 18,025×. The procedural macro that makes `wasm-bindgen` work. 2 maintainers.

[`proc-macro-error-attr`](https://crates.io/crates/proc-macro-error-attr) — 35,623 repos, 17,811×. An attribute macro used by proc macro authors for better compile-time error reporting. 1 maintainer. 14 stars.

`proc-macro-error-attr`. 14 stars. 35,000 repos.

---

Microsoft also appears in the list. [`windows_i686_gnu`](https://crates.io/crates/windows_i686_gnu) — 56,593 repos, 14,148×. Part of Microsoft's official `windows-rs` crate family, the modern replacement for `winapi`. 1 maintainer listed.

Two separate Windows API ecosystems — the community-built `winapi` by retep998 and Microsoft's official `windows-rs` — both appear in the Rust Nebraska layer. The Windows build chain for Rust runs through two different sets of packages, each held by one person or one listed maintainer.

---

The Rust Nebraska layer has 311 blocks. The amplification ratios are high because Cargo's explicit `Cargo.toml` declarations compress ratios for packages people knowingly choose — the same effect as Go's `go.mod`. What surfaces are the packages nobody wrote down.

| | npm | Rust |
|---|---|---|
| Nebraska packages | 2,244 | 311 |
| Peak amplification | ~10,000× | ~25,672× |
| Who's holding it | Individual authors | retep998 (Windows), proc macro authors |

The compiler will tell you about a data race. It won't tell you that your Windows build chain runs through one maintainer's two crates.

---

*Data notes:*

- *[ecosyste.ms](https://ecosyste.ms) February 2026 dataset (13.1M packages)*
- *Rust Nebraska definition: amplification ratio > 500×, present in > 2,000 repositories.*

  `dependent_repos_count ÷ (dependent_packages_count + 1)`
- *Full data and queries: [github.com/npow/nebraska-analysis](https://github.com/npow/nebraska-analysis)*
