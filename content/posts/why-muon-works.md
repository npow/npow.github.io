+++
title = "Why does Muon work?"
date = 2026-11-10T12:00:00-08:00
draft = false
tags = ["machine-learning", "optimization", "muon", "adam", "deep-learning"]
description = "I wanted to understand why the Muon optimizer works, so I went back through SGD, momentum, Adam and Shampoo and built a simulation for each idea."
summary = "I wanted to understand why the Muon optimizer works, so I went back through SGD, momentum, Adam and Shampoo and built a simulation for each idea."
ShowToc = true
+++

<link rel="stylesheet" href="/muon/muon.css?v=4">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">

[Muon](https://kellerjordan.github.io/posts/muon/) is an optimizer for neural networks that Keller Jordan and collaborators published in late 2024. I wanted to understand why it works, because what it does to the gradient looks like it should make training worse.

The whole method fits in three sentences. For each weight matrix in the network, keep a running average of recent gradients. Take that average, which is itself a matrix, and replace it with the nearest matrix that stretches every direction by the same amount. Subtract the result from the weights.

A gradient tells you which directions to move in and how much each one matters. The middle step keeps the directions and throws away the "how much". I expected that to hurt. The results so far say it helps:

- Muon set a record in the [NanoGPT speedrun](https://github.com/KellerJordan/modded-nanogpt) in October 2024. That's a public competition to train a small GPT-2-style model to a target validation loss as fast as possible. The next twelve records, through that December, all used it.
- Moonshot AI [found](https://arxiv.org/abs/2502.16982) that it matched AdamW's loss with about 52% of the compute. They went on to train [Kimi K2](https://arxiv.org/abs/2507.20534) with a Muon variant. That model has a trillion parameters and saw 15.5 trillion tokens.

To make sense of this I ended up going back through the optimizers that came before: SGD, momentum, Adam and Shampoo. Each of them decides how to measure the size of a step, usually without saying so. Muon only made sense to me once I saw it as a different answer to that same question, so this post goes through them in order.

I built a simulation for each idea along the way. They run the real update rules in your browser, so you can drag the sliders and check what I say against what happens. The [simulation code](/muon/muon-core.js) is plain JavaScript.

These are the methods I cover, coloured by what each one adjusts.

<div class="mu-era-key"><span><i style="background:#2a78d6"></i>One step size for everything</span><span><i style="background:#eb6834"></i>One step size per coordinate</span><span><i style="background:#1baf7a"></i>One step size per matrix direction</span></div>
<ul class="mu-timeline">
<li class="e1"><span>1951</span><b>SGD</b>Follow the gradient.</li>
<li class="e1"><span>1964</span><b>Momentum</b>Remember past gradients.</li>
<li class="e1"><span>1983</span><b>Nesterov</b>Look ahead before measuring.</li>
<li class="e2"><span>2011</span><b>AdaGrad</b>Shrink steps on busy coordinates.</li>
<li class="e2"><span>2012</span><b>RMSProp</b>Forget old gradient sizes.</li>
<li class="e2"><span>2014</span><b>Adam</b>RMSProp plus momentum.</li>
<li class="e2"><span>2017</span><b>AdamW</b>Weight decay done separately.</li>
<li class="e3"><span>2018</span><b>Shampoo</b>Precondition rows and columns.</li>
<li class="e3"><span>2024</span><b>SOAP</b>Adam inside Shampoo’s basis.</li>
<li class="e3"><span>2024</span><b>Muon</b>Orthogonalize the update.</li>
</ul>

## Gradient descent and ill-conditioning

Training means finding weights w that make a loss L(w) small. The gradient g has one number per weight and points in the direction that increases the loss fastest, so you step the other way:

<div class="mu-eq">\[ w \leftarrow w - \eta\, g \]</div>

η is the learning rate. In practice the gradient comes from a random batch of data, which is where the "stochastic" in [stochastic gradient descent](https://doi.org/10.1214/aoms/1177729586) (SGD) comes from.

The trouble is that you get one learning rate for every direction, and loss surfaces are far steeper in some directions than in others. Imagine a long valley with steep walls and a floor that slopes gently toward the minimum. If the step is too big you bounce from one wall to a higher spot on the other, and the loss blows up. If the step is small enough to be safe on the walls, you creep along the floor.

The ratio between the steepest and the shallowest curvature is the [condition number](https://en.wikipedia.org/wiki/Condition_number) κ. With the learning rate set for the walls, each step covers about 1/κ of the distance left along the floor, so SGD takes roughly κ steps. A problem with a large κ is called ill-conditioned, and every method below is an attempt to cope with that.

## Momentum

[Momentum](https://doi.org/10.1016/0041-5553%2864%2990137-5) (Polyak, 1964) steps along a decaying sum of past gradients:

<div class="mu-eq">\[ m \leftarrow \beta\, m + g, \qquad w \leftarrow w - \eta\, m \]</div>

β is usually 0.9. Along the valley floor the gradients all point the same way, so the sum builds up to 1/(1 − β) = 10 times a single gradient and you move ten times faster. Across the valley the gradients keep flipping sign and mostly cancel. With a well-chosen β this brings the cost down from about κ steps to about √κ.

Nesterov momentum (1983) is the same rule with one change. It measures the gradient at the point the momentum is about to carry you to, w − ηβm, which catches an overshoot one step sooner. [Sutskever et al.](https://proceedings.mlr.press/v28/sutskever13.html) describe the version that deep learning uses.

## Adaptive methods: AdaGrad, RMSProp, Adam

The other idea is to give every weight its own step size. [AdaGrad](https://jmlr.org/papers/v12/duchi11a.html) (Duchi, Hazan and Singer, 2011) keeps a running sum v of each weight's squared gradients and divides that weight's step by the square root:

<div class="mu-eq">\[ v \leftarrow v + g^2, \qquad w \leftarrow w - \eta\, \frac{g}{\sqrt{v}} \]</div>

Everything here is elementwise. Weights with big gradients get small steps and weights with small gradients get big ones. The catch is that v only ever grows, so on a long run the steps shrink toward zero. [RMSProp](https://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf) (from Geoffrey Hinton's 2012 lecture slides) swaps the sum for a running average, v ← β₂v + (1 − β₂)g², so old gradients fade out.

[Adam](https://arxiv.org/abs/1412.6980) (Kingma and Ba, 2014) is RMSProp plus momentum, plus a fix for the first few steps:

<div class="mu-eq">\[ \begin{aligned} m &\leftarrow \beta_1 m + (1-\beta_1)\, g, &\qquad \hat m &= m / (1-\beta_1^{\,t}) \\ v &\leftarrow \beta_2 v + (1-\beta_2)\, g^2, &\qquad \hat v &= v / (1-\beta_2^{\,t}) \end{aligned} \qquad\quad w \leftarrow w - \eta\, \frac{\hat m}{\sqrt{\hat v} + \epsilon} \]</div>

Both averages start at zero, so early on they are too small, and dividing by 1 − βᵗ at step t corrects for that. RMSProp doesn't do this. With β₂ = 0.99 its very first step comes out ten times larger than η, which you can see in the figures below.

All three methods share one property. When a weight's gradient is steady, g/√v is close to ±1, so the weight moves about η per step however large or small its gradient is. A steep direction and a shallow one get the same step length, as long as each direction is a single weight. That last condition is where Adam runs into trouble.

[AdamW](https://arxiv.org/abs/1711.05101) (Loshchilov and Hutter, 2017) changes how weight decay is applied. Weight decay shrinks every weight slightly toward zero on each step. Adam folded it into the gradient, where it got rescaled by 1/√v along with everything else. AdamW applies it straight to the weights. It's the baseline in every comparison later in this post.

## Comparing the five methods

Here are SGD, momentum, Nesterov, RMSProp and Adam on two surfaces. The valley has walls fifty times steeper than its floor (κ = 50). The saddle is a ridge between two basins, and I start every optimizer almost exactly on the ridge line, where there is barely any sideways slope.

<figure class="mu-fig" id="mu-surface">
<noscript>This figure needs JavaScript. It draws a 3-D loss surface with the paths of five optimizers on it.</noscript>
<figcaption><b>Figure 1. Five optimizers on a valley and a saddle.</b> Every optimizer starts from the same point and runs for 150 steps. Height is the square root of the loss, so the gentle slope along the floor stays visible next to the steep walls. Lines are drawn on top of the surface, so a path on the far side of a ridge still shows. Drag to rotate, press Play, then switch to Saddle.</figcaption>
</figure>

On the saddle, SGD's step is proportional to the slope, so it slides down to the saddle point and sits there. After 150 steps it still hasn't reached either basin. Momentum builds up the tiny sideways gradient and gets out after about 40 steps. Adam divides by the gradient's size, so a tiny slope still gives a full-sized step, and it is out in about 10. RMSProp leaves on step one, thanks to that oversized first step.

The valley is easier to read from directly above. This version also plots the loss, and has two sliders: one for κ, and one that rotates the whole valley relative to the coordinate axes.

<figure class="mu-fig" id="mu-race">
<noscript>This figure needs JavaScript. It races SGD, momentum, Nesterov, RMSProp and Adam down a 2-D valley.</noscript>
<figcaption><b>Figure 2. The valley from above, with the loss at each step.</b> Loss is ½(a² + κb²), with a along the valley floor and b across it. SGD, momentum and Nesterov use learning rate 1/κ (momentum 0.9). RMSProp and Adam use 0.05 with their usual defaults. There is no gradient noise here, so the shapes of the paths mean more than the final ranking. Press Play, then set the rotation to 45°.</figcaption>
</figure>

SGD (blue) fixes the error across the valley in a single step and then crawls along the floor. Momentum and Nesterov cover the floor about ten times faster. Momentum overshoots across the valley and wobbles for a while before it settles, and Nesterov wobbles less.

With the rotation at 0°, the steep direction is one coordinate and the shallow direction is the other. RMSProp and Adam rescale each coordinate separately, so you can drag κ anywhere and their paths don't change.

Now set the rotation to 45°. The steep direction is a mix of both coordinates, and so is the shallow one. Each coordinate sees the same mix, per-coordinate scaling has nothing to pull apart, and RMSProp and Adam slow right down. SGD and momentum don't care. Their paths are the same as before, turned 45°.

So Adam fixes ill-conditioning only when it lines up with individual weights. In real networks it lines up often enough that Adam has been the default for ten years. Nothing guarantees that it will, though, and for weight matrices there is a better option.

## Optimizers as steepest descent under a norm

There's a tidy way to describe what happened at 45°. I got the framing from the paper [Old Optimizer, New Norm](https://arxiv.org/abs/2409.20325) by Jeremy Bernstein and Laker Newhouse.

Say you're allowed a step Δ of limited size and you want the one that lowers the loss most. To first order a step changes the loss by ⟨G, Δ⟩, where G is the gradient: multiply each weight's gradient by its step and add them all up. So you solve

<div class="mu-eq">\[ \Delta W \;=\; \arg\min_{\Delta}\ \langle G, \Delta\rangle \quad \text{subject to}\quad \lVert \Delta \rVert \le \eta \]</div>

The answer depends on how you measure the size of Δ, which is to say on the norm you pick. Every norm has a unit ball, the set of all steps of size 1 or less, and the best step is whichever point of the ball is furthest downhill. Here is that picture for two weights.

<figure class="mu-fig" id="mu-balls">
<noscript>This figure needs JavaScript. It shows the steepest-descent step under the ℓ2, ℓ∞ and spectral norms.</noscript>
<figcaption><b>Figure 3. The best step under three norms.</b> Dashed arrow: the downhill direction. Solid arrow: the furthest-downhill point of each unit ball. The right panel is explained in the next section. Its axes are the gradient’s two singular directions, so the dashed arrow’s components are its singular values.</figcaption>
</figure>

In the left panel, size means ordinary Euclidean length. The ball is a circle and the furthest-downhill point is straight opposite the gradient. That's SGD.

In the middle panel, size means the largest absolute entry of the step, which is called the ℓ∞ norm, and the ball is a square. The furthest-downhill point is always a corner. Every weight moves the full η and only the sign of its gradient matters. This rule is called sign descent.

The paper's observation is that Adam turns into sign descent when you switch its two running averages off. Set β₁ = β₂ = 0 and the update is g/√(g²), which is the sign of g. So Adam is sign descent with smoothing on top, and its norm is the ℓ∞ norm. The sides of that square are fixed to the coordinate axes, and that is the 45° failure from the previous figure drawn as geometry.

The right panel uses a norm that only exists for matrices, and it needs a bit more setup.

## The spectral norm and matrix-structured updates

Up to here I've treated the weights as a flat list. In a real network most of them sit in matrices. A linear layer computes y = Wx, and a 4096 × 4096 layer has 16.8 million weights, which the ℓ∞ norm treats as 16.8 million unrelated numbers.

What I care about with an update ΔW is how much it changes the layer's output, and that change is ΔW·x. The largest factor by which ΔW can stretch any input is its spectral norm, and it bounds the change in output directly:

<div class="mu-eq">\[ \lVert \Delta y \rVert \;\le\; \lVert \Delta W \rVert_{\text{spectral}} \cdot \lVert x \rVert \]</div>

To find the best step under that norm you need the [singular value decomposition](https://en.wikipedia.org/wiki/Singular_value_decomposition) (SVD), which writes any matrix as a sum of simple pieces:

<div class="mu-eq">\[ G \;=\; \sum_i \sigma_i\, u_i v_i^{\top} \;=\; U \Sigma V^{\top} \]</div>

Each piece takes one input direction vᵢ, sends it to one output direction uᵢ, and scales it by σᵢ ≥ 0. The σᵢ are the singular values, and I'll call each (uᵢ, vᵢ) pair a singular direction. The spectral norm of a matrix is its largest σ.

With the gradient written that way, the best step is

<div class="mu-eq">\[ \Delta W \;=\; -\,\eta \sum_i u_i v_i^{\top} \;=\; -\,\eta\, U V^{\top} \]</div>

It has the same singular directions as the gradient, with every singular value replaced by 1. The spectral norm caps each direction's strength at η independently of the others, and the loss falls fastest when you use the full allowance in every one of them. UVᵀ is an orthogonal matrix (semi-orthogonal if it isn't square), so this is called orthogonalizing the gradient. It is the "nearest matrix that stretches every direction by the same amount" from the top of the post.

Now the right panel of Figure 3 makes sense. Its axes are two singular directions of the gradient, and along those axes the spectral ball is a square, so the best step is always the same corner. It is sign descent on singular values. Adam's axes come from however the weights happen to be laid out. These axes come from the gradient, so if you rotate the layer's inputs or outputs, the update rotates with them. That is what Adam couldn't do when I rotated the valley.

The same formula turns up somewhere else. [Shampoo](https://arxiv.org/abs/1802.09568) (Gupta, Koren and Singer, 2018) is an optimizer that keeps two matrices per layer, running sums of GGᵀ and GᵀG. They record how gradients correlate across the rows and across the columns of the weight matrix. Shampoo multiplies the gradient by inverse roots of both, which is called preconditioning, and that lets it correct ill-conditioning that isn't aligned with the axes. You pay for it by storing and inverting those matrices. [SOAP](https://arxiv.org/abs/2409.11321) (2024) is a refinement that runs Adam inside the coordinate system those matrices define.

Throw away Shampoo's running sums, keep only the current gradient, and its update becomes

<div class="mu-eq">\[ (GG^{\top})^{-1/4}\; G\; (G^{\top}G)^{-1/4} \;=\; U V^{\top} \]</div>

So the orthogonalized gradient is also Shampoo with no memory.

How much does this change a real gradient? Jordan [noticed](https://kellerjordan.github.io/posts/muon/) that updates to transformer weight matrices are close to low-rank, meaning a handful of singular values are much bigger than the rest. I built a 24 × 16 gradient whose singular values decay at a rate you set with the slider, and measured how much of one step each rule hands to each singular direction.

<figure class="mu-fig" id="mu-alloc">
<noscript>This figure needs JavaScript. It plots how SGD, sign descent and Muon spread a step across the singular directions of a gradient matrix.</noscript>
<figcaption><b>Figure 4. How each rule spreads one step across singular directions.</b> Each point is uᵢᵀ(update)vᵢ, the update’s component along the gradient’s i-th singular direction, divided by the largest. Random singular vectors, fixed seed. “Adam, averages off” is the elementwise sign of the gradient. Muon is computed with the five-step approximation it uses in practice, described in the next section, which is why its line varies between about 0.6 and 1 instead of sitting at exactly 1.</figcaption>
</figure>

At the default setting SGD gives the tenth direction about 7% of what it gives the first, since SGD's step is the gradient. Taking the sign of every entry, which is Adam with its averages off, hardly changes that. Low-rank structure belongs to the whole matrix and you can't see it one entry at a time. Orthogonalizing gives every direction a similar step.

If you push the slider to the right you'll also find a limit of the practical method I describe next. Directions thousands of times weaker than the strongest don't get lifted all the way.

## The Muon algorithm

An exact SVD of every weight matrix on every step would be far too slow. Muon gets nearly the same result from a few matrix multiplications. This is the update for one weight matrix, condensed from the [reference implementation](https://github.com/KellerJordan/Muon) on GitHub.

```python
momentum.lerp_(grad, 1 - beta)                 # beta = 0.95
update = grad.lerp(momentum, beta)             # Nesterov
update = newton_schulz(update, steps=5)        # ≈ U Vᵀ
update *= max(1, rows / cols) ** 0.5
W.mul_(1 - lr * weight_decay)
W.add_(update, alpha=-lr)
```

The first two lines are Nesterov momentum with β = 0.95, written as a running average (`lerp` is linear interpolation). Momentum goes in before the orthogonalization, and Jordan reports that this order works better than the other way round. Line 3 does the approximate orthogonalization. Line 4 rescales the update for matrices with more outputs (rows) than inputs (columns). The last two lines apply weight decay directly to the weights, as AdamW does, and take the step.

Line 3 is a Newton–Schulz iteration. First divide the matrix by its overall size so that every singular value is at most 1. Then apply X ← aX + b(XXᵀ)X + c(XXᵀ)²X five times. A polynomial of that shape leaves the singular directions alone and sends each singular value x to ax + bx³ + cx⁵, so five rounds push every singular value through the same curve five times. If the coefficients are chosen so the curve drives values toward 1, you have an orthogonalizer.

<figure class="mu-fig" id="mu-ns">
<noscript>This figure needs JavaScript. It plots the Newton–Schulz polynomial after a chosen number of iterations.</noscript>
<figcaption><b>Figure 5. Where a singular value ends up after k rounds of Newton–Schulz.</b> Each curve is the polynomial applied k times to a singular value. The horizontal axis is logarithmic because the small singular values are the ones that need lifting.</figcaption>
</figure>

The textbook coefficients are a cubic, (1.5, −0.5). It converges to exactly 1, but it only multiplies small values by 1.5 per round, so weak directions take a long time to come up. Muon uses (3.4445, −4.7750, 2.0315), which were tuned the other way. Small values get multiplied by 3.44 per round and nothing ever quite settles. After five rounds the singular values sit between about 0.7 and 1.2. The docstring in the code says this "turns out not to hurt model performance at all". It is also why Muon's line in Figure 4 isn't flat.

The extra cost is a few multiplications of matrices the size of the weights, and it doesn't grow with the batch size. Jordan bounds the overhead at T·m/B for T rounds, model width m and a batch of B tokens. For the NanoGPT speedrun (m = 768, B = 524,288) that comes to 0.7%. Memory is one momentum matrix per weight matrix, against Adam's two.

Muon is only meant for part of the network. It is used on hidden weight matrices, meaning the 2-D weights inside the network such as the attention and feed-forward projections. The embedding table, the output layer, biases and normalization gains all stay on AdamW. Convolution filters get flattened into matrices first. So a Muon setup is two optimizers with separate learning rates.

## A controlled experiment on a linear layer

I wanted to see whether the geometry shows up in training or only in diagrams. If the argument above is right, Muon should win when a layer's ill-conditioning isn't aligned with its coordinates, and Adam should win when it is. This is the smallest test of that I could come up with.

One 16 × 16 linear layer W learns to match a fixed target W*. Its inputs have variance 1 along some directions and as little as 1/κ along others. The gradient works out to the error W − W* times the input covariance, so input directions with little variance produce small gradients and get learned slowly. A checkbox sets whether those directions are the coordinate axes or a random rotation of them.

Every optimizer gets the best of 13 learning rates, judged by its final loss, and the learning rate decays linearly to zero over 150 steps.

<figure class="mu-fig" id="mu-toy">
<noscript>This figure needs JavaScript. It trains a 16 by 16 linear layer with SGD, Adam and Muon.</noscript>
<figcaption><b>Figure 6. Training a 16 × 16 linear layer with SGD, Adam and Muon.</b> Loss is ½·tr((W − W*)C(W − W*)ᵀ). SGD uses Nesterov momentum 0.9, Adam uses (0.9, 0.999), Muon uses momentum 0.95 and 5 Newton–Schulz steps, as in the reference code. Full-batch, no noise, 150 steps, one fixed random problem. </figcaption>
</figure>

At κ = 1000 with rotated inputs, Muon is behind for about the first hundred steps. Then SGD and Adam stall, because the low-variance directions give them almost no gradient to work with. Muon has been taking equal-sized steps in every direction the whole time, and as its learning rate decays it settles into the minimum. It ends about 25 times lower than SGD and 70 times lower than Adam.

The problem in the figure is the best for Muon of five random ones I ran. Over all five, Muon ended 13 to 26 times lower than SGD and 22 to 68 times lower than Adam, in the same order each time.

Untick the checkbox and the ill-conditioning lines up with individual input coordinates, which is the case Adam handles. Adam finishes more than a hundred times lower than Muon. Muon's own result barely moves.

Set κ to 10 and SGD with momentum finishes far below both of the others. When the gradient's singular values are already similar, equalizing them buys nothing.

Both of those match the prediction. It's a noiseless linear toy, so it tells you nothing about language models. The published results further down do that job.

## Explanations for why Muon works

I don't think anyone has a settled answer for real networks. I found four explanations. They rest on different kinds of evidence and they don't contradict each other.

The first is the geometry argument from earlier. The spectral norm bounds how much a layer's output changes and the ℓ∞ norm doesn't. Bernstein's [derivation of Muon](https://jeremybernste.in/writing/deriving-muon) uses a rescaled version that measures inputs and outputs by their root-mean-square entry, which multiplies the update by √(outputs / inputs). With that scaling, a learning rate tuned on a narrow network should still be right for a wide one. [Essential AI](https://arxiv.org/abs/2505.02222) reported learning rates transferring this way up to 3.7 billion parameters.

The second is Jordan's own. He observed that the updates SGD and Adam produce for transformer weight matrices are "dominated by just a few directions", and guessed that orthogonalizing helps by scaling up directions that are weak in the gradient but still matter for learning. He calls this speculation. Figure 4 shows the mechanism but can't tell you whether the weak directions matter.

The third comes from a 2026 paper by [Wu et al.](https://arxiv.org/abs/2608.25990) that measured, on held-out data, how big a step the loss tolerates along each singular direction of Muon's momentum matrix. They found that the few strongest directions can only take a small step before the loss goes up, while the rest tolerate steps several times larger. Their reading is that this explains why Muon beats Adam and Adam beats SGD, since each one moves more of its step away from the strongest directions.

The fourth is the Shampoo connection. Shampoo has to store its statistics and compute inverse matrix roots in at least 32-bit precision. Muon keeps only the part of the preconditioner that comes from the current gradient, leaves the averaging to momentum, and runs stably in 16-bit arithmetic.

There's also evidence about what Muon-trained networks look like afterwards. Moonshot measured how evenly the singular values of trained weight matrices are spread, and in their [Muon-trained model](https://arxiv.org/abs/2502.16982) more than 90% of the matrices were more even than in the AdamW equivalent. A [2026 study](https://arxiv.org/abs/2606.09658) reports that features learned with Muon hold up better on corrupted inputs and transfer better to new tasks. Both suggest that Muon uses more of the directions each matrix has.

## Published results

These are the main published comparisons against AdamW, oldest first. FLOPs are floating-point operations, the usual measure of compute. MoE means mixture-of-experts, where only part of the network runs for each input.

| Result | Source | Date |
|---|---|---|
| NanoGPT speedrun: 1.35× faster to 3.28 validation loss | [Jordan](https://kellerjordan.github.io/posts/muon/) | Oct 2024 |
| CIFAR-10 to 94% accuracy: 3.3 → 2.6 A100 GPU-seconds | [Jordan](https://kellerjordan.github.io/posts/muon/) | 2024 |
| Equal loss with about 52% of AdamW's training FLOPs, 399M–1.5B parameters | [Moonshot AI](https://arxiv.org/abs/2502.16982) | Feb 2025 |
| Keeps its data efficiency at large batch sizes; lower loss than AdamW at 1B parameters | [Essential AI](https://arxiv.org/abs/2505.02222) | May 2025 |
| Kimi K2 (1T-parameter MoE): 15.5T tokens with no loss spikes, using the MuonClip variant | [Kimi Team](https://arxiv.org/abs/2507.20534) | Jul 2025 |
| SOAP and Muon both beat AdamW at multi-billion parameters and trillions of tokens | [Khona et al.](https://arxiv.org/abs/2607.20548) | Jul 2026 |

They all point the same way, from a few million parameters up to a trillion. Most of them come from the groups that built or adopted Muon, and all of them are about training from scratch.

## Limitations

Muon only covers hidden weight matrices, so you still need AdamW for embeddings, the output layer and 1-D parameters, with separately tuned learning rates.

Fine-tuning across optimizers goes badly. Moonshot [reported](https://arxiv.org/abs/2502.16982) that a model pretrained with AdamW fine-tunes poorly with Muon, and the other way round. [Qu et al.](https://arxiv.org/abs/2605.10468) put this down to the new optimizer disrupting what the model learned in pretraining. They found that restricting fine-tuning to low-rank adapters, the [LoRA](https://arxiv.org/abs/2106.09685) approach, narrows the gap.

The advantage may depend on how much data you pretrain on. A [preprint from this month](https://arxiv.org/abs/2611.03633) finds that with enough pretraining data, AdamW-pretrained models do better after fine-tuning than Muon-pretrained ones, and that the crossover comes sooner for larger models. It's one study and it's new, but it's a reason not to assume Muon is better everywhere.

Giving every singular direction the same step includes the directions that are mostly noise. The [HTMuon](https://arxiv.org/abs/2603.10067) authors argue that Muon overweights noise for that reason.

The theory is behind the practice. Convergence analyses exist, but the strongest rates I found are for [variance-reduced variants](https://arxiv.org/abs/2509.15816) of Muon and not for the algorithm people run, and none of them explains how large the gains are.

## Open problems

Setting every singular value to 1 is the simplest rule you could pick, and it probably isn't the best one. The Wu et al. measurement suggests an alternative, and the same paper proposes SAMuon, which keeps the strongest directions at Muon's scale and enlarges the rest. They report the same loss with 13–24% fewer tokens on models from 124M to 1B parameters. HTMuon goes the other way and keeps some of the gradient's original spread. The two disagree about which direction to move from flat, so I'd call the best profile an open question.

Several groups are putting per-weight adaptivity back in. Orthogonalizing evens out the singular values but can leave the rows of the update, one per output neuron, with very different sizes. [NorMuon](https://arxiv.org/abs/2510.05491) normalizes each row afterwards, and its authors report an 11% efficiency gain over Muon at 1.1B parameters. [AdaMuon](https://arxiv.org/abs/2507.11005) applies an Adam-style running average of squared entries to the orthogonalized update. [MuonEq](https://arxiv.org/abs/2603.28254) rescales rows and columns before orthogonalizing.

The spectral norm was derived for linear layers. [Modular duality](https://arxiv.org/abs/2410.21265) by Bernstein and Newhouse applies the same reasoning to other layer types and gets a different rule for each. Embeddings have each column normalized separately, and convolutions are orthogonalized at each kernel position. An optimizer that picked its rule by layer type wouldn't need AdamW alongside it.

Stability at very large scale needed extra work. Kimi K2 was trained with MuonClip, which its authors describe as Muon with an added "QK-clip technique to address training instability". Muon limits the size of each update but not the size of the weights.

Nearly every open model was pretrained with Adam, so until the fine-tuning mismatch is solved Muon mostly benefits people who pretrain from scratch.

Newton–Schulz needs a whole weight matrix on one device, and very large models are split across many. Jordan listed this as an open question in 2024. Moonshot [described](https://arxiv.org/abs/2502.16982) a distributed implementation in 2025, but I don't think the question is closed.

## Summary and recommended settings

Where I've ended up: the spectral-norm argument explains why Muon beats Adam on weight matrices. It doesn't explain why a flat profile of singular values should be the best one, and the 2026 papers suggest it isn't.

Here is everything in one table. Going down the rows, each generation evens out step sizes over more structure: nothing, then individual weights, then the singular directions of each weight matrix.

<div class="mu-scroll">

| Optimizer | New idea | What it evens out | Extra memory | Norm |
|---|---|---|---|---|
| SGD | Follow the gradient | Nothing | None | Euclidean |
| Momentum, Nesterov | Sum gradients over time | Nothing; it speeds up directions that persist | 1× | Euclidean |
| AdaGrad, RMSProp | Divide by typical gradient size | Step per weight | 1× | ℓ∞ |
| Adam, AdamW | Both of the above | Step per weight | 2× | ℓ∞ |
| Shampoo, SOAP | Precondition rows and columns | Step per matrix direction, using history | Two matrices per layer or more | Spectral, without accumulation |
| Muon | Orthogonalize the momentum | Step per singular direction | 1× | Spectral |

</div>

If you're training from scratch and want to try Muon, the reference settings are learning rate 0.02 and momentum 0.95 on the hidden weight matrices and AdamW on everything else. Then tune only the learning rate and weight decay. Moonshot's [variant](https://arxiv.org/abs/2502.16982) rescales the update to the size of an AdamW update, so you can reuse an AdamW learning rate you already trust.

## References

- Keller Jordan et al., [Muon: An optimizer for hidden layers in neural networks](https://kellerjordan.github.io/posts/muon/) and [reference code](https://github.com/KellerJordan/Muon)
- Jeremy Bernstein, [Deriving Muon](https://jeremybernste.in/writing/deriving-muon)
- Bernstein and Newhouse, [Old Optimizer, New Norm: An Anthology](https://arxiv.org/abs/2409.20325) and [Modular Duality in Deep Learning](https://arxiv.org/abs/2410.21265)
- Liu, Su et al. (Moonshot AI), [Muon is Scalable for LLM Training](https://arxiv.org/abs/2502.16982)
- Essential AI, [Practical Efficiency of Muon for Pretraining](https://arxiv.org/abs/2505.02222)
- Vyas et al., [SOAP: Improving and Stabilizing Shampoo using Adam](https://arxiv.org/abs/2409.11321)
- Gupta, Koren and Singer, [Shampoo: Preconditioned Stochastic Tensor Optimization](https://arxiv.org/abs/1802.09568)
- Kingma and Ba, [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980)
- Loshchilov and Hutter, [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101) (AdamW)
- Duchi, Hazan and Singer, [Adaptive Subgradient Methods for Online Learning and Stochastic Optimization](https://jmlr.org/papers/v12/duchi11a.html) (AdaGrad)
- Hinton, [Neural Networks for Machine Learning, lecture 6 slides](https://www.cs.toronto.edu/~tijmen/csc321/slides/lecture_slides_lec6.pdf) (RMSProp)
- Sutskever et al., [On the importance of initialization and momentum in deep learning](https://proceedings.mlr.press/v28/sutskever13.html)
- Polyak, [Some methods of speeding up the convergence of iteration methods](https://doi.org/10.1016/0041-5553%2864%2990137-5) (1964)
- Robbins and Monro, [A Stochastic Approximation Method](https://doi.org/10.1214/aoms/1177729586) (1951)
- Hu et al., [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- Jordan et al., [modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt) (the NanoGPT speedrun)
- Wu et al., [Spectral Allocation: Why Muon Outperforms Adam, and How to Improve Muon](https://arxiv.org/abs/2608.25990)
- Khona et al., [SOAP, Muon, and Beyond: Pushing LLM Pretraining Scales](https://arxiv.org/abs/2607.20548)
- Li et al., [Pretraining Data Scale Reverses the Muon-AdamW Fine-Tuning Gap](https://arxiv.org/abs/2611.03633)
- Ruan et al., [Muon Learns More Robust and Transferable Features than Adam](https://arxiv.org/abs/2606.09658)
- Qu, Huang and Horvath, [Can Muon Fine-tune Adam-Pretrained Models?](https://arxiv.org/abs/2605.10468)
- Chang et al., [On the Convergence of Muon and Beyond](https://arxiv.org/abs/2509.15816)
- Variants: [NorMuon](https://arxiv.org/abs/2510.05491) · [AdaMuon](https://arxiv.org/abs/2507.11005) · [MuonEq](https://arxiv.org/abs/2603.28254) · [HTMuon](https://arxiv.org/abs/2603.10067) · [Kimi K2 / MuonClip](https://arxiv.org/abs/2507.20534)


<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="document.querySelectorAll('.mu-eq').forEach(function(e){renderMathInElement(e,{delimiters:[{left:'\\[',right:'\\]',display:true}]})})"></script>
<script defer src="/muon/muon-core.js?v=4"></script>
<script defer src="/muon/muon.js?v=4"></script>
