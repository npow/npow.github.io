+++
title = "Does Caveman Mode Actually Work? I Benchmarked It."
date = 2026-04-15
draft = false
tags = ["ai", "llm", "benchmarks", "cost", "claude", "prompt-engineering"]
description = "Caveman mode claims 75% output token savings by making Claude talk in terse fragments. I benchmarked it across GSM8K, MMLU, HumanEval, and long-form generation with n=3 runs per prompt. Caveman beats 'Answer concisely' by 1-9% on cost, but the savings are modest and come with trade-offs."
ShowToc = true
+++

**TL;DR:** [Caveman](https://github.com/JuliusBrussee/caveman) makes Claude drop articles and speak in fragments to reduce output tokens. I benchmarked it with n=3 runs per prompt across short-answer and long-form tasks. Compared against the simplest alternative — "Answer concisely." — caveman saves 1.3% on short tasks and 8.6% on long-form generation. Whether that's worth making your AI talk like a caveman is a judgment call.

| Task type | Caveman vs Terse cost | Caveman vs Terse tokens |
|-----------|----------------------|------------------------|
| **Short-answer** (GSM8K, MMLU, HumanEval) | **-1.3%** | -21% |
| **Long-form** (tutorials, API specs, arch docs) | **-8.6%** | -14% |

---

## The motivation

I keep seeing people install [caveman plugins](https://github.com/JuliusBrussee/caveman) for Claude Code. The project is upfront about what it does: it reduces *output* tokens through aggressive style compression — dropping articles, using fragments, replacing phrases with short synonyms. Its own benchmarks show 65-87% output token reduction.

What the project doesn't claim, but people assume, is that this translates directly to cost savings. I wanted to test that assumption, and I had a specific worry: if forcing a weird output style makes the model spend more *thinking* tokens figuring out how to phrase things, the savings could evaporate.

## Setup

I ran prompts through `claude -p --output-format json --verbose`, which reports `total_cost_usd` (the actual bill including input, output, cache reads, and cache creation), `output_tokens` (includes thinking), and timing data. Every prompt ran **3 times per condition** to average out generation variance, and cache-cold requests were automatically retried.

Two conditions are compared head-to-head:

| Condition | System prompt |
|-----------|--------------|
| **Terse** | "Answer concisely." |
| **Caveman** | Full ~400-token SKILL.md with rules about dropping articles, using fragments, etc. |

Both use the `--system-prompt` flag, which ensures identical cache behavior (see [methodology notes](#a-note-on-baselines) for why this matters).

Two benchmark suites:

- **Short-answer** (15 prompts × 3 runs): 10 GSM8K math problems, 2 MMLU multiple-choice, 3 HumanEval code generation. Typical output: 13-600 tokens.
- **Long-form** (6 prompts × 3 runs): FastAPI tutorial, Git branching guide, chat architecture doc, code refactoring, REST API design, Django migration plan. Typical output: 1,300-12,000 tokens.

## Part 1: Short-answer tasks

### Caveman saves 1.3% over terse

Averaged over 3 runs per prompt:

| Condition | Avg cost/prompt | Avg output tokens |
|-----------|----------------|-------------------|
| Terse | $0.0752 | 206 |
| Caveman | $0.0742 | 162 |
| **Difference** | **-$0.001 (-1.3%)** | **-44 (-21%)** |

Caveman reduces output tokens by 21% compared to terse, but that translates to only 1.3% cost savings. The average favors caveman, but it's not uniform — 7 of 15 prompts were cheaper with caveman, while 8 were marginally more expensive (by fractions of a cent). The aggregate trend is real but small.

Why the disconnect between 21% fewer tokens and 1.3% less cost? For short-answer tasks through Claude Code, output tokens are only ~8% of total cost. The ~60K tokens of cached system prompt and tool definitions dominate the bill. A 21% reduction in 8% of your bill is about a 1.7% reduction — and the remaining gap (1.7% vs 1.3%) is eaten by caveman's 400-token system prompt adding slightly to input cost.

### Thinking tokens: no change

I found no evidence that caveman increases thinking tokens. They decreased slightly (-2.8% vs terse), within noise.

## Part 2: Long-form generation

For tasks that generate thousands of tokens — tutorials, architecture docs, API specs — output becomes the dominant cost component (~73% of total). This is where caveman should matter more.

### Caveman saves 8.6% over terse

Averaged over 3 runs per prompt:

| Condition | Avg cost/prompt | Avg output tokens |
|-----------|----------------|-------------------|
| Terse | $0.1864 | 4,644 |
| Caveman | $0.1703 | 3,999 |
| **Difference** | **-$0.016 (-8.6%)** | **-645 (-14%)** |

Caveman generates 14% fewer tokens and saves 8.6% on cost. The effect is larger here because output is a bigger share of the bill.

Per-prompt, the results vary:

| Task | Terse tokens | Caveman tokens | Cost change (vs Terse) |
|------|-------------|----------------|------------------------|
| REST API design | 11,070 | 7,583 | **-31%** |
| Git branching guide | 1,274 | 1,375 | +4% |
| Chat architecture | 3,691 | 3,490 | -3% |
| FastAPI tutorial | 5,135 | 5,439 | +6% |
| Code refactoring | 1,486 | 1,727 | +5% |
| Django migration | 5,206 | 4,379 | **-12%** |

Caveman's long-form advantage comes almost entirely from two tasks (API design: -31%, migration: -12%). On the other four, it's a wash or slightly worse. The aggregate favors caveman, but don't expect consistent per-task savings.

## The full picture

| | Short-answer | Long-form |
|--|--|--|
| **Caveman vs Terse cost** | **-1.3%** | **-8.6%** |
| **Caveman vs Terse tokens** | -21% | -14% |
| **Output share of total cost** | ~8% | ~73% |

Caveman consistently beats "Answer concisely." on both cost and tokens. The effect is small on short-answer (where input costs dominate) and meaningful on long-form (where output costs dominate).

## Is it worth it?

The data says caveman does what it claims — it reduces output tokens. And it beats the obvious alternative ("Answer concisely.") on both cost and speed.

But the savings are modest. For a heavy Claude Code user spending $100/day:
- **Short-answer heavy workload**: caveman saves ~$1.30/day
- **Long-form heavy workload**: caveman saves ~$8.60/day
- **Mixed (realistic)**: probably $3-5/day

The trade-off is readability. Caveman responses look like this:

> Pool reuse open DB connections. No new conn per request. Skip handshake overhead.

Whether that's an acceptable trade for single-digit percentage savings depends on how you use Claude's output. If you're reading responses yourself, the style tax is real — caveman output is harder to skim and loses the connective tissue that makes technical writing scannable. If it's intermediate output in an agentic pipeline where no human reads it, the readability cost is zero and the savings are free.

**My recommendation:** if you're already using caveman and like the style, the data says keep it — it does beat terse. If you're considering installing it purely for cost savings, the 1-9% probably isn't worth the cognitive overhead. Your biggest cost levers are model choice (Sonnet vs Opus) and system prompt size, not output style.

## A note on baselines

I initially included a "no system prompt" baseline, but discovered a confound: the Claude CLI's `--system-prompt` flag changes the cache prefix, reducing cached token reads by ~5,900 tokens (~$0.003/request) regardless of what you put in it. This made the baseline appear more expensive for reasons unrelated to output style. The terse-vs-caveman comparison is clean because both use `--system-prompt`, producing identical cache behavior.

## Methodology

- All runs used `claude -p --output-format json --verbose` via Claude Code CLI v2.1.109
- Model: claude-opus-4-6 (1M context)
- **n=3 runs per prompt per condition**, averaged for all reported metrics
- Each condition got a warm-up call to prime the prompt cache
- Cache-cold requests (`cache_creation_input_tokens > 50K`) detected and automatically retried
- `total_cost_usd` from the CLI is the source of truth — accounts for input, output, cache reads, and cache creation
- `output_tokens` from the CLI includes thinking tokens (not separated)
- Thinking measured via `thinking` content block text length in verbose JSON
- Short-answer: 15 prompts (10 GSM8K + 2 MMLU + 3 HumanEval), long-form: 6 prompts
- These results are specific to Claude Code with Opus and its ~60K-token cached system prompt. For direct API use with minimal system prompts, output is a larger share of cost, so caveman's savings would be proportionally larger

## Raw data

<details>
<summary>Short-answer per-prompt averages (click to expand)</summary>

All values averaged over 3 runs.

| Category | Terse tok | Caveman tok | Terse $ | Caveman $ | Caveman cost chg |
|----------|-----------|-------------|---------|----------|-----------------|
| gsm8k: ducks | 113 | 71 | $0.0729 | $0.0719 | -1.4% |
| gsm8k: bolts | 27 | 32 | $0.0705 | $0.0707 | +0.3% |
| gsm8k: house | 185 | 197 | $0.0746 | $0.0750 | +0.5% |
| gsm8k: sprints | 57 | 38 | $0.0713 | $0.0709 | -0.6% |
| gsm8k: chickens | 1,087 | 551 | $0.0975 | $0.0842 | -13.6% |
| gsm8k: store | 57 | 71 | $0.0715 | $0.0719 | +0.6% |
| gsm8k: sheep | 124 | 97 | $0.0730 | $0.0724 | -0.8% |
| gsm8k: download | 218 | 199 | $0.0755 | $0.0752 | -0.4% |
| gsm8k: driving | 219 | 282 | $0.0757 | $0.0773 | +2.1% |
| gsm8k: overtime | 139 | 112 | $0.0735 | $0.0729 | -0.8% |
| mmlu: Floyd-Warshall | 13 | 13 | $0.0705 | $0.0706 | +0.1% |
| mmlu: acceleration | 33 | 33 | $0.0710 | $0.0711 | +0.1% |
| humaneval: palindrome | 116 | 115 | $0.0728 | $0.0729 | +0.1% |
| humaneval: flatten | 283 | 261 | $0.0771 | $0.0767 | -0.5% |
| humaneval: intervals | 414 | 357 | $0.0805 | $0.0791 | -1.7% |

</details>

<details>
<summary>Long-form per-prompt averages (click to expand)</summary>

All values averaged over 3 runs.

| Task | Terse tok | Caveman tok | Terse $ | Caveman $ | Caveman cost chg |
|------|-----------|-------------|---------|----------|-----------------|
| FastAPI tutorial | 5,135 | 5,439 | $0.1983 | $0.2059 | +3.8% |
| Git branching guide | 1,274 | 1,375 | $0.1017 | $0.1043 | +2.6% |
| Chat architecture | 3,691 | 3,490 | $0.1622 | $0.1573 | -3.0% |
| Code refactoring | 1,486 | 1,727 | $0.1092 | $0.1153 | +5.6% |
| REST API design | 11,070 | 7,583 | $0.3134 | $0.2597 | -17.1% |
| Django migration | 5,206 | 4,379 | $0.2001 | $0.1795 | -10.3% |

</details>
