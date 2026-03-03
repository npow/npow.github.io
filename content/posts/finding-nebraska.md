+++
title = "Finding Nebraska"
date = 2026-03-03
draft = false
tags = ["npm", "javascript", "open-source", "security", "dependencies"]
description = "Every JavaScript project runs packages no one on the team chose. Most are maintained by one person. I went looking for them."
summary = "Every JavaScript project runs packages no one on the team chose. Most are maintained by one person. I went looking for them."
ShowToc = false
+++

[![xkcd 2347: Dependency](https://imgs.xkcd.com/comics/dependency.png)](https://xkcd.com/2347/)

I went looking for them.

---

Your package.json lists maybe 50 dependencies. Each of those has its own dependencies. Each of those has more. By the time you're four or five hops deep, there are hundreds of transitive dependencies running in your codebase that nobody on your team has ever heard of — packages you've never audited, never thought about, and would have no idea how to replace if something went wrong.

The packages at the very bottom of those chains are the interesting ones. Everything eventually depends on them, which means a bug, an abandoned maintainer, or a malicious update ripples upward through the entire stack. But because no one lists them directly, most teams have no idea they're running them — which means a CVE alert, if one comes, often lands on people who don't even know they're affected.

That's Nebraska.

---

So how do you find them? I took ecosyste.ms — which indexes packages and their dependencies across every major ecosystem — and asked one question for every package: how many codebases are actually running this, versus how many packages explicitly list it as a dependency?

If those numbers are close, the package is visible — people know they depend on it. If there are thousands of codebases running it for every one that lists it, it's a transitive dependency that arrived through the chain, not through anyone's conscious choice.

What's at the bottom of those chains?

---

**`jest` → `micromatch` → `fill-range` → `to-regex-range`.** One of the most widely used JavaScript test frameworks, four hops down, ends at a package that turns number ranges into regexes. 5.3 million codebases. 171 stars. 2,203 packages list it directly.

**`webpack-dev-server` → `spdy` → `hpack.js`.** The long-dominant JavaScript dev server bottoms out at the HTTP/2 header compression algorithm. 2.9 million codebases. 41 stars.

**`sockjs-client` → `faye-websocket` → `websocket-driver` → `websocket-extensions`.** WebSocket compression, used by socket.io and realtime libraries built on it. 3 million codebases. 70 stars.

**`express` → `send` → `fresh`.** Every Node.js web server built on Express, three hops down, ends at the HTTP cache freshness check — the 15-line function that decides whether to return a 304 Not Modified. 5 million codebases. 163 stars.

---

Four chains, totally independent parts of the stack. All of them end at the same place: a package running silently in millions of codebases that almost no one has ever deliberately chosen to depend on.

How many packages like this are there? I queried the full dataset for that pattern — high reach, low direct visibility — and found **2,244 of them in npm alone**. **1,228 of them — more than half — have exactly one npm maintainer. One person who can push a new version.** A 2020 snapshot found 502. Some of the old ones fell off — when `request` was deprecated that year, the packages at the bottom of its chain (`bcrypt-pbkdf`, `sshpk`, `aws4`, each running in 600K+ repos) collapsed to under 10K as the ecosystem migrated to `node-fetch` and `axios`. The rest grew. Most of the 1,873 new entries aren't new packages — `fresh`, `send`, `etag`, `finalhandler` have been in Node.js HTTP servers for over a decade. They crossed the Nebraska threshold as Node.js deployment scaled. They were always load-bearing. The data just got detailed enough to see it.

---

So who are they?

| Maintainer | Nebraska packages | Codebases reached (combined) |
|---|---|---|
| sindresorhus | **155** | 217M |
| jonschlinkert | **78** | 110M |
| wooorm | 35 | 12M |
| kevva | 29 | 12M |
| isaacs | 24 | 34M |
| ljharb | 21 | 21M |
| mafintosh | 19 | 18M |

*"Codebases reached" sums each package's dep_repos_count; the same codebase is counted once per package it transitively contains.*

**sindresorhus** has 155 Nebraska packages. `to-fast-properties`, `merge-descriptors`, `is-wsl`, `array-union`, `import-fresh`, `code-point-at` — dozens of small focused utilities, each running in 2–5 million codebases independently. His largest packages each individually reach more codebases than the entire npm Nebraska layer did in 2020.

**jonschlinkert** took the same approach: instead of one utility library, dozens of single-function packages. `fill-range`, `isobject`, `for-in`, `repeat-string` — 78 packages, each running in millions of codebases. 110 million combined.

The micro-package philosophy — one file, one function, swap it out whenever — was a deliberate design choice, not an accident. The tradeoff is that the dependency graph becomes a web of tiny nodes, each one a potential point of failure, and most of them invisible to the projects running them.

---

These 2,244 packages span every layer of the JavaScript stack — dev tools, runtime utilities, HTTP plumbing, cryptographic primitives. The concentration is modest: sindresorhus and jonschlinkert together account for 10% of them. But the pattern holds across the whole list: most Nebraska blocks have one person who can push a new version, and most of the millions of projects running them have no idea who that is.

---

*2026 data: ecosyste.ms February 2026 dataset (13.1M packages). 2020 data: Libraries.io v1.6.0 (4.6M packages, January 2020). Nebraska block definition: amplification ratio > 1,000× (dependent_repos_count ÷ (dependent_packages_count + 1)), present in > 50,000 repositories. Excludes @babel/, @jest/, @types/, workbox-, and similar large-org sub-package families. dep_repos_count / dependent_repos_count measures transitive reach: a package used only at the bottom of chains shows 1,000–10,000×; a universally direct dependency like lodash shows ~10×. "Codebases reached" in the maintainer table is the sum of dependent_repos_count across packages — the same codebase is counted once per Nebraska package it transitively contains. Sensitivity analysis across 36 threshold combinations (amplification 500×–5000×, repos 25K–100K) on the 2020 dataset confirms concentration finding is not threshold-dependent.*
