+++
title = "Does Caveman Mode Actually Work? I Benchmarked It (Properly This Time)."
date = 2026-04-20
draft = false
tags = ["ai", "llm", "benchmarks", "cost", "claude", "prompt-engineering"]
description = "Caveman mode makes Claude talk in terse fragments to save tokens. I benchmarked it via the raw API, against a fair terse baseline. The real story: it clearly helps on 4-6 long-form, hurts short-answer 4-7, and the mode-ranking story is underpowered."
ShowToc = true
+++

**TL;DR:** [Caveman](https://github.com/JuliusBrussee/caveman) is a Claude plugin that adds a ~700-token system prompt telling the model to talk tersely. I benchmarked it with n=3 runs × 15 prompts × 6 conditions × 2 models via the direct Anthropic API (540+ calls). Then I QA'd my own analysis and found it was riddled with methodology errors. Here's the actually-honest story.

| Task type | Caveman vs terse ("Answer concisely.") | Statistical significance |
|-----------|----------------------------------------|--------------------------|
| **Short-answer, 4-7** (math, code Q&A) | **+2.5% to +10%** (caveman costs MORE) | Not significant |
| **Short-answer, 4-6** | -3% to -16% | Not significant |
| **Long-form, 4-7** (tutorials, docs) | -5% to +10% (caveman barely helps or hurts) | Not significant |
| **Long-form, 4-6** | **-55% to -59%** | Large effect; paired t-test p≈0.012-0.028 (n=5 prompts) |

Caveman's effect is **concentrated almost entirely in one cell**: long-form generation on claude-opus-4-6. Everywhere else it's either noise or a slight cost increase.

---

## What I first thought I found

My earlier draft of this post claimed "caveman saves 22-48% across the board, ultra is the best mode everywhere, 4-6 long-form is a killer app at 69% savings." I was going to ship it.

Then I ran [deep-qa](https://github.com/anthropics/claude-code) on my own data with 5 adversarial critic agents (statistical validity, experimental design, code correctness, claim-evidence alignment, external validity). Three of five came back **REJECT**. The rest came back **REVISE**. Every claim I was about to ship was either wrong, noise, or misleading.

Here's what I actually had:

1. **"Ultra wins everywhere"** — factually wrong. Terse beats ultra on 4-7 short (-38% vs -37%). Ultra wins 3 of 4 cells, not 4 of 4.
2. **"69% savings on 4-6 long"** — real, but the number partly reflects that 4-6 is 2-4x more verbose than 4-7 at baseline. Caveman is compressing 4-6's pathological verbosity back toward 4-7's natural length.
3. **"Caveman saves 30-40% on short tasks"** — Simpson's Paradox. Ultra actually *loses* on 7 of 10 individual prompts. All 7 GSM8K math problems got MORE expensive under caveman. The aggregate "savings" comes entirely from 3 HumanEval code-gen prompts (85% of the cost in the short suite).
4. **"Best mode: ultra"** — still unsupported, but "all modes are identical" was too strong too. On 4-7 long, ultra does **not** beat terse (p=0.474) and only marginally beats full (p=0.099). But one pairwise gap *does* show up in this tiny sample (full vs wenyan, p=0.005). With n=5 long-form prompts, mode-ranking claims are shaky either way.

So let me tell the story properly.

## Setup

- **API**: Netflix's internal Model Gateway (Anthropic SDK, direct API, no Claude Code CLI overhead)
- **Models**: claude-opus-4-6 and claude-opus-4-7
- **Conditions**: null (no system prompt), terse ("Answer concisely."), lite/full/ultra/wenyan (caveman intensity levels, ~430-780 input tokens each)
- **Prompts**: 10 short (7 GSM8K math, 3 HumanEval code gen) + 5 long-form (tutorials, architecture doc, API spec, migration plan)
- **n = 3 runs per prompt**; main benchmark used `max_tokens = 16K`, plus a separate `4-6 long` rerun at `64K` after I found truncation risk there
- **Cost**: computed from usage token counts with published Anthropic pricing ($15/M input, $75/M output)

The critical methodology choice: I used **two baselines**:
- **null** (no system prompt) — the "theoretical maximum savings" baseline
- **terse** ("Answer concisely.") — the fair baseline. Everyone using Claude can write those two words for free. Caveman's marginal value is what it adds *over* terse.

## The real results

### 4-7 short-answer: caveman actively hurts you

| Mode | Cost vs null | Cost vs **terse** (fair baseline) | Per GSM8K prompt |
|------|--------------|-----------------------------------|-------------------|
| null | — | +62% | $0.0075 |
| terse | -38% | — | $0.0053 |
| lite | -32% | **+10%** (worse!) | $0.0150 |
| full | -36% | +3% | $0.0150 |
| ultra | -37% | +3% | $0.0148 |
| wenyan | -32% | +10% (worse) | $0.0154 |

Bootstrap 95% CI on the "savings": `ultra -37% [−59%, +15%]` — includes zero. Not statistically distinguishable from null.

The per-prompt breakdown reveals the Simpson's Paradox: **every caveman mode costs ~2x MORE than null on every math problem**. The 700-token system prompt (~$0.0105 in input cost) exceeds the output savings on any prompt producing <140 tokens, which includes all math questions.

The aggregate "savings" comes entirely from 3 HumanEval prompts where baseline produces 700-1600 tokens of code — that's where caveman's output reduction finally exceeds its input overhead.

**Takeaway for 4-7 short:** if your workload is math, factual Q&A, debugging, tool calls, or anything with short responses, caveman is a net loss.

### 4-7 long-form: caveman doesn't beat terse

| Mode | Cost | vs null | vs **terse** |
|------|------|---------|--------------|
| null | $0.616 | — | +40% |
| terse | $0.440 | -29% | — |
| lite | $0.479 | -22% | +9% (worse) |
| full | $0.484 | -22% | +10% (worse) |
| ultra | $0.418 | -32% | **-5%** |
| wenyan | $0.437 | -29% | -1% |

Against null, every non-null condition is cheaper on this 5-prompt sample. But the comparison that matters is **terse vs caveman**, and those gaps are noise: terse vs ultra `p=0.474`, terse vs lite `p=0.408`, terse vs full `p=0.244`, terse vs wenyan `p=0.937`.

One pairwise gap *does* show up in this tiny sample: full vs wenyan `p=0.005`. So my earlier "all modes are statistically identical" line was too strong. The honest read is narrower: **mode ranking on 4-7 long is unstable and underpowered**, and caveman does not clearly beat the two-word terse baseline.

**Takeaway for 4-7 long:** "Answer concisely." saves 29% and beats most caveman modes. Ultra edges it by 5% but that's within CI noise.

### 4-6 short-answer: everything works, but it's noise

All modes save 32-43% vs null, but on the prompt-level paired t-test only `null vs terse` barely sneaks under 0.05 (`p=0.0498`). Everything else is noise in this sample. Vs terse, caveman modes save 3-16%, but none are statistically distinguishable from terse.

### 4-6 long-form: THE cell where caveman clearly wins

| Mode | Cost | vs null | vs **terse** |
|------|------|---------|--------------|
| null | $1.83 | — | +33% |
| terse | $1.38 | -25% | — |
| lite | $0.63 | -66% | **-54%** |
| full | $0.60 | -67% | **-56%** |
| ultra | $0.56 | -69% | **-59%** |
| wenyan | $0.58 | -68% | **-58%** |

On the 5 prompt means, every caveman mode beats terse in a paired t-test: lite `p=0.028`, full `p=0.021`, ultra `p=0.017`, wenyan `p=0.012`. That's still strong directional evidence, but it's much weaker than what I first wrote, and with only 5 prompts I should not oversell the inferential certainty. (`null vs terse` is **not** significant in the same test: `p=0.103`.)

The caveman modes remain hard to rank against each other: ultra vs lite `p=0.130`, ultra vs full `p=0.232`, ultra vs wenyan `p=0.670`.

This is the one cell where caveman clearly wins on **cost** in my data.

**Why 4-6 long-form specifically?** Because claude-opus-4-6 produces **~24,000 tokens on average across the 5 long-form prompts**. claude-opus-4-7 produces ~8,200 on the same prompt set. Caveman isn't discovering new compression so much as reining in 4-6's pathological verbosity. The same prompts on 4-7 show much smaller caveman savings because 4-7 is already more concise by default.

## The break-even math

Caveman adds ~700 input tokens (~$0.0105/request at $15/M input). To break even, it must save ≥140 output tokens at $75/M output.

Here's every prompt in the benchmark showing whether caveman helps or hurts:

| Category | Baseline out tokens | Ultra out tokens | Net effect |
|----------|---------------------|------------------|------------|
| Math (Janet's ducks) | 84 | 36 | 48 saved — **LOSS** |
| Math (robe bolts) | 22 | 21 | 1 saved — **LOSS** |
| Math (Josh house) | 104 | 54 | 50 saved — **LOSS** |
| Math (James sprints) | 52 | 15 | 37 saved — **LOSS** |
| Math (Wendi chickens) | 202 | 95 | 107 saved — **LOSS** |
| Math (Kylar) | 58 | 29 | 29 saved — **LOSS** |
| Math (Toulouse) | 67 | 37 | 30 saved — **LOSS** |
| Code (palindrome) | 727 | 154 | 573 saved — **WIN** |
| Code (flatten) | 1,596 | 416 | 1,180 saved — **WIN** |
| Code (intervals) | 1,491 | 473 | 1,018 saved — **WIN** |
| FastAPI tutorial | 8,479 | 6,512 | 1,967 saved — **WIN** |
| Git guide | 3,816 | 2,149 | 1,667 saved — **WIN** |
| Architecture doc | 7,065 | 3,758 | 3,307 saved — **WIN** |
| API design | 12,373 | 10,466 | 1,907 saved — **WIN** |
| Migration plan | 9,262 | 4,212 | 5,050 saved — **WIN** |

**Caveman saves money only when it shaves ≥140 output tokens vs baseline.** In this benchmark, every prompt where baseline produced ≥700 tokens came out ahead; every math question (baseline 22-202 tokens) lost. In between (roughly 200-500 tokens baseline), the outcome depends on how much the specific prompt compresses. The more verbose the baseline output, the bigger the win.

## What about picking the "best" caveman mode?

Not confidently. With n=5 long-form prompts, most mode-ranking claims are unstable:

- On 4-7 long, ultra vs full: `p=0.099`, ultra vs lite: `p=0.208`, ultra vs wenyan: `p=0.476`
- On 4-7 long, full vs wenyan: `p=0.005` in this sample
- On 4-6 long, ultra vs lite: `p=0.130`, ultra vs full: `p=0.232`

That is exactly why I don't trust a strong "best mode" story here. To really rank the modes, I'd want dozens to low hundreds of prompts, not five.

Pick whichever mode you find most readable. Wenyan is Classical Chinese ("物出新參照") which probably isn't useful to most readers. Ultra uses aggressive abbreviations ("DB", "conn", "req"). Lite keeps full sentences. For practical use, readability matters more here than chasing tiny mode-to-mode cost gaps.

## Honest limitations

This benchmark has real methodological issues even after the rigorous re-analysis:

1. **No quality evaluation.** I measured tokens and dollars. I did NOT check whether the caveman responses were correct, complete, or as useful as the baseline. A 69% cheaper answer that's 30% less useful is a loss. The single biggest gap in this study.

2. **Unrepresentative prompts.** GSM8K math + HumanEval code-gen + "write a comprehensive tutorial" doesn't resemble most Claude Code usage: debugging, refactoring, explaining errors, multi-turn agentic work with tools. All my long prompts contain verbosity amplifiers ("comprehensive", "detailed") which caveman specifically fights against.

3. **Sample size is still small.** I only have 3 runs per prompt and, more importantly, 5 long-form prompts / 10 short prompts at the prompt-comparison level. Most inter-mode comparisons stay underpowered. On short, 3 expensive HumanEval prompts dominate the dollars, so the effective sample size is lower than a naive "10 prompts" suggests.

4. **Fixed condition order.** I always ran null → terse → lite → full → ultra → wenyan sequentially. Can't separate temporal effects from condition effects.

5. **No multi-turn testing.** Caveman's "ACTIVE EVERY RESPONSE" persistence is untested — all my prompts were single-turn.

6. **4-6 results are model-specific.** Don't generalize to 4-7 or Sonnet or Haiku.

7. **No Claude Code integration.** Tests went via direct API. The ~67K Claude Code system prompt completely changes the cost ratio (output becomes a smaller fraction of total cost → caveman's savings shrink proportionally).

## Recommendations

**Use caveman if:**
- You're on claude-opus-4-6
- Your workload is primarily long-form generation (docs, tutorials, full code modules)
- You can accept untested effect on quality
- The readability tax is acceptable

**Don't use caveman if:**
- You're mostly doing short Q&A, debugging, math, tool calls → caveman *costs you more*
- You're on 4-7 → benefit is much smaller and often within noise
- You care about output readability

**The simpler alternative:** "Answer concisely." — it's two words, it's free, and on 4-7 it matches or beats most caveman modes on cost. Ultra's small edge on 4-7 long (-5%) is still within noise. Outside the 4-6-long cell, most of the analytical difference between "terse" and "caveman" is noise.

**The bigger lever:** model choice. Sonnet is 5x cheaper per token than Opus. That's a 80% cost reduction. Caveman's best-case (-69% on 4-6 long) is achievable with a single-word change in your API call.

## Methodology transparency

- Raw results: `caveman_benchmark_v7_gateway_results.json` (4-7 data, 4-6 short data), `caveman_benchmark_v7_46long_32k_results.json` (historical filename; the 4-6-long rerun itself used `max_tokens=64K`)
- Analysis: `caveman_analysis_v8.py`, updated to report paired `p` values via `scipy.stats.ttest_rel` on prompt-level means after I found the original normal-approximation `p` values were too aggressive
- All 540+ API calls went through the Netflix Model Gateway, not `api.anthropic.com` directly — if you try to reproduce via the public API, absolute dollar numbers may differ

This post replaces an earlier version that claimed much larger and more uniform savings. I was wrong. The real effect is narrow, model-specific, and frequently net-negative.
