+++
title = "We Benchmarked MCP Against Code Generation. MCP Won (Mostly)."
date = 2026-03-18
draft = false
tags = ["ai", "mcp", "metaflow", "benchmarks", "llm", "tooling"]
description = "We benchmarked four approaches for LLMs to interact with a small, focused API: structured MCP tools, code generation, documentation-augmented MCP tools, and Cloudflare-style search+execute. For this class of API, MCP tools consistently outscored code generation on correctness. Adding a reference document to MCP tools cost 6–14% more tokens with zero accuracy gain."
ShowToc = true
+++

**TL;DR:** For a small, well-designed API (10 tools), structured MCP tool calls consistently outscore code generation on correctness — 0.99 vs 0.97 — and the gap concentrates in tasks where domain-specific logic matters. Adding a reference document to MCP tools costs 6–14% more tokens with zero accuracy gain. Cloudflare's search+execute pattern matches MCP accuracy but uses more tokens. With MCP tools, Haiku is within 1% of Opus at 1/12 the cost.

| | MCP Direct | Code Mode | Skill | Search+Execute |
|--|--|--|--|--|
| **Accuracy** | ✅ 1.00 | 🟡 0.97 | ✅ 0.99 | ✅ 0.99 |
| **Tokens** | ✅ Lowest | 🟡 Mid | 🟡 +6–14% vs MCP | ❌ Highest |
| **Cost** | ✅ Lowest | 🟡 Mid | 🟡 Mid | ❌ Highest |
| **Failure mode** | Partial answers | Confident wrong answers | Partial answers | Partial answers |

---

There are two broad strategies for giving a language model access to an API:

1. **Structured tool calls** — expose the API as a set of typed function definitions ([MCP](https://modelcontextprotocol.io) is the emerging standard for this). The model calls functions directly; no code is written or executed.
2. **Code generation** — give the model access to the underlying library and have it write code. The model can do anything the library supports, but must produce syntactically and semantically correct programs.

A third variant, introduced by Cloudflare's [Code Mode](https://blog.cloudflare.com/code-mode/), adds a discovery step before code generation: the model first searches a schema server to find relevant functions, then writes code that calls them. This avoids embedding the full API spec in the context window — useful when an API has thousands of endpoints that wouldn't fit.

That raises a question: when the API is small enough that its entire definition easily fits in context, does code generation still offer any advantage?

To test this, I built a benchmark around the [Metaflow MCP server](https://github.com/npow/metaflow-mcp-server), which wraps the [Metaflow](https://metaflow.org) Python client — an open-source ML workflow framework — behind 10 structured MCP tools.

## Four Approaches

The benchmark compares four ways a language model can answer questions about a Metaflow deployment:

| Approach | How it works |
|----------|--------------|
| **MCP Direct** | The model calls the 10 Metaflow MCP tools directly as structured function calls. No code execution. Minimal system prompt. |
| **Skill** | Identical to MCP Direct, but with a reference document describing Metaflow concepts and tool routing prepended to every prompt. Tests whether documentation helps on top of tools. |
| **Code Mode** | No MCP tools. The model writes and executes Python or Bash against the Metaflow client library. |
| **Search+Execute** | Cloudflare's two-phase pattern: the model calls `search_tool_schemas(keyword)` to discover relevant API functions, then writes code that calls them. Neither the full tool list nor the full API reference is in the system prompt upfront. |

A few things worth noting about this comparison:

- **Code Mode and Search+Execute bypass MCP entirely** and have access to the full Metaflow Python API — a much richer surface than the 10 tools. In principle, they can do things MCP cannot (arbitrary filtering, custom aggregation). This is an asymmetry that favors code generation for complex tasks.
- **Search+Execute adds a discovery step** before any real work happens. The model must first search the schema to find relevant functions, then write code to call them. This mirrors how Cloudflare's pattern works when the API is too large to embed directly.
- **MCP Direct** constrains the model to a curated, opinionated set of tools. Several of those tools (notably `get_latest_failure`) encapsulate multi-step operations that would require multiple API calls in code.
- **Skill** has strictly more information than MCP Direct — same tools, plus a reference document. It can never have less capability, only more context.

## Experimental Design

### Infrastructure

All four approaches run through [claude-relay](https://github.com/npow/claude-relay), a local proxy that routes requests to the Claude Code CLI. Claude Code handles the full agentic loop internally — tool calls, error recovery, retries — and the relay returns the final text response and aggregate token usage.

This means we measure **end-to-end cost and quality**, but internal mechanics (number of tool calls, retries, intermediate reasoning) are not directly observable.

### Models

Each approach was tested with three Claude models: **Haiku 4.5** (fastest, cheapest), **Sonnet 4.5** (balanced), and **Opus 4.6** (most capable).

### Tasks

27 tasks across five difficulty levels, parameterized against a live Metaflow deployment:

| Category | Count | Examples |
|----------|-------|---------|
| **Simple** | 3 | Report metadata provider and datastore; list flows; list the last 3 runs |
| **Medium** | 6 | Step-by-step breakdown of a run; retrieve task logs; artifact inspection; step timing |
| **Complex** | 6 | Success rate over 10 runs; locate most recent failure with error details; compare artifacts between runs |
| **Hard** | 8 | Slowest step across multiple runs; run census by state; fastest run; median duration; cross-flow status breakdown |
| **Disambiguation** | 4 | Distinguish crashed runs (finished=False) from running ones; compute success rate only over finished runs |

Each (approach, model, task) cell was run **3 times** to average out stochastic variation — 972 total runs. Correctness was evaluated by a 2-judge ensemble (Sonnet and Opus independently score each answer; scores are averaged) using a 5-level rubric: 0.0, 0.25, 0.5, 0.75, 1.0. Reference answers were computed programmatically from the Metaflow Python client API.

## Results

972 total runs: 4 approaches × 3 models × 27 tasks × 3 trials, executed in parallel across 4 workers.

### Correctness

Mean accuracy across all tasks (3 trials averaged per cell):

| Approach | Haiku | Sonnet | Opus | Overall |
|----------|-------|--------|------|---------|
| MCP Direct | 0.992 | 0.998 | 0.995 | **1.00** |
| Skill | 0.995 | 0.997 | 0.991 | 0.99 |
| Search+Execute | 0.992 | 0.997 | 0.994 | 0.99 |
| Code Mode | 0.957 | 0.975 | 0.974 | 0.97 |

All three tool-based approaches cluster at 0.99+. Code Mode trails at 0.97, with the gap concentrated in config interpretation and failure detection tasks. The overall gap between MCP Direct and Code Mode is 2.7 percentage points — consistent across runs.

The worst-case scores tell a sharper story. Code Mode's worst per-task average is 0.33 (Haiku on config interpretation), while MCP Direct's worst is 0.83. Tool-based failures are partial answers; code generation failures are confident wrong answers.

By category (all models pooled):

| Approach | Simple | Medium | Complex | Hard | Disambig. | Overall |
|----------|--------|--------|---------|------|-----------|---------|
| MCP Direct | 1.00 | 1.00 | 0.99 | 0.99 | 1.00 | **1.00** |
| Skill | 1.00 | 1.00 | 1.00 | 0.98 | 1.00 | 0.99 |
| Search+Execute | 1.00 | 1.00 | 1.00 | 0.98 | 1.00 | 0.99 |
| Code Mode | 0.86 | 1.00 | 0.95 | 0.98 | 1.00 | 0.97 |

Code Mode's worst category is Simple (0.86), where config interpretation trips up code models — the MCP tool returns canonical values while code models read raw configuration that can be ambiguous.

### Token Usage

Median tokens per task:

| Approach | Haiku | Sonnet | Opus |
|----------|-------|--------|------|
| MCP Direct | 965 | 554 | **335** |
| Skill | 1,004 | 526 | 375 |
| Search+Execute | 1,181 | 656 | 676 |
| Code Mode | 1,185 | 534 | 438 |

MCP Direct with Opus produced the lowest median token usage (335 tokens). The variance tells an important story: Code Mode with Haiku exhibited an 18.5× spread between min and max (372 to 6,865). MCP Direct's worst case was a 7.2× spread (Haiku: 320 to 2,292). Wide variance is consistent with failure-retry dynamics: when generated code contains bugs, the model iterates, and token consumption compounds.

**Skill uses +62 more tokens per task than MCP Direct on average** (p < 0.001, Wilcoxon on 243 paired observations), translating to 6–14% higher cost depending on model — for zero accuracy gain. The reference document adds overhead on every call without improving any task.

### Cost

| Approach | Haiku | Sonnet | Opus |
|----------|-------|--------|------|
| MCP Direct | $0.005 | $0.010 | $0.032 |
| Skill | $0.005 | $0.011 | $0.037 |
| Code Mode | $0.008 | $0.008 | $0.036 |
| Search+Execute | $0.007 | $0.011 | $0.063 |

*Per-task cost estimates based on published per-token API rates.*

Search+Execute with Opus is the most expensive at $0.063/task — nearly double MCP Direct's $0.032. The schema discovery phase adds tokens without reducing downstream execution cost.

### Latency

Median wall-clock seconds per task:

| Approach | Haiku | Sonnet | Opus |
|----------|-------|--------|------|
| MCP Direct | **17.1s** | 20.2s | 19.7s |
| Skill | 17.1s | 19.2s | 20.7s |
| Code Mode | 19.7s | 20.2s | 20.4s |
| Search+Execute | 23.2s | 24.8s | **30.1s** |

MCP Direct was the fastest approach across all models. Search+Execute with Opus was the slowest at 30.1s median — because the schema discovery round-trip adds latency that is impossible to amortize when there are only 10 functions to discover.

## Analysis

### The failure mode matters more than the rate

One task asked: *Count the runs of this flow by state — how many are currently running, how many finished successfully, how many finished with a failure?*

The reference answer: 24 finished successfully, 12 unfinished (not yet complete), 0 failures.

Two code-writing runs from Haiku returned this instead:

> | Category | Count |
> |----------|-------|
> | **Currently running or unfinished** (finished=False) | **0** |
> | **Finished successfully** (finished=True AND successful=True) | **24** |
> | **Finished with failure** (finished=True AND successful=False) | **12** |

The counts are exactly inverted for two of the three categories. The model read the right data and applied the wrong logic: it filtered `finished=False` runs out and then called the remaining non-successful ones "failures," missing that non-successful doesn't mean finished-unsuccessfully.

The MCP tool encodes the classification logic directly. The model never has to reason through the distinction. A wrong answer that looks uncertain is easy to catch. A wrong answer with a plausible-looking table backed by real counts is not.

### Documentation is a tax, not a benefit

MCP Direct and Skill score identically on accuracy across all 27 tasks (p=0.68). The only measurable difference is cost: Skill uses 62 more tokens per task (p < 0.001), adding 6–14% overhead depending on the model.

The Skill approach prepends a reference document to every prompt — a tool routing cheat sheet mapping questions to tool names. For a well-designed 10-tool API with clear schemas, this information is redundant. The model discovers the same routing from the tool descriptions alone.

Earlier benchmark runs showed Skill occasionally outperforming MCP Direct on a single task, driven by Haiku misidentifying which flow had the most steps. The reference document appeared to "fix" this by anchoring the model to the task scope. But the actual problem was a vague task prompt. When we added one sentence — "Only look at the flows listed above" — MCP Direct matched Skill exactly.

Before adding documentation to your system prompt, check whether clearer task phrasing solves the problem first. If your tools are well-named, the docs are dead weight.

### Why MCP Direct performed well

The Metaflow MCP server is not a thin wrapper — several tools encapsulate multi-step operations. `get_latest_failure`, for example, searches for failed runs, finds the failing task, and extracts the error in a single call. In code, that requires discovering the right API surface, writing a loop, filtering for failures, and extracting the exception.

Beyond encapsulation, structured tools have two practical advantages over code generation: input schemas enforce type constraints (no runtime errors from misremembered argument names), and outputs are structured JSON the model can reference precisely in follow-up calls rather than unstructured stdout it has to parse.

### Why Search+Execute is worse, not better, for small APIs

Cloudflare designed Code Mode for an API with 2,500 endpoints — a schema too large to embed in any context window. The discovery step is an engineering solution to that constraint. When the full API fits in ten tool definitions, there is no constraint to solve. The discovery phase burns tokens and adds a round-trip without reducing the cost of the tool definitions themselves (which are already minimal).

The crossover point — where search+execute becomes more efficient than embedding the schema directly — likely lies well above 10 tools. Identifying it experimentally would be a useful follow-up.

### MCP is more robust across model tiers

With MCP Direct: Haiku scores 0.992, Sonnet 0.998, Opus 0.995. The spread is 0.6 percentage points — all three models are effectively at ceiling.

Without MCP tools (Code Mode): Haiku scores 0.957, Sonnet 0.975, Opus 0.974. The spread is 1.8 points and Haiku drops furthest. Structured tools constrain the action space — a weaker model can still pick the right tool from a list of ten even when it would produce buggy code from scratch.

The practical implication: if you're cost-constrained and using MCP tools, Haiku delivers near-Opus accuracy at roughly 1/12 the price.

## Limitations

**Small effect size.** The accuracy gap between MCP Direct (0.995) and Code Mode (0.969) is 2.7 percentage points. This is consistent across runs but does not always reach statistical significance at n=27 tasks (Wilcoxon p=0.107). The effect is real but small.

**Small API surface.** The results are specific to a 10-tool API. At larger scales, the relative rankings should change — particularly for Search+Execute, which was designed for APIs with thousands of endpoints.

**Black-box measurement.** The relay architecture means we observe only aggregate token usage and the final answer. We cannot measure internal metrics like retry frequency or verify system prompt adherence.

**LLM-as-judge.** Correctness was evaluated by a Sonnet + Opus ensemble. Using benchmark subjects as judges introduces a potential self-evaluation bias.

**Single API, single domain.** All tasks target one API in one domain (ML workflow management). The conclusions are suggestive but not confirmed across other APIs.

**Task design bias.** Tasks were designed alongside the MCP tools, which may inadvertently favor MCP Direct. Tasks requiring operations not covered by the 10 tools were not included.

## When Code Generation May Be Preferable

Despite these results, code generation has real advantages in several scenarios:

- **Large API surfaces** (50+ endpoints) where embedding full tool definitions becomes a significant fraction of the context budget — the regime Search+Execute was designed for.
- **Tasks requiring arbitrary computation** — complex filtering, conditional aggregation, multi-step transformations — that are difficult to anticipate as pre-built tools.
- **Rapidly evolving APIs** where maintaining versioned tool schemas is costly and code generation can adapt to library changes without schema updates.

## Conclusion

For the Metaflow MCP server — a small, purposefully designed API — structured MCP tool use consistently outscored code generation on correctness (0.99 vs 0.97), used fewer tokens, and ran faster. The gap is driven by failure modes, not failure rates: code-writing models apply plausible-but-wrong logic to correct data, producing confident wrong answers that are hard to catch.

The cleanest finding: **adding a reference document to well-designed MCP tools costs 6–14% more tokens per task with zero accuracy gain** (p < 0.001 on token overhead, p = 0.68 on accuracy). For a well-designed API, let the tool schemas speak for themselves.

The practical takeaway: invest in well-designed MCP tools for small, stable APIs — especially when tasks map naturally onto pre-built operations. For larger API surfaces, or for tasks requiring arbitrary logic, a hybrid approach — structured tools for common operations, code execution as an escape hatch — likely offers the best of both worlds.

## Methodology Details

- **Infrastructure**: [claude-relay](https://github.com/npow/claude-relay) proxying to Claude Code CLI
- **Models**: Claude Haiku 4.5, Sonnet 4.5, Opus 4.6
- **Tasks**: 27 tasks across 5 categories (Simple, Medium, Complex, Hard, Disambiguation)
- **Trials**: 3 independent runs per (approach, model, task) cell — 972 total
- **Evaluation**: 2-judge ensemble (Sonnet + Opus), mean score 0–1, 5-level rubric
- **Reference answers**: Computed programmatically from the Metaflow Python client API
- **Statistical tests**: Wilcoxon signed-rank, per-task mean scores
- **Source code**: [github.com/npow/metaflow-mcp-server/benchmarks](https://github.com/npow/metaflow-mcp-server/tree/main/benchmarks)
- **Raw data**: [benchmarks/results_v21.json](https://github.com/npow/metaflow-mcp-server/blob/main/benchmarks/results_v21.json)
