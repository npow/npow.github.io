+++
title = "Does Caveman Mode Actually Work?"
date = 2026-04-20
draft = false
tags = ["ai", "llm", "benchmarks", "cost", "claude", "prompt-engineering"]
description = "Caveman mode can cut the cost of long Opus 4.6 responses, but it often loses to a two-word concise instruction on shorter tasks."
ShowToc = true
+++

[Caveman](https://github.com/JuliusBrussee/caveman) is a Claude plugin that asks the model to answer in terse fragments. Does it save money? Sometimes—mostly when the model would otherwise produce a very long answer.

I compared Caveman’s lite, full, ultra, and wenyan modes with two baselines: no added instruction and “Answer concisely.” The benchmark covered 15 prompts, three runs per condition, and two Claude Opus models. I measured token cost, not answer quality.

| Model and task | Caveman cost vs. concise |
|---|---|
| Claude Opus 4.7, short | Lite +10%; Full +3%; Ultra +3%; Wenyan +10% |
| Claude Opus 4.7, long | Lite +9%; Full +10%; Ultra −5%; Wenyan −1% |
| Claude Opus 4.6, short | All modes: 3–16% less; uncertain |
| Claude Opus 4.6, long | Lite −54%; Full −56%; Ultra −59%; Wenyan −58% |

Positive numbers mean higher cost; negative numbers mean savings. The practical rule: **Caveman has to save enough output tokens to pay for its added instructions.** That is easy with a long tutorial and hard with a short answer.

## Short answers: prompt overhead wins

The Caveman instructions add roughly 700 input tokens, or about $0.0105 per request at the prices used here. That is equivalent to 140 output tokens. Compared with no instruction, a Caveman mode must cut at least that much output just to break even.

Most short answers are nowhere near that length. On all seven GSM8K math prompts, ultra saved fewer than 140 output tokens compared with no instruction, so the added prompt cost outweighed the savings. Across all ten short prompts, apparent savings against no instruction came from three longer code-generation answers. Against “Answer concisely,” Caveman cost 3–10% more overall on Claude Opus 4.7. The Opus 4.6 modes were 3–16% cheaper, but those differences were not statistically clear.

For math, factual questions, debugging, and other short responses, “Answer concisely” is a better starting point than adding a large style prompt.

## Long answers: a model-specific result

On Claude Opus 4.7, Caveman ranged from 1% cheaper to 10% more expensive than “Answer concisely” across five long-form prompts. Ultra was about 5% cheaper, a difference too small to distinguish reliably in this sample. Overall, Caveman showed no clear advantage on Opus 4.7.

Claude Opus 4.6 was different. On the same five prompts, all four Caveman modes cost 54–59% less than “Answer concisely.” That is a substantial result, but five prompts are too few to treat it as a general discount for Opus 4.6.

One likely reason: without a style instruction, Opus 4.6 produced about 24,000 output tokens on average across these prompts, compared with about 8,200 for Opus 4.7. Caveman had much more verbosity to remove from Opus 4.6.

## When the instruction pays for itself

The break-even point depends on the model’s prices and Caveman’s added prompt length. Here, roughly 700 added input tokens cost as much as 140 output tokens. If Caveman saves more than 140 output tokens versus no instruction, it can lower cost; if it saves less, the added instruction costs more than it saves.

In this benchmark, short math answers fell below that threshold, while code generation and long-form writing often saved hundreds or thousands of tokens. Measure representative requests from your own workload before adopting Caveman broadly.

## What the benchmark covers

The test included seven GSM8K math questions, three HumanEval code-generation prompts, and five long-form writing tasks. Each prompt ran three times under each condition on both models. Costs use token counts and prices of $15 per million input tokens and $75 per million output tokens.

The test did not assess correctness, completeness, or usefulness. It used single-turn API calls, not Claude Code sessions, tool use, or multi-turn work. The five long-form prompts explicitly asked for detailed outputs, and the 4.6 long-form results were rerun with a 64K output limit to avoid truncation.

The result is narrow: Caveman substantially reduced measured cost for long-form Claude Opus 4.6 responses in this benchmark. For short tasks and Opus 4.7, “Answer concisely” was as good or better. Whether the shorter answers are still useful depends on the task.
