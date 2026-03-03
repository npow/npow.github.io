+++
title = "Nebraska Everywhere"
date = 2026-03-31
draft = true
tags = ["open-source", "security", "dependencies"]
description = "Every package ecosystem has Nebraska. Except one."
summary = "Every package ecosystem has Nebraska. Except one."
ShowToc = false
+++

*The last post in the Nebraska series. Previous: [npm](/posts/finding-nebraska/), [Go](/posts/nebraska-in-go/), [Ruby](/posts/nebraska-in-ruby/), [Rust](/posts/nebraska-in-rust/), [PHP](/posts/nebraska-in-php/).*

---

The first post ran the Nebraska analysis on npm and found 2,244 packages. The same query on Go found 122. Then Ruby, Rust, PHP — each with the same structure: packages running in hundreds of thousands of codebases, maintained by one person, that nobody downstream had ever heard of.

Running it on every ecosystem in the [ecosyste.ms](https://ecosyste.ms) dataset covers sixteen package managers. The pattern holds in fifteen of them.

---

| Ecosystem | Nebraska packages | Peak amplification | Who's holding it |
|---|---|---|---|
| npm | 2,244 | ~10,000× | Individual authors (sindresorhus, jonschlinkert) |
| rubygems | 245 | ~145,628× | GitHub Pages chain + individual gem authors |
| cargo | 311 | ~25,672× | retep998 (Windows), proc macro authors |
| packagist | 105 | ~29,491× | Sebastian Bergmann (PHPUnit) |
| pub | 233 | ~76,317× | Google/Flutter SDK (dart-lang, flutter orgs) |
| cocoapods | 94 | ~71,526× | Facebook/Meta (React Native iOS) |
| go | 122 | ~2,214× | Go core team (Russ Cox, Ian Lance Taylor) |
| pypi | 195 | ~25,742× | Deprecated deployment packages |
| maven | 106 | ~7,686× | Facebook/Meta (React Native), Spring ecosystem |
| conda | 245 | ~2,021× | Scientific Python stack |
| hex | 38 | ~2,185× | benoitc (4 of top 5 packages) |
| nuget | 52 | ~1,201× | Microsoft + test tooling |
| clojars | 130 | ~35,997× | Clojure core team |
| bower | 206 | ~24,783× | Frozen (deprecated 2017) |
| hackage | 426 | ~368× | Testing infrastructure |
| **cran** | **0** | **~45×** | **—** |

---

A few entries deserve more than a row.

The top of the Dart/Flutter list — [`sky_engine`](https://pub.dev/packages/sky_engine) — has 228,951 dependent repos, 76,317× amplification, and 0 maintainers listed. It's Google's internal Flutter rendering engine, packaged the way Google ships everything: with no individual credited. The Dart ecosystem's Nebraska layer is Google's own SDK.

In Clojars, the top Nebraska block is [`org.clojure/clojure`](https://clojars.org/org.clojure/clojure) itself — the language runtime. 35,997×. Every Clojure project depends on the runtime, but almost no package declares it as a direct dependency because it's assumed. The amplification ratio for the runtime is nearly 36,000 because everything is downstream of it and almost nothing lists it explicitly. The language runtime is the Nebraska package.

In conda, [`pip`](https://anaconda.org/conda-forge/pip) appears at 780×. The Python package manager, inside the conda environment manager.

---

GitHub Actions warrants a separate note. [`actions/checkout`](https://github.com/actions/checkout) — 1,334,666 workflows, amplification of 1,334,666×. The number is real but the structure is different: the actions ecosystem has almost no action-to-action dependencies, so amplification equals raw reach directly. The more important point is who owns it: GitHub's own `actions/` org. The same company that runs the platform controls the most depended-on action. That's concentration, but it's a different risk profile than a single individual's npm package.

---

The one ecosystem with no Nebraska layer is R, distributed through CRAN.

CRAN's maximum amplification ratio, across all packages, is approximately 45×. No package comes close to the thousands-to-one ratios that show up everywhere else.

The reason is policy. CRAN requires packages to declare all dependencies explicitly in a `DESCRIPTION` file. The CRAN team reviews submissions and rejects packages with missing or incorrect dependency declarations. The `Depends`, `Imports`, and `Suggests` fields are enforced as a condition of being in the repository — not convention, not a linting rule, a hard gate.

The effect is a flat graph. Packages that are widely used show up widely in direct dependency lists. The implicit transitive layer that creates Nebraska doesn't accumulate.

---

The table shows ecosystems at every scale — from npm's 1.3 million packages to hackage's 10,000 — with different cultures, different tooling, different maintainer structures. Some are held by companies (Google, Facebook/Meta, Microsoft). Some by a single person (retep998, Bergmann, benoitc). Some are the language itself (Go core team, Clojure runtime). One is frozen in place because nobody maintains it anymore (Bower, deprecated 2017).

The variable that predicts whether an ecosystem has Nebraska isn't size, or age, or language. It's whether the package manager enforces explicit dependency declarations and whether someone checks.

Cargo enforces explicit `Cargo.toml` declarations — and still has 311 Nebraska blocks, because Windows platform crates end up transitive regardless of how explicit the direct layer is. Go enforces explicit `go.mod` — 122 blocks, mostly the core team's packages. CRAN enforces explicit `DESCRIPTION` files and actively reviews them — zero.

The policy works. It just has to be a policy.

---

*Data notes:*

- *[ecosyste.ms](https://ecosyste.ms) February 2026 dataset (13.1M packages)*
- *Nebraska definition varies by ecosystem to account for size and dependency model. All use the same core formula:*

  `dependent_repos_count ÷ (dependent_packages_count + 1)`
- *Per-ecosystem thresholds, full data, and queries: [github.com/npow/nebraska-analysis](https://github.com/npow/nebraska-analysis)*
