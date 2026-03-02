+++
title = "Distillation Isn’t an Attack. It’s a Moat Test."
date = 2026-03-02
draft = false
tags = ["ai", "llm", "distillation", "economics"]
description = "Distillation reveals which capabilities are economically reproducible."
summary = "Distillation reveals which capabilities are economically reproducible."
ShowToc = false
+++

When a frontier model is exposed through an API, what is being sold is a function. It can be queried, observed, and learned from. If another group trains on those outputs and improves, the relevant variable is not intent. It is transfer.

How much capability moves per unit of sampling?

If large-scale querying meaningfully narrows a gap that required vastly more compute and capital to create, then the exposed behavior was economically compressible.

That does not mean frontier systems are trivial. Differences in data quality, mixture, compute allocation, and synthetic reasoning traces create real separation across models. Nor can a small model absorb frontier reasoning wholesale. Distillation only transfers what the student has the representational capacity to express. What it does show is narrower but important: once a sufficiently strong base exists, coherent and stable behavior exposes statistical structure.

Reinforcement learning adds an important wrinkle. Large-scale, on-policy RL requires generating trajectories from the model being trained. That process cannot be outsourced through API sampling. You cannot distill the training loop itself, though any reasoning traces or policy behaviors exposed at inference become data for others. The RL process may be insulated even if parts of its outputs are not.

The same logic applies to data and enforcement. Proprietary datasets create upstream barriers that distillation cannot cross. Noise injection, rate limits, and legal controls reduce signal or access. These are economic and operational defenses, not proof that exposed behavior is unlearnable.

The structural point is simple. Exposed, coherent behavior contains statistical structure. Under sufficient capacity and scale, some of that structure can be approximated. The real question is not whether approximation is possible, but whether it is economically and operationally feasible.

Distillation does not dissolve moats. It reveals where they sit.
