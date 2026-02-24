+++
title = "AI Didn't Replace Engineers. It Replaced the Signal."
date = 2026-02-24
draft = false
tags = ["ai", "open-source", "metaflow", "gsoc", "engineering", "evaluation"]
description = "Good code used to mean the engineer understood it. That's no longer true."
summary = "Good code used to mean the engineer understood it. That's no longer true."
ShowToc = true
+++

I'm staring at a pull request for Metaflow and I can't answer the only question that matters: what did this person actually do?

The code is clean. The tests pass. The PR description is better than most design docs I've written. It's clearly AI-assisted. But buried in the logic there's brittle string matching in a core path, a hardcoded set that will silently go stale, and validation logic that contradicts itself across two files.

These aren't bugs in the traditional sense. They're the kind of things a human catches — or at least acknowledges — the second they review their own code. Did this person review the AI's output and miss the issues? Or did they just submit what came back without reading it? I can't tell. From the artifact, both look the same.

And that's just this PR — one where the flaws are visible. The harder problem is the PRs where there are no obvious flaws at all. Every AI-assisted contribution now falls somewhere on a spectrum:

**The Architect.** Understood the problem, decided on the approach, used AI to write the code.

**The Editor.** Let AI decide the approach, then cleaned up the result.

**The Relay.** Let AI decide everything. Hit submit.

The Architect's PR and the Relay's PR are converging. As AI improves, they become indistinguishable.

We just got accepted into [Google Summer of Code](https://summerofcode.withgoogle.com/) (GSoC) for [Metaflow](https://github.com/Netflix/metaflow), and the surge of applications has forced us into a question I think every maintainer, hiring manager, and tech lead is already facing: **if everyone is using AI, how do you evaluate what the human actually understood?**

## The signal is dead

Before AI, code quality was a high-integrity signal. If a contributor submitted a clean, well-tested PR, you could safely infer they understood the system. Producing the code required building a mental model. The act of production was the proof of comprehension. We built the entire industry on that signal. Technical interviews. Take-homes. Open-source credentials. GSoC starter projects.

AI broke the link. You can now produce a well-structured solution for a codebase you've never read. The artifacts of understanding are perfectly reproducible without the understanding itself.

The people we *can* still evaluate are the ones who use AI poorly. Their PRs have obvious bugs. Their implementation doesn't match their description. Easy to spot.

Good AI users are invisible. The code is polished, the tests pass, and the maintainer is left guessing: did they understand the problem deeply, or just write a good prompt? The better someone is at using AI, the harder they are to evaluate.

This doesn't get better as models improve. It compounds.

## Why not just ask?

The first instinct: "Ask them to explain their choices in the comments."

**Anything you can ask asynchronously, they can answer with AI.**

If I ask "why string matching instead of AST parsing?", the contributor pastes my question into the same model that wrote the code. I get back a fluent, technically accurate justification. I'm not evaluating the engineer's grasp of tradeoffs. I'm evaluating an AI's ability to defend its own decisions.

With autocomplete or Stack Overflow, the last mile of integration still belonged to the human. AI removes that requirement entirely. The gap between producing an artifact and understanding it has never been wider.

Synchronous evaluation still works — in a live conversation I can probe, ask follow-ups, ask someone to modify code on the spot, watch whether they reason or reach for a tool.

But synchronous evaluation doesn't scale. It contradicts open-source contribution — someone in a different timezone submitting work without scheduling a call. It contradicts take-homes. It contradicts how distributed teams review code.

## The friction that creates engineers

Siddhant Khare [wrote about](https://siddhantkhare.com/writing/why-your-ai-agent-keeps-failing) why AI agents cause fatigue — not because the models are bad, but because there's no feedback loop. AI accelerated generation but not verification. His answer is backpressure: automated checks that catch problems before a human ever sees them.

His framework maps directly, with a twist. Without AI, development has a natural feedback loop. Write, run, break, fix, run again. Hit an edge case, refactor. Read surrounding code to understand how your change fits. The friction is the point. Comprehension is a *byproduct* — you can't finish the loop without understanding.

AI removes the friction that creates engineers. That's a problem for any evaluation, but it's an acute problem for programs like GSoC, where the entire point is that the contributor *becomes* an engineer through the process of contributing.

With AI, the loop becomes: prompt, generate, tests pass (AI wrote those too), submit. We have backpressure for correctness — linters, type systems, CI. An AI agent passes all of them without the human understanding a thing.

There is no backpressure for: did they understand the tradeoffs? Did they make deliberate choices? Would they catch it when the AI is confidently wrong?

The maintainer becomes the only person in the process guaranteed to be thinking. That breaks at scale.

## Ideas that almost work

**"Known limitations" sections.** Theory: articulating "this breaks when X because Y, and I accept that" requires understanding. Counter: "list the edge cases of this code" is one prompt.

**Decision logs with rejected alternatives.** Theory: a real decision-maker knows what they didn't choose. Counter: "list three alternatives and why each was rejected" is one prompt.

**Incremental commit history.** Theory: iteration produces many commits; AI produces one. Counter: any agent can commit incrementally.

**Attaching prompt logs.** Theory: the conversation history shows the thinking process. Counter: this turns code review into a forensics exercise. And prompt logs are just text — they can be synthesized to look like a thoughtful, iterative journey that never took place.

These aren't worthless. They raise the cost of faking, and right now the cost is zero. Actually understanding the code becomes the path of least resistance. That might be enough in practice.

But none of them verify understanding. They just force the AI to be a better storyteller. And that's a weaker foundation than what we had before, when producing the artifact *was* the verification.

## The question

Code review used to test two things at once: is the code good, and does the engineer understand the system? AI automated the first and broke the second. We have tooling for the part that's automated. Not for the part that still requires a human.

Did we ever actually evaluate understanding? Or did we just evaluate code quality and assume understanding, because good code used to require it? If AI produces correct, maintainable code — and can respond to feedback, fix bugs, iterate — maybe "understands every line" doesn't matter. Maybe the skill is now "can use AI effectively and catch when it's wrong."

I can't fully dismiss that. And if "using AI well" is the new skill, then in some sense every contribution already demonstrates it — the code works, the tests pass, the PR is coherent. The problem is that using AI well and using AI lazily produce the same output for any problem scoped enough to fit in a prompt. The skill only differentiates on the problems that are too ambiguous, too novel, or too context-dependent for the AI to handle alone. And those are exactly the problems you can't put in a starter project or a take-home.

So even if the competency has shifted, the evaluation problem remains. You're not just merging code — you're evaluating a person. For a one-off fix, maybe understanding doesn't matter as long as the code is correct. For a GSoC student you'll mentor for months, a hire, someone you're trusting with your architecture — you need to know they can handle what AI can't. Novel debugging under pressure. Reasoning in ambiguous contexts. Recognizing when the AI is confidently wrong about something subtle.

The most practical answer I can see: stop evaluating from single artifacts. Build trust through a series of smaller contributions — how someone responds to feedback, how their work evolves, whether they show up in discussions beyond their own PRs. That's how open source has always worked at its best.

But that doesn't solve the one-shot cases. Starter projects. Take-homes. First-time contributors. GSoC applications.

Maybe async evaluation of understanding is fundamentally broken. Maybe every non-trivial evaluation needs a synchronous gate. Maybe we restructure around that and accept it.

Or maybe someone has figured out something I haven't. If you're a maintainer, a hiring manager, or a tech lead evaluating engineers through artifacts — you're facing this too. How are you finding the human in the machine?

The code was never the point. The understanding was. We just didn't need to say that out loud until AI made it possible to produce one without the other.
