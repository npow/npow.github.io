+++
title = "Hidden Technical Debt in Agentic Systems"
date = 2026-03-05
draft = false
tags = ["agentic-systems", "ai", "orchestration", "engineering", "governance"]
description = "Agentic stacks are repeating the hidden technical debt pattern from early ML, with higher blast radius because models can trigger real actions."
summary = "Agentic systems are replaying hidden technical debt from early ML, and the missing control plane is where the biggest risk accumulates."
ShowToc = true
+++

In 2015, Sculley et al. described how ML systems accumulate hidden debt outside the model code: glue code, unstable dependencies, feedback loops, and undeclared system behavior [\[1\]](https://papers.nips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf).

Agentic systems are replaying that pattern, but with higher blast radius.

An ML model that is wrong returns a bad prediction. A team catches it in eval, rolls back the model, and the damage is bounded.
An agent that is wrong can take actions before anyone notices: send the same email to a customer twice, write duplicate records to a database, trigger a downstream workflow that charges a payment method, or execute shell commands across infrastructure. The failure mode is not a stale prediction — it is a cascade of real-world effects that may be partially or fully irreversible. The debt is no longer just quality debt. It becomes operational and governance debt.

## What the stack looks like today

Teams running durable agentic workloads in production commonly assemble a stack along these lines:

- Durable workflow orchestration: Temporal for general-purpose durable execution with explicit activity/task queue semantics; LangGraph for stateful graph-based agent flows [\[2\]](https://docs.temporal.io/workflows)[\[4\]](https://docs.langchain.com/oss/python/langgraph/persistence). These serve different roles and are not direct substitutes.
- Agent SDK/platform: OpenAI Agents SDK or managed control planes [\[7\]](https://openai.github.io/openai-agents-python/)[\[8\]](https://openai.com/index/introducing-openai-frontier/)[\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)[\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)
- Observability, eval, and guardrail tooling layered separately [\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)[\[12\]](https://openai.github.io/openai-agents-python/tracing/)[\[13\]](https://openai.github.io/openai-agents-python/usage/)

The composable approach is defensible. Mature infrastructure is often intentionally decomposed: teams route policy through [OPA](https://www.openpolicyagent.org/), tracing through [OpenTelemetry](https://opentelemetry.io/), and eval gates through CI/CD hooks. That is not wrong. But integration has a cost, and the cost is where hidden debt accumulates. Each seam between tools is a place where enforcement guarantees can slip, latency can creep in, and operational burden compounds — especially once agents are taking real actions across system boundaries.

## The new debt categories

### 1. Determinism debt

Durable orchestration exists, but deterministic behavior is still an application contract, not something the ecosystem can guarantee for you. Temporal and LangGraph both require deterministic/idempotent app design in critical paths [\[2\]](https://docs.temporal.io/workflows)[\[3\]](https://docs.temporal.io/activities)[\[5\]](https://docs.langchain.com/oss/python/langgraph/durable-execution).

Result: in practice, teams commonly ship non-deterministic business logic alongside durable infrastructure, and pay recurring incident and debugging costs that the orchestration layer cannot prevent.

### 2. Side-effect replay debt

LangGraph explicitly warns that code before an interrupt can rerun, so side effects must be idempotent or wrapped correctly [\[6\]](https://docs.langchain.com/oss/javascript/langgraph/interrupts).

Result: replay safety is easy to violate when agents perform external writes, which creates duplicate actions and persistent cleanup work.

### 3. Policy enforcement debt

Policy capabilities are improving. [OPA](https://www.openpolicyagent.org/) and custom middleware can enforce policy at request time and are production-proven. But native policy enforcement within managed agent platforms is immature: AWS AgentCore Policy/Evaluations are still preview [\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/), and Microsoft Foundry policy updates can take meaningful time to propagate [\[11\]](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security).

Result: governance may exist on paper but lag at runtime when you need fast containment. Teams that rely on the platform's native policy surface inherit that latency and maturity gap; teams that roll their own carry the integration burden.

### 4. Replay-to-regression debt

Platforms provide traces and history, but converting production failures into deterministic regression tests remains fragmented. Temporal has workflow replay; LangGraph has persistence/time-travel; OpenAI exposes tracing [\[2\]](https://docs.temporal.io/workflows)[\[4\]](https://docs.langchain.com/oss/python/langgraph/persistence)[\[12\]](https://openai.github.io/openai-agents-python/tracing/). The primitives exist but the path from a trace to a reproducible test case is not automated.

Result: organizations commonly end up debugging incidents manually rather than codifying failures into regression tests, so the same failure modes resurface.

### 5. Evaluation gate debt

Eval tooling exists, and teams can wire CI/CD promotion gates to eval thresholds with tools like [Braintrust](https://www.braintrust.dev/), [Langfuse](https://langfuse.com/), or [Weave](https://wandb.ai/site/weave). But this wiring is custom work per team, not a first-class feature of agent runtimes. Current platform docs emphasize eval surfaces and dashboards rather than a native cross-stack promotion gate [\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)[\[13\]](https://openai.github.io/openai-agents-python/usage/).

Result: "we evaluate" often means "we inspect dashboards," not "we block unsafe promotion." The integration between eval output and deployment decision is re-engineered by each team.

### 6. Budget governance debt

Usage visibility is better, but spending telemetry is not the same as universal pre-execution budget enforcement across all action types [\[13\]](https://openai.github.io/openai-agents-python/usage/).

Result: teams still bolt on spending controls after incidents, creating permanent monitoring and exception-handling overhead.

### 7. Multi-agent causality debt

Multi-agent flows are now common, and tracing/persistence capabilities exist. OpenTelemetry distributed tracing, [LangSmith](https://www.langchain.com/langsmith), [Arize Phoenix](https://phoenix.arize.com/), and [Pydantic Logfire](https://logfire.pydantic.dev/) all contribute to cross-boundary observability. But end-to-end causal lineage across nested agents, tools, and external systems with consistent attribution still has to be composed across multiple tools [\[4\]](https://docs.langchain.com/oss/python/langgraph/persistence)[\[12\]](https://openai.github.io/openai-agents-python/tracing/).

Result: postmortems still commonly ask, "Which sub-agent actually caused this action?" — and that missing causality becomes chronic incident-response debt.

### 8. State/session model debt

State primitives differ and can be mutually constraining. For example, OpenAI session mode is not interchangeable with conversation chaining modes like `conversation_id` and `previous_response_id` [\[14\]](https://openai.github.io/openai-agents-python/sessions/).

Result: portability and migration across stacks introduce silent behavior differences that teams must continuously test and patch.

### 9. Vendor portability debt

Governance/control-plane features are increasingly vendor-specific: Frontier [\[8\]](https://openai.com/index/introducing-openai-frontier/), Foundry control plane [\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/), and AgentCore [\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/).

Result: portability cost is becoming governance debt, not just API debt, because policy rules and audit logic get reimplemented per platform rather than living in a portable layer.

And even after teams close these first-order gaps, a second layer of debt appears in production operations.

## Secondary debt that emerges at scale

These are problems that usually do not appear in prototypes, but become recurring engineering and operations burden once traffic, teams, and production complexity grow.

These are not primary architecture gaps, but they repeatedly become production blockers:

1. **Replay harness maintenance debt:** deterministic/replayable systems require strict behavior contracts, and interrupt semantics can rerun pre-interrupt code. Teams then carry ongoing maintenance burden for replay-safe tests and side-effect boundaries [\[2\]](https://docs.temporal.io/workflows)[\[6\]](https://docs.langchain.com/oss/javascript/langgraph/interrupts).
2. **Policy rollout latency debt:** governance can exist, but operational timing is non-trivial. In Foundry, policy creation/edits can take up to 30 minutes to appear or take effect, and compliance updates follow policy scans [\[11\]](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security).
3. **Preview maturity debt:** critical control-plane capabilities are still marked preview in major platforms, which creates recurring rollout, support, and risk-management overhead for production teams [\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)[\[11\]](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security).
4. **Tenant-governance debt:** multi-tenant identity and compliance controls are improving, but they require explicit policy/identity design and ongoing administration rather than disappearing into the runtime [\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)[\[11\]](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security).
5. **Session-model interoperability debt:** session memory and server-managed conversation continuation modes are not freely composable, so teams must choose and enforce one model per flow [\[14\]](https://openai.github.io/openai-agents-python/sessions/).

Result: teams that solve orchestration still get stuck on operational overhead, the usability of policy and audit tooling, and the ongoing cost of managing these seams at scale.

## What is solved vs what remains open

*Platform capabilities in this section reflect the state as of early 2026; this space moves quickly and specific features may have matured since.*

Durable orchestration is no longer the hardest problem. Temporal provides deep workflow durability, and LangGraph provides durable execution primitives for stateful agent flows [\[2\]](https://docs.temporal.io/workflows)[\[5\]](https://docs.langchain.com/oss/python/langgraph/durable-execution). Individual capabilities for policy (OPA), tracing (OpenTelemetry), and eval gating (CI/CD hooks + eval frameworks) also exist as composable pieces.

The integration cost is where the problem lives. Teams can assemble all five of these capabilities, but assembling them correctly, maintaining enforcement guarantees across seams, and operating them at scale is non-trivial recurring work. As of early 2026, no single platform cited here provides all five as one enforceable runtime surface with consistent semantics:

1. Tool/action policy enforcement [\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)[\[11\]](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security)
2. Deterministic replay of real side effects [\[2\]](https://docs.temporal.io/workflows)[\[3\]](https://docs.temporal.io/activities)[\[6\]](https://docs.langchain.com/oss/javascript/langgraph/interrupts)
3. Eval gates tied to promotion decisions [\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)[\[13\]](https://openai.github.io/openai-agents-python/usage/)
4. Budget controls as hard runtime constraints [\[13\]](https://openai.github.io/openai-agents-python/usage)
5. Unified audit lineage across multi-agent boundaries [\[4\]](https://docs.langchain.com/oss/python/langgraph/persistence)[\[12\]](https://openai.github.io/openai-agents-python/tracing/)

Teams still compose them across products and custom glue [\[8\]](https://openai.com/index/introducing-openai-frontier/)[\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)[\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)[\[12\]](https://openai.github.io/openai-agents-python/tracing/)[\[13\]](https://openai.github.io/openai-agents-python/usage/). That composition is where the recurring debt accumulates.

## Conclusion

Sculley et al.'s warning was that hidden debt compounds until teams lose the ability to reason about system behavior. In agentic systems, that compounding is faster because the system acts externally.

The core risk is not "agents are imperfect."
The core risk is shipping action-taking systems without first-class guarantees for policy, replay, and gating.

The composable approach — OPA for policy, OpenTelemetry for tracing, eval frameworks for quality gates — works. But each seam is a place where enforcement can slip, latency can appear, and operational burden grows. The higher the blast radius of the agent, the more that integration cost matters.

*This post is analysis of the current ecosystem, not a product pitch. The argument is that the integration burden is real and under-discussed, not that any specific solution is the answer.*

## Appendix

### Notes on sources

The determinism and replay claims come directly from runtime behavior documented by Temporal and LangGraph: workflows must remain deterministic for replay, and interrupted LangGraph nodes can restart from the beginning, so pre-interrupt code runs again [\[2\]](https://docs.temporal.io/workflows)[\[6\]](https://docs.langchain.com/oss/javascript/langgraph/interrupts). That is the basis for both determinism debt and replay harness maintenance debt.

The policy and governance claims are grounded in vendor control-plane docs. AWS AgentCore explicitly marks Policy and Evaluations as preview, while Microsoft Foundry documents policy propagation/compliance timing and preview caveats (including no SLA for preview features) [\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)[\[11\]](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security). Those details support policy enforcement debt, policy rollout latency debt, preview maturity debt, and tenant-governance debt. The argument is not that policy enforcement is unsolvable — OPA and custom middleware handle it at request time and are production-proven — but that native policy enforcement within managed agent platforms specifically lags and carries integration cost.

The observability and gating claims come from tracing and usage surfaces: the Agents SDK documents trace/span coverage for runs and tool activity, and usage telemetry for tokens/requests/cost monitoring [\[12\]](https://openai.github.io/openai-agents-python/tracing/)[\[13\]](https://openai.github.io/openai-agents-python/usage/). That supports replay-to-regression debt, multi-agent causality debt, evaluation gate debt, and budget governance debt.

The state-model interoperability claim is explicitly documented: Sessions cannot be combined with `conversation_id`/`previous_response_id`, and the docs instruct choosing one continuation mechanism rather than layering both [\[14\]](https://openai.github.io/openai-agents-python/sessions/). Vendor portability debt is then an ecosystem-level inference from vendor-specific control-plane offerings and feature surfaces across Frontier, Foundry, and AgentCore [\[8\]](https://openai.com/index/introducing-openai-frontier/)[\[9\]](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)[\[10\]](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/).

## References
1. [Sculley et al., Hidden Technical Debt in Machine Learning Systems](https://papers.nips.cc/paper_files/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf)
2. [Temporal Workflows](https://docs.temporal.io/workflows)
3. [Temporal Activities](https://docs.temporal.io/activities)
4. [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
5. [LangGraph Durable Execution](https://docs.langchain.com/oss/python/langgraph/durable-execution)
6. [LangGraph Interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts)
7. [OpenAI Agents SDK Docs](https://openai.github.io/openai-agents-python/)
8. [OpenAI Frontier](https://openai.com/index/introducing-openai-frontier/)
9. [Microsoft Foundry Update](https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-oct-nov-2025/)
10. [AWS AgentCore Policy/Evaluations Preview](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-bedrock-agentcore-policy-evaluations-preview/)
11. [Microsoft Foundry Compliance/Security Controls](https://learn.microsoft.com/en-us/azure/foundry/control-plane/how-to-manage-compliance-security)
12. [OpenAI Agents Tracing](https://openai.github.io/openai-agents-python/tracing/)
13. [OpenAI Agents Usage](https://openai.github.io/openai-agents-python/usage/)
14. [OpenAI Agents Sessions](https://openai.github.io/openai-agents-python/sessions/)
