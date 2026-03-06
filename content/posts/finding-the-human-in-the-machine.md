+++
title = "Finding the Human in the Machine"
date = 2026-03-06
draft = false
tags = ["ai", "open-source", "gsoc", "engineering", "evaluation", "community"]
description = "50+ open-source orgs are rebuilding how they evaluate contributors. Here's what's emerging."
summary = "50+ open-source orgs are rebuilding how they evaluate contributors. Here's what's emerging."
ShowToc = true
+++

Recently I wrote about [AI replacing the signal](/posts/ai-replaced-the-signal/) — how code quality used to prove understanding, and AI severed that link.

Fifty-plus open-source organizations are now dealing with this, in real time, under pressure. Google Summer of Code's contributor application period is about to open, and the AI spam problem was bad enough that Google scheduled a community meeting with mentors early in the pre-application period. One organization had already withdrawn, overwhelmed by AI-generated pull requests before applications even opened.

What came out of that meeting surfaced both new complications and practical answers.

## The scale of the problem

When every contributor uses AI, how do you evaluate who actually understood the problem?

Organizations that traditionally required PRs as a qualification step are drowning. Some report 60% of incoming PRs are AI-generated spam. Contributors open hundreds of PRs across dozens of projects in days, from accounts so new and prolific that maintainers suspect some aren't even human. The Rust project has started implementing GitHub bots to flag these accounts. The PRs compile. The tests pass. The descriptions are fluent. And the contributors vanish when asked a follow-up question.

The signal didn't just degrade. For the highest-volume applicants, it inverted. The most polished PRs are now the most suspect.

## What's actually working

The most striking thing from the meeting wasn't the despair. It was the creativity. Organizations are improvising under pressure, and their approaches range from tactical filters to fundamental shifts in what evaluation means.

### Template-level filters

JabRef uses both a "negative" check (asking LLM users to include a specific word twice in their PR template) and a "positive" check (requiring a screenshot of the contributor adding an article as an author). They also delay merging PRs until the end of the proposal period, allowing multiple people to submit qualification PRs for the same issue, which removes the land-grab incentive.

These are gameable. Any published requirement eventually becomes a prompt. But they raise the cost of faking, and right now that cost is close to zero.

### Environment setup as proof of work

The Wiki Education Foundation requires before-and-after screenshots for visual changes and added a mandatory AI use disclosure section to their PR template. This forces the contributor to actually spin up the development environment.

MIT App Inventor uses "can you build and test from our repository" as the bar, because their build process is non-trivial. If it doesn't compile, you're out. PRs submitted using command-line tools that don't see the PR template get closed if the template isn't filled out.

The feedback loop of *write, run, break, fix* creates understanding as a byproduct. Requiring evidence that someone completed the loop, not just produced the artifact, reintroduces the signal.

### The magic question: "How did you test this?"

RTEMS uses a generative AI policy and asks every contributor how they tested their code. An AI can generate a plausible test plan, but explaining how you *actually* ran something — on what machine, with what data, what broke the first time — requires having done it. The specificity of real experience is hard to hallucinate. They also require contributors to build a cross toolchain and run code on a simulator as a baseline qualification, which is a caveat: LLMs are getting better at hallucinating reasonable answers to "how did you test this," but they can't fake having run a simulator.

### "What's your source?"

Several mentors found that asking contributors to link to the documentation or prior art that motivated their change is an effective filter. If someone proposes a feature: "Where did you read about this? Is it implemented in a similar project?" AI is notoriously bad at providing real sources for its reasoning. The request for provenance exposes the gap between "generated a plausible suggestion" and "identified a real need."

### Mandatory pre-communication

If you didn't talk to us before applying, you're out. Google's program lead confirmed that anyone who hasn't contacted the organization during the pre-application window is "very unlikely to be selected." This isn't new advice, but it's now the primary defense.

It works because it's a synchronous gate disguised as an async one. Real engagement in a forum thread or chat channel is hard to fake at scale. You have to respond to context, demonstrate you've read prior messages, and sustain a conversation over days. An AI agent can open a PR in seconds. Maintaining a convincing presence in a community discussion for weeks is a different problem entirely.

The Processing Foundation channels all questions through a single public Discourse thread — no DMs, no email. This makes engagement visible and verifiable. Mentors also check whether applicants are submitting to multiple projects, and whether they're more active in some than others. The pattern of engagement across organizations is itself a signal.

### Peer review as evaluation

Learning Equality is experimenting with requiring new contributors to peer-review each other's work before a mentor looks at it. It tests communication. It tests whether someone can read and reason about code they didn't write. It reveals thought process in a way that's visible to mentors without requiring their direct time. And it builds community, which is the actual point of programs like GSoC.

### Community contribution beyond code

The Processing Foundation explicitly tells contributors: if you don't see code that's ready for work, find other ways to be helpful. Answer questions in the forum. Help newcomers. Contribute to discussions. This reframes evaluation from "can you produce an artifact" to "are you part of this community" — a signal that's much harder to fake and much more predictive of long-term contribution.

They're also experimenting with an [`agents.md`](https://github.com/processing/p5.js/pull/8604) file to prompt AI agents used by contributors to adhere to community guidelines, and building a broader [contribution commons](https://github.com/SableRaf/the-contribution-commons) framework for setting rules around AI usage and disclosure.

## The complications

Not every organization has the same problem, and not every solution holds up.

MIT App Inventor has the opposite problem from most: too much engagement, not enough code. They're swamped with outreach and need people to actually write and submit working PRs. They limit contributors to two PRs in process at a time and refuse to assign issues to non-collaborators.

This reveals an asymmetry. The organizations being flooded with AI spam are the ones with low barriers to entry — "submit a PR to qualify." The ones requiring deeper engagement are drowning in messages instead. AI shifted the spam from one channel to another. The attack surface moved, but it didn't shrink.

**AI text detectors** are better than they used to be for prose (one mentor cited good results with Pangram for Wikipedia content), but reliability drops for mixed text that's been edited by a human. For code, which has less stylistic variation than natural language, they're even less useful.

**Technical hurdles alone** don't hold. The most repeated insight from the meeting: any requirement that becomes known can be automated. Once a checklist item is published, an AI agent can be instructed to satisfy it. One organization is experimenting with requiring contributors to sign a contributor agreement before getting PR access, then using GitHub's pull request permissions to lock to collaborators only. It might help block bots, but every gate you publish becomes a prompt.

## AI as multiplier vs mask

Multiple mentors reported that AI is genuinely helping their *existing* contributors — people who already understand the codebase — fix small issues and add features in hours instead of days. One mentor noted that AI helps young developers overcome self-doubt and actually start coding, rather than being paralyzed by imposter syndrome. Their Outreachy intern and several other contributors regularly use AI to understand a problem or dependency, not to solve it, but to get started.

The problem isn't AI. It's that AI made it possible to produce the artifacts of understanding without the understanding. For people who already have the understanding, AI is a multiplier. For people who don't, it's a mask.

The mentors' consensus: teach contributors the right way to use AI. When to lean on it, when to distrust it, how to verify its output. That's the new skill, and evaluating it is the actual challenge.

## Where this leaves us

Google's program lead made one thing clear: **organizations are not required to accept any contributors.** If the quality isn't there, accepting zero is fine — it won't jeopardize their return to the program. A mentor from libvirt, a first-time GSoC organization, asked this directly and got explicit confirmation. The pressure maintainers feel to review every PR and find *someone* to accept is self-imposed. The program itself says: your well-being comes first.

The deeper question extends beyond GSoC. Every strategy that's working involves repeated interaction over time. Pre-communication over weeks. Peer reviews. Community participation. Iterative PR feedback. The organizations succeeding aren't finding clever one-shot tests. They're building processes where understanding reveals itself through sustained behavior.

The community is converging on something: **shift evaluation from artifacts to relationships.** From "what did you produce" to "how did you show up."

That's harder. It's slower. It doesn't scale the way code review used to. But it might be more honest — because what we had before was never really measuring understanding either. We were measuring code quality and *assuming* understanding, because the two used to be coupled.

AI decoupled them. And now we're building signals for what we actually care about, directly, for the first time.
