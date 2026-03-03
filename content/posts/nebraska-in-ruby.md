+++
title = "Nebraska in Ruby"
date = 2026-03-10
draft = true
tags = ["ruby", "open-source", "security", "dependencies"]
description = "GitHub Pages runs on Jekyll. Jekyll runs on gems. Nobody chose the gems at the bottom."
summary = "GitHub Pages runs on Jekyll. Jekyll runs on gems. Nobody chose the gems at the bottom."
ShowToc = false
+++

*Part of the Nebraska series. Previous: [Finding Nebraska](/posts/finding-nebraska/) (npm), [Nebraska in Go](/posts/nebraska-in-go/) (Go).*

---

Of all the ecosystems in this analysis, Ruby has the highest amplification ratio. Not npm. Not PHP. Ruby.

[`bindex`](https://rubygems.org/gems/bindex)

"Retrieve binding of a stack frame." 291,000 codebases. 18 stars. One maintainer.

145,628×.

---

npm's worst package reaches 10,000 codebases per direct dependent. `bindex` reaches 145,628.

The mechanism is straightforward. [`better_errors`](https://rubygems.org/gems/better_errors) is the gem that replaces Rails' default error page with something interactive — clickable stack frames, a live REPL in the browser. It depends on `bindex` to make those frames accessible. `better_errors` is a standard inclusion in Rails development environments. 291,000 repos later, the gem that retrieves stack frame bindings is running in codebases whose authors have never heard of it.

---

But `bindex` isn't the gem with the most dependent repos. That's [`sass-listen`](https://rubygems.org/gems/sass-listen).

548,000 codebases. 7 stars. 2 maintainers. 137,202×.

[`sass-listen`](https://rubygems.org/gems/sass-listen) watches the filesystem for changes to `.scss` files. It's a fork of the `listen` gem adapted for the Sass compiler. It would be an obscure utility — except GitHub launched Pages as a platform for Jekyll sites, Jekyll compiles Sass, and Sass uses `sass-listen`.

`GitHub Pages` → [`github-pages`](https://rubygems.org/gems/github-pages) → [`sass`](https://rubygems.org/gems/sass) → [`sass-listen`](https://rubygems.org/gems/sass-listen)

Every repository that enabled GitHub Pages with Jekyll got this chain. Nobody chose `sass-listen`.

---

That's the dominant pattern in Ruby's Nebraska layer: GitHub Pages as a dependency multiplier.

The [`github-pages`](https://rubygems.org/gems/github-pages) gem is a meta-gem published by GitHub that pins specific versions of Jekyll and all its dependencies. Any GitHub Pages site running Jekyll pulls it in. Several of those pinned dependencies are Nebraska blocks:

[`github-pages-health-check`](https://rubygems.org/gems/github-pages-health-check) — 327,000 repos, 81,854×. GitHub's own gem. One maintainer.

[`jekyll-swiss`](https://rubygems.org/gems/jekyll-swiss) — 319,000 repos, 79,845×. A Jekyll theme. Included whether you use it or not. Zero stars.

[`jekyll-theme-cayman`](https://rubygems.org/gems/jekyll-theme-cayman) — 319,000 repos, 79,745×. Another default theme. One maintainer. 1,311 stars — the most visible gem in the list, and still one most people would never find unless they went looking.

---

In npm, Nebraska is a product of deliberate choices: micro-packages, single-function modules, a philosophy of small composable pieces. The maintainers who ended up there built it that way.

In Ruby, the mechanism is different. GitHub Pages shipped as a platform feature and dragged millions of repos into a dependency chain nobody built or chose. The gems at the bottom of that chain had no idea it was coming.

| | npm | Ruby |
|---|---|---|
| Nebraska packages | 2,244 | 245 |
| Peak amplification | ~10,000× | ~145,628× |
| Who's holding it | Individual authors | GitHub Pages chain + individual gem authors |

The Ruby Nebraska layer is smaller than npm's in total packages and reach. But the top of the list is sharper. When a platform feature ships with 90 transitive dependencies, and each of those is held by one person, the numbers reflect that.

---

*Data notes:*

- *[ecosyste.ms](https://ecosyste.ms) February 2026 dataset (13.1M packages)*
- *Ruby Nebraska definition: amplification ratio > 1,000×, present in > 5,000 repositories.*

  `dependent_repos_count ÷ (dependent_packages_count + 1)`
- *Full data and queries: [github.com/npow/nebraska-analysis](https://github.com/npow/nebraska-analysis)*
