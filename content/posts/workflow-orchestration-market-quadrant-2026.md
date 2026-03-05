+++
title = "The Workflow Orchestration Landscape — March 2026"
date = 2026-03-04
draft = false
tags = ["orchestration", "workflows", "temporal", "airflow", "prefect", "dagster"]
description = "A comparative map of workflow orchestration platforms as of March 2026, covering execution maturity, product vision, and market positioning."
summary = "A comparative map of workflow orchestration platforms as of March 2026, covering execution maturity, product vision, and market positioning."
ShowToc = true
+++

Most orchestrator comparisons read like feature shopping. That misses the operational reality.

In production, what matters is where run state lives, how failures recover, and how painful operations become after month six.

This post maps the workflow orchestration market as of March 2026.

I created this market map because the space is crowded, the terminology is inconsistent, and most comparisons skip the architecture tradeoffs that actually drive outcomes.

I included tools that do real orchestration (durable run state, retries, multi-step execution, and run visibility). I excluded pure cron runners and raw compute runtimes that do not own orchestration state.

**Disclosure:** This is independent analysis. I have no financial relationship, advisory role, or paid arrangement with any vendor listed. I have used several of these platforms in production contexts. Scores reflect my assessment from public evidence as of March 2026 and are directional rather than statistically precise.

## The 7-Dimension Taxonomy

Before scoring vendors, I classify platforms across seven dimensions:

1. **Control model:** schedule-driven, event-driven, DAG-driven, or durable state-machine-driven.
2. **State model:** ephemeral state, database-backed run state, event history, or code-level durable state.
3. **Execution model:** worker dispatch, API orchestration, embedded task runtime, or coordinator-only.
4. **Durability model:** best-effort, at-least-once with retries, and idempotency/compensation strategy.
5. **Hosting model:** self-hosted, managed cloud, or hybrid control plane plus user-owned compute.
6. **Developer model:** code SDK, YAML/DSL, visual automation, or BPMN/process modeling.
7. **Workload fit:** data pipelines, app workflows, integration automation, ML pipelines, or human-in-loop processes.

The quadrant and scoring tables are a compressed view of this framework.
They are useful for orientation, but the taxonomy is the better lens for architecture decisions.

## Landscape Map

<figure style="margin: 1.25rem 0 1.5rem;">
  <a href="/images/workflow-orchestration-landscape-2026.svg" target="_blank" rel="noopener noreferrer">
    <img
      src="/images/workflow-orchestration-landscape-2026.svg"
      alt="Workflow Orchestration Landscape 2026"
      style="display:block; width:100%; max-width:100%; margin:0 auto; height:auto;"
    />
  </a>
</figure>

## Incumbent Coverage

The scored quadrant uses a representative cohort, not an exhaustive vendor census.
To keep the taxonomy complete, here are major incumbents by category:

| Category | Major incumbents |
| --- | --- |
| Durable execution / app workflows | [Temporal](https://temporal.io/) · [AWS Step Functions](https://aws.amazon.com/step-functions/) · [Azure Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview) · [Google Cloud Workflows](https://cloud.google.com/workflows) |
| Data / DAG orchestration | [Apache Airflow](https://airflow.apache.org/) · [Google Cloud Composer](https://cloud.google.com/composer) · [Dagster](https://dagster.io/) · [Prefect](https://www.prefect.io/) · [Argo Workflows](https://argoproj.github.io/workflows/) |
| Event-native workflow orchestration | [Inngest](https://www.inngest.com/) · [Trigger.dev](https://trigger.dev/) · [Cloudflare Workflows](https://developers.cloudflare.com/workflows/) · [Restate](https://restate.dev/) |
| Integration / automation orchestration | [Pipedream](https://pipedream.com/) · [n8n](https://n8n.io/) · [Workato](https://www.workato.com/) · [Zapier](https://zapier.com/) |
| BPM / process-centric orchestration | [Camunda 8](https://camunda.com/) · [IBM Business Automation Workflow](https://www.ibm.com/products/business-automation-workflow) · [Pega Process AI](https://www.pega.com/products/process-ai) |
| Enterprise workload schedulers | [BMC Control-M](https://www.bmc.com/it-solutions/control-m.html) · [Stonebranch](https://www.stonebranch.com/) · [Tidal](https://www.tidalsoftware.com/) |

Not every incumbent above is scored in the quadrant.
The scoring set emphasizes platforms with publicly comparable evidence and clear developer-facing workflow positioning.

**Excluded from scoring:** Workato and Zapier serve primarily non-developer automation buyers and lack the code-first runtime semantics this comparison prioritizes. [Orkes](https://orkes.io/) (commercial Conductor) is a credible durable execution platform that would sit between the Leaders and Visionaries; it was excluded because its public documentation and changelog activity make per-indicator evidence thinner than the scored cohort.

## How I Built the Map

I score two axes:

- Ability to Execute (Y-axis)
- Completeness of Vision (X-axis)

The scoring model uses five dimensions:

- Reliability and recovery
- State model and upgrade behavior
- Operational maturity
- Ecosystem depth
- Product momentum

Evidence comes from official documentation, changelog and release history, GitHub activity, and community engagement signals (forum activity, job posting trends, conference presence).

## Scoring Model

This map uses a two-axis weighted model with public evidence:

- Ability to Execute = 0.35 * reliability + 0.35 * operations + 0.30 * ecosystem
- Completeness of Vision = 0.45 * state model direction + 0.55 * product momentum

Each dimension is scored from public evidence.
Plotted values indicate relative position, not absolute rank.

<details>
<summary><strong>Appendix: Full Scoring Data</strong></summary>

Indicator set behind each dimension:

- Reliability: retry policy depth, backfill/replay support, long-running state handling, failure recovery primitives.
- Operations: deployment model maturity, observability/run visibility, governance/RBAC posture, version/upgrade operations clarity.
- Ecosystem: integration breadth, execution target flexibility, SDK/language surface, ecosystem/community depth.
- State model direction: explicit state semantics, migration/versioning model quality, idempotency/determinism guidance, advanced primitives (signals/waits/compensation).
- Product momentum: release cadence, meaningful feature velocity, documentation/changelog quality, roadmap coherence.

Indicator scoring method:

- Each indicator is scored 0 to 4 from public evidence.
- Dimension points are summed (0 to 16) and converted with 1 + 9 * (points / 16).
- Final axis values are weighted results rounded to one decimal place.

Quadrant cut lines:

- Ability to Execute >= 6.5 is upper half.
- Completeness of Vision >= 6.5 is right half.

Per-vendor indicator totals (/16):

| Vendor | R pts | O pts | E pts | S pts | M pts |
| --- | ---: | ---: | ---: | ---: | ---: |
| Temporal | 15 | 14 | 14 | 14 | 13 |
| AWS Step Functions | 14 | 14 | 14 | 11 | 13 |
| Apache Airflow | 13 | 12 | 12 | 9 | 11 |
| Prefect | 12 | 12 | 12 | 11 | 12 |
| Dagster | 11 | 11 | 11 | 9 | 9 |
| Argo Workflows | 11 | 10 | 11 | 8 | 9 |
| Azure Durable Functions | 12 | 11 | 11 | 7 | 9 |
| Inngest | 9 | 8 | 9 | 12 | 13 |
| Trigger.dev | 8 | 8 | 8 | 13 | 14 |
| Cloudflare Workflows | 8 | 7 | 8 | 12 | 13 |
| Restate | 7 | 7 | 7 | 14 | 13 |
| Pipedream | 7 | 7 | 7 | 6 | 7 |
| Camunda 8 | 7 | 7 | 7 | 5 | 6 |
| Windmill | 6 | 6 | 7 | 6 | 7 |
| n8n | 6 | 6 | 6 | 5 | 6 |
| Kestra | 7 | 6 | 7 | 7 | 7 |

Computed axis totals:

| Vendor | Ability | Vision | Quadrant |
| --- | ---: | ---: | --- |
| Temporal | 9.0 | 8.6 | Leaders |
| AWS Step Functions | 8.8 | 7.8 | Leaders |
| Apache Airflow | 8.1 | 6.7 | Leaders |
| Prefect | 7.6 | 7.4 | Leaders |
| Dagster | 7.2 | 6.0 | Challengers |
| Argo Workflows | 7.0 | 5.8 | Challengers |
| Azure Durable Functions | 7.4 | 5.6 | Challengers |
| Inngest | 5.8 | 8.0 | Visionaries |
| Trigger.dev | 5.6 | 8.4 | Visionaries |
| Cloudflare Workflows | 5.4 | 8.1 | Visionaries |
| Restate | 5.0 | 8.6 | Visionaries |
| Pipedream | 4.8 | 4.6 | Niche Players |
| Camunda 8 | 4.9 | 4.2 | Niche Players |
| Windmill | 4.6 | 4.8 | Niche Players |
| n8n | 4.5 | 4.0 | Niche Players |
| Kestra | 4.7 | 4.9 | Niche Players |

Subscores used for the totals:

- Temporal: Rel 9.4, Ops 8.9, Eco 8.7, State 8.7, Momentum 8.5.
- AWS Step Functions: Rel 9.0, Ops 8.8, Eco 8.6, State 7.2, Momentum 8.3.
- Apache Airflow: Rel 8.4, Ops 8.0, Eco 7.8, State 6.1, Momentum 7.2.
- Prefect: Rel 7.7, Ops 7.5, Eco 7.6, State 7.1, Momentum 7.6.
- Dagster: Rel 7.3, Ops 7.0, Eco 7.2, State 5.8, Momentum 6.1.
- Argo Workflows: Rel 7.1, Ops 6.8, Eco 7.0, State 5.5, Momentum 6.0.
- Azure Durable Functions: Rel 7.6, Ops 7.3, Eco 7.2, State 5.2, Momentum 5.9.
- Inngest: Rel 5.9, Ops 5.5, Eco 6.0, State 7.8, Momentum 8.2.
- Trigger.dev: Rel 5.6, Ops 5.4, Eco 5.7, State 8.2, Momentum 8.6.
- Cloudflare Workflows: Rel 5.3, Ops 5.2, Eco 5.6, State 7.9, Momentum 8.3.
- Restate: Rel 4.9, Ops 4.8, Eco 5.2, State 8.7, Momentum 8.5.
- Pipedream: Rel 4.9, Ops 4.8, Eco 4.7, State 4.5, Momentum 4.7.
- Camunda 8: Rel 5.1, Ops 4.9, Eco 4.8, State 4.0, Momentum 4.3.
- Windmill: Rel 4.6, Ops 4.5, Eco 4.7, State 4.6, Momentum 4.9.
- n8n: Rel 4.5, Ops 4.4, Eco 4.6, State 3.8, Momentum 4.2.
- Kestra: Rel 4.8, Ops 4.6, Eco 4.7, State 4.7, Momentum 5.0.

Score rationale notes by vendor:

- **Temporal:** Reliability 15/16 — deterministic replay model, timer/signal primitives, long-running workflow durability, well-documented failure compensation. State model 14/16 — explicit versioning API, patch-based workflow migration, signals/queries/update primitives. Ecosystem 14/16 — multi-language SDKs (Go, Java, Python, TypeScript, PHP, Ruby), Temporal Cloud as managed offering, active third-party integrations.
- **AWS Step Functions:** State model 11/16 — JSON state-passing has a 256 KB payload limit; state-transition model creates boundaries for complex branching logic that code-first platforms avoid. Operations 14/16 — managed SLA, CloudWatch integration, IAM-native governance.
- **Apache Airflow:** Scored as the open-source project; managed offerings (MWAA, Cloud Composer, Astronomer) may score higher on operational dimensions. State model 9/16 — DAG-based scheduling with no durable execution primitives; no signals, waits, or compensation patterns.
- **Prefect:** State model 11/16 — deferred execution model and flow/task versioning is more mature than Airflow but less opinionated than Temporal; cross-service orchestration requires more application-level convention. Momentum 12/16 — active Prefect Cloud development and consistent release cadence.
- **Dagster:** State model 9/16 — asset-centric materialization model is strong for data lineage but offers limited signal/wait/compensation primitives; not designed for long-running app workflows.
- **Argo Workflows:** Operations 10/16 — Kubernetes governance and upgrade overhead is material; observability depends on cluster-level tooling rather than built-in workflow visibility.
- **Azure Durable Functions:** State model 7/16 — event-sourcing execution model is conceptually sound but workflow versioning and migration guidance is thinner than Temporal; portability outside Azure is the primary ceiling.
- **Inngest:** State model 12/16 — event-native step execution with clear durable step semantics and failure retry model. Operations 8/16 — step execution limits, cold-start characteristics, and observability depth vary by deployment mode (managed cloud vs. self-hosted).
- **Trigger.dev:** State model 13/16 — strong durable execution semantics with explicit failure recovery and retry primitives; clear determinism model in v3/v4. Momentum 14/16 — fastest release cadence in this comparison set. Lower Ability to Execute reflects shorter production history relative to incumbents.
- **Cloudflare Workflows:** State model 12/16 — Durable Objects-backed execution model provides genuine durability at the edge. Operations 7/16 — newer GA platform; observability and governance tooling is still maturing.
- **Restate:** State model 14/16 — highest score in this dimension. Restate's journal-based execution model provides the most explicit idempotency and compensation semantics of any platform in this set; determinism guarantees are enforced at the runtime level rather than by convention. Vision score (8.6) reflects architectural clarity, not ecosystem breadth. Ability to Execute is lower because production deployment base and ecosystem are smaller than established platforms.
- **Camunda 8:** This map scores developer-centric, code-first workflow positioning. Camunda 8's BPMN/Zeebe model is an enterprise-grade process orchestration platform that would score materially higher in an enterprise BPM or human-in-loop process comparison. The Niche placement reflects its narrower competitive footprint in the code-first, API-driven workflow segment this map emphasizes, not a judgment on its enterprise standing.

</details>

## The Map

How to read this quickly:

- Higher means stronger current execution maturity.
- Further right means stronger forward-looking product direction.
- Small spacing differences are approximate, not precise rank deltas.

![Workflow Orchestration Market Quadrant 2026](/images/workflow-orchestration-market-quadrant-2026.svg)

Where each group lands:

- Leaders: [Temporal](https://temporal.io/) · [AWS Step Functions](https://aws.amazon.com/step-functions/) · [Apache Airflow](https://airflow.apache.org/) · [Prefect](https://www.prefect.io/)
- Challengers: [Dagster](https://dagster.io/) · [Argo Workflows](https://argoproj.github.io/workflows/) · [Azure Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)
- Visionaries: [Inngest](https://www.inngest.com/) · [Trigger.dev](https://trigger.dev/) · [Cloudflare Workflows](https://developers.cloudflare.com/workflows/) · [Restate](https://restate.dev/)
- Niche Players: [Pipedream](https://pipedream.com/) · [Camunda 8](https://camunda.com/) · [Windmill](https://www.windmill.dev/) · [n8n](https://n8n.io/) · [Kestra](https://kestra.io/)

## How to Use This

If you are selecting a platform this quarter:

1. Pick your primary workload class first: data pipelines, durable app workflows, integration/event automation, or human-in-loop processes.
2. Start with one candidate from your likely-fit quadrant and one adjacent alternative.
3. Compare on failure handling and operational clarity before comparing UI polish.

### Decision Tree

```text
Primary workload class?
|
+--> Data pipelines?
|      +--> Lineage-first: Dagster / Prefect
|      \--> Scheduler-first: Airflow
|
+--> App or product workflows?
|      +--> Long-running reliability critical?
|      |      +--> Cloud-neutral: Temporal
|      |      \--> Cloud-native: Step Functions / Azure Durable
|      |
|      \--> Event and integration automation?
|             +--> Inngest / Trigger.dev / Cloudflare Workflows
|             \--> Pipedream / n8n / Windmill / Kestra
|
\--> BPM or human-in-loop process?
       \--> Camunda 8
```

## Platform Notes by Vendor

### [Temporal](https://temporal.io/)

- **Strengths:** Durable execution depth with a mature timer, signal, and retry model. Deterministic replay handles long-running state across restarts. Multi-language SDK coverage (Go, Java, Python, TypeScript, PHP, Ruby) with managed cloud option. [1](https://docs.temporal.io/) [2](https://github.com/temporalio/temporal/releases)
- **Tradeoffs:** Deterministic replay requires strict discipline around side effects and workflow code changes — non-determinism bugs surface at replay time, not at write time. [1](https://docs.temporal.io/)

### [AWS Step Functions](https://aws.amazon.com/step-functions/)

- **Strengths:** High managed reliability with AWS-native SLA, IAM governance, and deep service integration. Standard Workflows provide durable execution with at-least-once semantics. [3](https://aws.amazon.com/step-functions/)
- **Tradeoffs:** JSON state-passing has a 256 KB payload limit; complex branching logic hits state-transition model boundaries that code-first platforms avoid. Deep AWS coupling constrains portability. [3](https://aws.amazon.com/step-functions/) [4](https://aws.amazon.com/step-functions/pricing/)

### [Apache Airflow](https://airflow.apache.org/)

- **Strengths:** Strong scheduling, backfill, and DAG execution posture with broad ecosystem coverage. Largest installed base of any orchestrator in the data engineering segment. [5](https://airflow.apache.org/docs/apache-airflow/stable/)
- **Tradeoffs:** No durable execution primitives — no signals, waits, or compensation patterns. Operational ownership overhead (scheduler, workers, metadata database) increases with scale. Managed variants (MWAA, Cloud Composer, Astronomer) significantly reduce this burden; this score reflects the open-source baseline. [5](https://airflow.apache.org/docs/apache-airflow/stable/)

### [Prefect](https://www.prefect.io/)

- **Strengths:** Modern Python-first developer model with mature control-plane abstractions. Prefect Cloud provides a clean separation between orchestration logic and execution infrastructure. [7](https://docs.prefect.io/orchestration)
- **Tradeoffs:** Cross-service orchestration requires more application-level convention than Temporal; flow and task versioning is less opinionated, which works well within a single team's standards but creates drift risk across larger organizations. [7](https://docs.prefect.io/orchestration)

### [Dagster](https://dagster.io/)

- **Strengths:** Strong asset-centric model and lineage-oriented data workflow semantics. Software-defined assets provide explicit dependency tracking and materialization history. [8](https://docs.dagster.io/)
- **Tradeoffs:** Best fit is data-centric workloads; limited signal, wait, and compensation primitives make it a poor fit for long-running app orchestration. [8](https://docs.dagster.io/)

### [Argo Workflows](https://argoproj.github.io/workflows/)

- **Strengths:** Kubernetes-native execution with strong container workflow semantics. DAG and steps-based execution models are well-suited for ML training pipelines and batch workloads. [6](https://argoproj.github.io/workflows/)
- **Tradeoffs:** Kubernetes operational and governance overhead is material — observability, RBAC, and upgrade operations all depend on cluster-level tooling rather than built-in workflow visibility. [6](https://argoproj.github.io/workflows/)

### [Azure Durable Functions](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)

- **Strengths:** Durable workflow execution within Azure Functions using an event-sourcing model. Supports orchestrators, activity functions, and entity patterns. [9](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)
- **Tradeoffs:** Workflow versioning and migration guidance is thinner than Temporal; portability is weak outside Microsoft-centric stacks. [9](https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview)

### [Inngest](https://www.inngest.com/)

- **Strengths:** Event-native developer model with durable step execution semantics. Steps are independently retried, and the SDK makes failure isolation explicit rather than implicit. [10](https://www.inngest.com/docs/) [11](https://www.inngest.com/changelog)
- **Tradeoffs:** Step execution limits, cold-start characteristics, and observability depth vary by deployment mode. Teams hosting their own execution endpoints take on more operational responsibility than the managed-cloud path provides. [10](https://www.inngest.com/docs/)

### [Trigger.dev](https://trigger.dev/)

- **Strengths:** Fast release cadence, strong app workflow developer ergonomics, and clear durable execution semantics. Explicit failure recovery and retry primitives make failure paths first-class. [12](https://trigger.dev/docs) [13](https://trigger.dev/changelog/v4-4-0)
- **Tradeoffs:** Shorter production history than the Leaders and Challengers in this comparison; production reliability track record is still being established at scale. [13](https://trigger.dev/changelog/v4-4-0)

### [Cloudflare Workflows](https://developers.cloudflare.com/workflows/)

- **Strengths:** Durable Objects-backed execution provides genuine durability at the edge, with no external database dependency. Active platform development since GA. [14](https://developers.cloudflare.com/workflows/) [15](https://developers.cloudflare.com/changelog/post/2025-04-07-workflows-ga/)
- **Tradeoffs:** Observability and governance tooling are still maturing post-GA. Execution is constrained to Cloudflare's runtime; workloads requiring arbitrary compute targets must proxy out to external services. [14](https://developers.cloudflare.com/workflows/)

### [Restate](https://restate.dev/)

- **Strengths:** Journal-based execution model with the most explicit idempotency and compensation semantics of any platform in this set. Determinism is enforced at the runtime level, not by convention. Vision score reflects architectural clarity — the state model design is as principled as Temporal's with a different implementation approach. [16](https://docs.restate.dev/tour/workflows)
- **Tradeoffs:** Production ecosystem and publicly visible deployment base are smaller than established platforms. Teams evaluating Restate should account for a thinner community and fewer third-party integrations. [16](https://docs.restate.dev/tour/workflows)

### [Camunda 8](https://camunda.com/)

Camunda 8 is an enterprise-grade BPMN process orchestration platform built on Zeebe. This map scores developer-centric, code-first workflow positioning — Camunda's primary differentiator is BPMN-modeled human-in-loop and approval processes, which is a different buyer and use case than the app workflow segment this quadrant emphasizes. In an enterprise BPM or regulated-process comparison, Camunda 8 would score materially higher.

- **Strengths:** Mature BPMN modeling, strong enterprise governance and audit trail, large existing customer base in regulated industries. [18](https://docs.camunda.io/)
- **Tradeoffs:** Developer ergonomics for code-first app workflows are weaker than Temporal or Prefect; BPMN overhead is unnecessary for teams that don't need visual process modeling or compliance audit trails. [18](https://docs.camunda.io/)

### [Pipedream](https://pipedream.com/) · [Windmill](https://www.windmill.dev/) · [n8n](https://n8n.io/) · [Kestra](https://kestra.io/)

These platforms differentiate in narrower segments and are scored as a group.

- **Pipedream:** Strong integration automation posture with a large connector library; weaker on complex multi-step orchestration reliability. [17](https://pipedream.com/docs/workflows)
- **Windmill:** Developer-friendly internal tool and script runner with growing workflow capabilities; more script platform than full orchestrator. [19](https://www.windmill.dev/docs/intro)
- **n8n:** Low-code visual automation with self-hosted option; primary audience is non-engineering teams. [20](https://docs.n8n.io/workflows/)
- **Kestra:** YAML-first orchestration with a broad plugin ecosystem; reasonable fit for teams that prefer declarative workflow definitions. [21](https://kestra.io/docs)

## What I Expect Next (2026 to 2028)

These are directional hypotheses, not forecasts.

- **Execution maturity will close for Visionaries.** At least one of Inngest, Trigger.dev, or Cloudflare Workflows will publish sufficient production reliability evidence — SLA data, postmortem histories, or scale benchmarks — to move out of the Visionaries execution ceiling by end of 2026.
- **Restate either achieves managed-cloud traction or stays architecturally notable but niche.** The journal-based model is sound; whether it builds enough ecosystem around it to challenge Temporal on execution maturity is the open question.
- **Workflow versioning becomes a primary differentiator.** Schema and code versioning for long-running workflows will cause more production incidents than scheduling failures for most teams. Platforms with explicit versioning primitives (Temporal's patch API, Restate's service versioning) will have a growing advantage.
- **Airflow's managed variants widen their gap from self-hosted.** As self-hosted operational costs compound, the practical choice in the Airflow ecosystem consolidates around MWAA, Cloud Composer, and Astronomer rather than raw Airflow.

## Bottom Line

No single platform dominates every workflow class. Data pipelines, durable application workflows, and event-driven product automation reward different architecture choices.

Use this as a map of tradeoffs, not a universal ranking. Placements reflect relative positioning as of March 2026 and will move as products and ecosystems evolve.

## References

1. <https://docs.temporal.io/>
2. <https://github.com/temporalio/temporal/releases>
3. <https://aws.amazon.com/step-functions/>
4. <https://aws.amazon.com/step-functions/pricing/>
5. <https://airflow.apache.org/docs/apache-airflow/stable/>
6. <https://argoproj.github.io/workflows/>
7. <https://docs.prefect.io/orchestration>
8. <https://docs.dagster.io/>
9. <https://learn.microsoft.com/en-us/azure/azure-functions/durable/durable-functions-overview>
10. <https://www.inngest.com/docs/>
11. <https://www.inngest.com/changelog>
12. <https://trigger.dev/docs>
13. <https://trigger.dev/changelog/v4-4-0>
14. <https://developers.cloudflare.com/workflows/>
15. <https://developers.cloudflare.com/changelog/post/2025-04-07-workflows-ga/>
16. <https://docs.restate.dev/tour/workflows>
17. <https://pipedream.com/docs/workflows>
18. <https://docs.camunda.io/>
19. <https://www.windmill.dev/docs/intro>
20. <https://docs.n8n.io/workflows/>
21. <https://kestra.io/docs>
