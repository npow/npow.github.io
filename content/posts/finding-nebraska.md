+++
title = "Finding Nebraska"
date = 2026-03-03
draft = false
tags = ["npm", "javascript", "open-source", "security", "dependencies"]
description = "The xkcd comic shows one person in Nebraska holding up the internet. Who is it?"
summary = "The xkcd comic shows one person in Nebraska holding up the internet. Who is it?"
ShowToc = false
+++

![xkcd 2347: Dependency](https://imgs.xkcd.com/comics/dependency.png)

*[xkcd #2347](https://xkcd.com/2347/)*

I went looking for them.

---

Your package.json lists maybe 50 dependencies. Each of those has its own dependencies. Each of those has more. By the time you're four or five hops deep, there are hundreds of transitive dependencies running in your codebase that nobody on your team has ever heard of — packages you've never audited, never thought about, and would have no idea how to replace if something went wrong.

The packages at the very bottom of those chains are the interesting ones. Everything eventually depends on them, which means a bug, an abandoned maintainer, or a malicious update ripples upward through the entire stack. But because no one lists them directly, most teams have no idea they're running them — which means a CVE alert, if one comes, often lands on people who don't even know they're affected.

That's Nebraska.

---

So how do you find them? I took [ecosyste.ms](https://ecosyste.ms) — which indexes packages and their dependencies across every major ecosystem — and asked one question for every package: how many codebases are actually running this, versus how many packages explicitly list it as a dependency?

If those numbers are close, the package is visible — people know they depend on it. If there are thousands of codebases running it for every one that lists it, it's a transitive dependency that arrived through the chain, not through anyone's conscious choice.

What's at the bottom of those chains?

---

[`jest`](https://www.npmjs.com/package/jest) → [`micromatch`](https://www.npmjs.com/package/micromatch) → [`fill-range`](https://www.npmjs.com/package/fill-range) → [`to-regex-range`](https://www.npmjs.com/package/to-regex-range)

One of the most widely used JavaScript test frameworks, four hops down, ends at a package that turns number ranges into regexes. 5.3 million codebases. 171 stars. 2,203 packages list it directly.

[`webpack-dev-server`](https://www.npmjs.com/package/webpack-dev-server) → [`spdy`](https://www.npmjs.com/package/spdy) → [`hpack.js`](https://www.npmjs.com/package/hpack.js)

The long-dominant JavaScript dev server bottoms out at the HTTP/2 header compression algorithm. 2.9 million codebases. 41 stars.

[`sockjs-client`](https://www.npmjs.com/package/sockjs-client) → [`faye-websocket`](https://www.npmjs.com/package/faye-websocket) → [`websocket-driver`](https://www.npmjs.com/package/websocket-driver) → [`websocket-extensions`](https://www.npmjs.com/package/websocket-extensions)

WebSocket compression, used by socket.io and realtime libraries built on it. 3 million codebases. 70 stars.

[`express`](https://www.npmjs.com/package/express) → [`send`](https://www.npmjs.com/package/send) → [`fresh`](https://www.npmjs.com/package/fresh)

Every Node.js web server built on Express, three hops down, ends at the HTTP cache freshness check — the 15-line function that decides whether to return a 304 Not Modified. 5 million codebases. 163 stars.

---

Four chains, totally independent parts of the stack. All of them end at the same place: a package running silently in millions of codebases that almost no one has ever deliberately chosen to depend on.

How many packages like this are there? I queried the full dataset for that pattern — high reach, low direct visibility — and found **2,244 of them in npm alone**. **1,228 of them — more than half — have exactly one npm maintainer. One person who can push a new version.**

In 2020, the same analysis found 502. Some have since fallen off — when [`request`](https://www.npmjs.com/package/request) was deprecated, the packages at the bottom of its chain ([`bcrypt-pbkdf`](https://www.npmjs.com/package/bcrypt-pbkdf), [`sshpk`](https://www.npmjs.com/package/sshpk), [`aws4`](https://www.npmjs.com/package/aws4), each running in 600K+ repos) collapsed to under 10K as the ecosystem migrated to [`node-fetch`](https://www.npmjs.com/package/node-fetch) and [`axios`](https://www.npmjs.com/package/axios).

Most of the 1,873 new entries aren't new packages. [`fresh`](https://www.npmjs.com/package/fresh), [`send`](https://www.npmjs.com/package/send), [`etag`](https://www.npmjs.com/package/etag), [`finalhandler`](https://www.npmjs.com/package/finalhandler) have been in Node.js HTTP servers for over a decade. They crossed the Nebraska threshold as Node.js deployment scaled. They were always load-bearing. The data just got detailed enough to see it.

---

So who are they?

| Maintainer | Nebraska packages | Codebases reached (combined) |
|---|---|---|
| [sindresorhus](https://github.com/sindresorhus) | **155** | 217M |
| [jonschlinkert](https://github.com/jonschlinkert) | **78** | 110M |
| [wooorm](https://github.com/wooorm) | 35 | 12M |
| [kevva](https://github.com/kevva) | 29 | 12M |
| [isaacs](https://github.com/isaacs) | 24 | 34M |
| [ljharb](https://github.com/ljharb) | 21 | 21M |
| [mafintosh](https://github.com/mafintosh) | 19 | 18M |

*"Codebases reached" sums each package's dep_repos_count; the same codebase is counted once per package it transitively contains.*

**[sindresorhus](https://github.com/sindresorhus)** has 155 Nebraska packages. [`to-fast-properties`](https://www.npmjs.com/package/to-fast-properties), [`merge-descriptors`](https://www.npmjs.com/package/merge-descriptors), [`is-wsl`](https://www.npmjs.com/package/is-wsl), [`array-union`](https://www.npmjs.com/package/array-union), [`import-fresh`](https://www.npmjs.com/package/import-fresh), [`code-point-at`](https://www.npmjs.com/package/code-point-at) — dozens of small focused utilities, each running in 2–5 million codebases independently. His largest packages each individually reach more codebases than the entire npm Nebraska layer did in 2020.

**[jonschlinkert](https://github.com/jonschlinkert)** took the same approach: instead of one utility library, dozens of single-function packages. [`fill-range`](https://www.npmjs.com/package/fill-range), [`isobject`](https://www.npmjs.com/package/isobject), [`for-in`](https://www.npmjs.com/package/for-in), [`repeat-string`](https://www.npmjs.com/package/repeat-string) — 78 packages, each running in millions of codebases. 110 million combined.

The micro-package philosophy — one file, one function, swap it out whenever — was a deliberate design choice, not an accident. The tradeoff is that the dependency graph becomes a web of tiny nodes, each one a potential point of failure, and most of them invisible to the projects running them.

---

These 2,244 packages span every layer of the JavaScript stack — dev tools, runtime utilities, HTTP plumbing, cryptographic primitives. The concentration is modest: sindresorhus and jonschlinkert together account for 10% of them. But the pattern holds across the whole list: most Nebraska blocks have one person who can push a new version, and most of the millions of projects running them have no idea who that is.

---

*Data notes:*

- *2026: [ecosyste.ms](https://ecosyste.ms) February 2026 dataset (13.1M packages)*
- *2020: Libraries.io v1.6.0 (4.6M packages, January 2020)*
- *Nebraska block definition: amplification ratio > 1,000×, present in > 50,000 repositories. Excludes @babel/, @jest/, @types/, workbox-, and similar large-org sub-package families.*

  `dependent_repos_count ÷ (dependent_packages_count + 1)`
- *Amplification measures transitive reach: a package only at the bottom of chains shows 1,000–10,000×; a universally direct dependency like lodash shows ~10×.*
- *"Codebases reached" sums dep_repos_count across packages — the same codebase is counted once per Nebraska package it transitively contains.*
- *Sensitivity analysis across 36 threshold combinations (500×–5000×, 25K–100K repos) on the 2020 dataset confirms the concentration finding is not threshold-dependent.*
