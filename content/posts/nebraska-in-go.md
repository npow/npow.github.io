+++
title = "Nebraska in Go"
date = 2026-03-03
draft = false
tags = ["go", "open-source", "security", "dependencies"]
description = "In npm, Nebraska is a random person. In Go, it's the people who built the language."
summary = "In npm, Nebraska is a random person. In Go, it's the people who built the language."
ShowToc = false
+++

*A followup to [Finding Nebraska](/posts/finding-nebraska/), which ran the same analysis on npm.*

---

Go's module system was designed, in part, to resist Nebraska-style accumulation. `go.mod` lists every dependency explicitly — no hidden depth, no packages arriving without anyone noticing. When you add a Go module, it shows up. This works. Amplification ratios in Go top out around 2,000× versus 10,000× in npm. The ecosystem is smaller. The Nebraska layer is smaller.

It's not zero.

---

The same method from the first post — packages where the ratio of transitive reach to direct visibility is extreme — finds 122 Go packages with the pattern. The biggest one by raw reach isn't a utility. It's a package Russ Cox wrote for a tutorial.

[`rsc.io/sampler`](https://pkg.go.dev/rsc.io/sampler)

"Package sampler shows simple texts." 86,000 codebases. 9 stars.

[`rsc.io/quote/v3`](https://pkg.go.dev/rsc.io/quote/v3)

"Package quote collects pithy sayings." 85,000 codebases. 108 stars.

These packages appear in the [official Go modules documentation](https://go.dev/blog/using-go-modules). They were the hello-world examples Russ Cox used when introducing Go modules in 2018. Developers followed the tutorial, copied the imports, shipped the code. The imports stayed. Eight years later, 85,000 production codebases depend on a package whose entire purpose is to return the sentence *"Hello, world."*

---

The rest of the top of the list looks nothing like npm.

In npm, the Nebraska maintainers are individual open-source authors — [sindresorhus](https://github.com/sindresorhus), [jonschlinkert](https://github.com/jonschlinkert) — recognizable inside the npm community, unknown to most everyone else. In Go:

| Package | Repos | Who |
|---|---|---|
| [`dmitri.shuralyov.com/gpu/mtl`](https://pkg.go.dev/dmitri.shuralyov.com/gpu/mtl) | 103K | [Dmitri Shuralyov](https://github.com/dmitshur), Go contributor |
| [`gopkg.in/errgo.v2`](https://pkg.go.dev/gopkg.in/errgo.v2) | 142K | — |
| [`rsc.io/binaryregexp`](https://pkg.go.dev/rsc.io/binaryregexp) | 102K | [Russ Cox](https://github.com/rsc), Go lead |
| [`github.com/BurntSushi/xgb`](https://pkg.go.dev/github.com/BurntSushi/xgb) | 109K | [Andrew Gallant](https://github.com/BurntSushi) |
| [`github.com/ianlancetaylor/demangle`](https://pkg.go.dev/github.com/ianlancetaylor/demangle) | 91K | [Ian Lance Taylor](https://github.com/ianlancetaylor), Go compiler |
| [`rsc.io/sampler`](https://pkg.go.dev/rsc.io/sampler) | 87K | [Russ Cox](https://github.com/rsc), Go lead |
| [`rsc.io/quote/v3`](https://pkg.go.dev/rsc.io/quote/v3) | 85K | [Russ Cox](https://github.com/rsc), Go lead |

The people whose personal packages are holding up Go infrastructure are the people who built Go.

---

Whether that's reassuring depends on what you're worried about. On one hand, these aren't strangers — they're the Google engineers who wrote the toolchain. On the other hand, `dmitri.shuralyov.com/gpu/mtl` is a personal domain. 103,000 codebases depend on a package at a URL one person controls. Go modules' content-addressed caching means existing builds survive if the domain lapses — but `go get` breaks for anyone who doesn't already have it cached.

---

There's one entry in the Go list that can't be what it appears to be.

[`github.com/jmespath/go-jmespath/internal/testify`](https://pkg.go.dev/github.com/jmespath/go-jmespath/internal/testify)

41,000 codebases "depend" on this package. The word `internal` in a Go import path is significant: the compiler enforces that packages inside `internal/` can only be imported by code within the same module. External imports are rejected at build time. Nobody imports this package — they can't.

What's happening is a data artifact. In Go, the unit of dependency is the *module* (`github.com/jmespath/go-jmespath`). When ecosyste.ms counts dependents for sub-package paths, it attributes the parent module's 41K repo count to every package within that module — including `internal/` ones that no external code can reach. The Nebraska metrics are operating at the module level, not the import level.

It's the clearest illustration of what the amplification ratio is actually measuring in Go: module-level reach, not package-level imports.

---

The comparison:

| | npm | Go |
|---|---|---|
| Nebraska packages | 2,244 | 122 |
| Combined reach | 2B | 2.6M |
| Peak amplification | ~10,000× | ~2,200× |
| Who's holding it | Individual authors | Go core team + orgs |

Go's module system does what it was designed to do. The Nebraska layer is smaller, more visible, and more institutionally backed than npm's. But the specific shape of Go's Nebraska layer — tutorial packages from the language's own lead developer, silently running in production everywhere — is something npm doesn't have.

---

*Data notes:*

- *[ecosyste.ms](https://ecosyste.ms) February 2026 dataset (13.1M packages)*
- *Go Nebraska definition: amplification ratio > 100×, present in > 5,000 repositories. Thresholds are scaled down from the npm analysis (1,000×/50K) to account for Go's smaller ecosystem and the structural effect of explicit `go.mod` declarations compressing amplification ratios.*

  `dependent_repos_count ÷ (dependent_packages_count + 1)`
- *Full data and queries: [github.com/npow/nebraska-analysis](https://github.com/npow/nebraska-analysis)*
