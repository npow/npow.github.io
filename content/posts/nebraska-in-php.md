+++
title = "Nebraska in PHP"
date = 2026-03-24
draft = true
tags = ["php", "open-source", "security", "dependencies"]
description = "PHPUnit tests half the PHP internet. One person maintains PHPUnit's dependencies."
summary = "PHPUnit tests half the PHP internet. One person maintains PHPUnit's dependencies."
ShowToc = false
+++

*Part of the Nebraska series. Previous: [npm](/posts/finding-nebraska/), [Go](/posts/nebraska-in-go/), [Ruby](/posts/nebraska-in-ruby/), [Rust](/posts/nebraska-in-rust/).*

---

In npm, the Nebraska layer is spread across many maintainers — [sindresorhus](https://github.com/sindresorhus) with 155 packages, [jonschlinkert](https://github.com/jonschlinkert) with 78, dozens more with smaller counts. Many people, many packages, accumulated over years.

PHP has a different shape. The Nebraska layer routes through one framework.

---

[PHPUnit](https://packagist.org/packages/phpunit/phpunit) is the dominant PHP testing framework — the one `composer require --dev phpunit/phpunit` installs, the one Laravel, Symfony, and virtually every PHP project uses to run tests.

PHPUnit depends on roughly fifteen packages with `sebastian/` in the name. [Sebastian Bergmann](https://github.com/sebastianbergmann) wrote PHPUnit. He also wrote all of them.

[`sebastian/code-unit-reverse-lookup`](https://packagist.org/packages/sebastian/code-unit-reverse-lookup) — 493,265 repos. 19,730×. 1 maintainer.

[`sebastian/resource-operations`](https://packagist.org/packages/sebastian/resource-operations) — 489,045 repos. 19,561×. 1 maintainer.

Each does exactly one thing. `code-unit-reverse-lookup` maps function names to the files that define them. `resource-operations` lists PHP functions that operate on resources. They exist because PHPUnit needed them internally. They became Nebraska because every PHP project that tests is downstream of PHPUnit.

---

[`theseer/tokenizer`](https://packagist.org/packages/theseer/tokenizer) is separate but the same story.

453,841 repos. 28,365×. Written by [Arne Blankerts](https://github.com/theseer). Also pulled in by PHPUnit. Also 1 maintainer.

PHPUnit is the funnel. The packages at the bottom of its dependency tree — none of which most PHP developers have heard of — are running in nearly half a million repos.

---

The npm comparison is instructive. sindresorhus has 155 Nebraska packages because he deliberately built utilities that way — one function, one module, share it everywhere. The micro-package philosophy created Nebraska incidentally.

Bergmann built a test framework. The framework needed internal utilities. He packaged them separately, probably for cleaner architecture. They became Nebraska because every PHP project that tests is downstream of PHPUnit, and PHPUnit is downstream of him.

| | npm | PHP |
|---|---|---|
| Nebraska packages | 2,244 | 105 |
| Peak amplification | ~10,000× | ~29,491× |
| Who's holding it | Many individual authors | Primarily Sebastian Bergmann |

PHP's Nebraska layer is smaller than npm's. The concentration is higher. In npm, sindresorhus and jonschlinkert together account for 10% of Nebraska packages. In PHP, one person's test framework internals are the layer.

---

*Data notes:*

- *[ecosyste.ms](https://ecosyste.ms) February 2026 dataset (13.1M packages)*
- *PHP Nebraska definition: amplification ratio > 500×, present in > 3,000 repositories.*

  `dependent_repos_count ÷ (dependent_packages_count + 1)`
- *Full data and queries: [github.com/npow/nebraska-analysis](https://github.com/npow/nebraska-analysis)*
