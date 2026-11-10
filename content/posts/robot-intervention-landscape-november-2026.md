+++
title = "The State of Robot Intervention (Nov 2026)"
date = 2026-11-10
draft = false
tags = ["robotics", "physical-ai", "teleoperation", "robot-intervention", "VLA"]
description = "Funding, hiring and competitive strategy across robot operations, teleoperation and training data. November 2026."
summary = "Where the money is going, what teams are hiring to build, and which companies could own the operating relationship."
ShowToc = false
wideLayout = true
+++

*November 2026 · Companies, funding and hiring*

Robot models still fail often enough that deployments need humans on standby. When a robot gets stuck or encounters something it cannot handle, someone has to step in so the work can continue. Teleoperation makes that possible without putting a person beside every machine.

That makes human intervention a critical part of deploying robots. A company can put its robots to work before they can handle every situation autonomously, with people covering the gaps. Those interventions can also produce training examples that help the models improve.

An industry is forming around that need: software to connect to robots and manage incidents, services that supply remote operators, and tools that turn human corrections into training data. Some robot makers build the whole operation themselves; others buy pieces from specialist suppliers.

This report maps those companies—what they sell, how much funding they have disclosed, what they are hiring to build, and where they could have an edge over competitors.

## How the market fits together

The first four categories cover the components a robot team can buy separately. The fifth bundles them into a robot service. Companies can span several categories.

| Part of the operation | What the customer buys | Examples |
| --- | --- | --- |
| **Connectivity and controls** | Video, commands and dependable remote access | Ottopia, DriveU.auto, FORT |
| **Fleet operations** | A place to supervise robots and handle incidents | Formant, InOrbit |
| **Staffed recovery** | People who operate robots and resolve failures | Aktoria, Remotics, Extend Robotics |
| **Developer platforms and data** | Tools for control and recording, or data for training | Viam, LiveKit Portal, PrismaX, LeRobot |
| **Integrated robot operations** | A robot service with human assistance included | Contoro, Avatar, Coco, Telexistence |

The analysis follows this order. First, here is what current hiring suggests about the companies’ next moves. The [company explorer](#company-explorer) at the end contains the wider directory, financing disclosures and source-linked profiles.

## What hiring says about direction

The roles below show where companies are investing in people. **Direction is an inference from those openings**, not a claim that the capability is already delivered. Skill links open the underlying job postings; the sections that follow explain the competitive implications.

| Company · current business | Skills being hired | What that suggests |
| --- | --- | --- |
| **Ottopia** · Remote driving | [Network performance, video streaming](https://www.ottopia.tech/careers) | **More dependable commercial teleoperation** |
| **FORT** · Safety and controls | [Functional safety](https://job-boards.greenhouse.io/fortrobotics/jobs/4736658005) · [Embedded software](https://job-boards.greenhouse.io/fortrobotics/jobs/4744297005) · [Validation](https://job-boards.greenhouse.io/fortrobotics/jobs/4749921005) | **Safety and reliability at the machine level** |
| **Formant** · Fleet software | [Enterprise sales](https://ats.rippling.com/formant-careers/jobs/758ad102-662d-4b2e-be24-cc35b0c3c460) | **A repeatable sales approach to labs and robot makers** |
| **InOrbit** · Fleet software | [Customer deployment, enterprise integration](https://www.inorbit.ai/apply-forward-deployed-engineer) | **Deeper integration into warehouse and factory operations** |
| **Aktoria** · Operator services | [Robot-learning research](https://www.ycombinator.com/companies/aktoria-robotics/jobs/WlROHB1-robot-learning-researcher-vla-foundation-models) · [First-person data collection](https://www.ycombinator.com/companies/aktoria-robotics/jobs/eES62Ab-egocentric-operations-lead) | **Connect data collection to model improvement** |
| **Viam** · Device platform | [Data and ML pipelines](https://job-boards.greenhouse.io/viamrobotics/jobs/6008423004) · [Fleet management](https://job-boards.greenhouse.io/viamrobotics/jobs/5821871004) · [Deployment engineering](https://job-boards.greenhouse.io/viamrobotics/jobs/6146938004) | **One platform for operating robots and improving their models** |
| **Contoro** · Trailer unloading | [Motion planning](https://jobs.ashbyhq.com/contoro/ad34a874-deb3-4bc0-959b-87650ac1a219) · [Field service](https://jobs.ashbyhq.com/contoro/ade19192-d35a-4416-a7c6-cbd664174518) · [Manufacturing](https://jobs.ashbyhq.com/contoro/55843bb3-c052-4941-9091-53a559c2d3eb) | **Repeatable installations and support at more customer sites** |
| **Coco** · Sidewalk delivery | [Service operations](https://jobs.ashbyhq.com/cocodelivery/6f701c03-581a-4796-b78e-dd62700d03d0) · [Robot maintenance](https://jobs.ashbyhq.com/cocodelivery/af56d6ad-f4ef-42ae-ba4e-f2908505286a) | **Expand the local operating capacity behind delivery fleets** |
| **Telexistence** · Retail robots | [Foundation-model research](https://jobs.lever.co/tx-inc.com/819724df-476a-43c5-9643-70fb8d8f1b6e) · [Humanoid engineering](https://jobs.lever.co/tx-inc.com/ab280654-8bca-4335-9744-aa2ef4e66d66) · [Data production](https://jobs.lever.co/tx-inc.com/78b1d6ae-9d4d-4a6e-aee6-9a8a0e5990af) | **Expand from retail robots into broader models and humanoids** |

*Selected listings checked November 10, 2026. The explorer includes additional companies and roles.*

## 1. Connecting to the robot

Remote intervention starts with seeing the machine's surroundings and getting commands back to it. Video delay, unreliable networks and control failures make this more demanding than an ordinary video call. Connectivity suppliers compete on how well they handle those conditions.

**Ottopia supplies remote-driving technology.** After selling its defense business in September 2026, it is concentrating on commercial markets. Its technical hiring emphasizes network congestion, combining network connections and adapting video to available bandwidth. Those roles suggest continued investment in the communication problems at the core of its product. [Transaction](https://www.ottopia.tech/blog-posts/defense-transaction) · [Careers](https://www.ottopia.tech/careers)

**FORT approaches remote control through safety and embedded systems.** Its current openings include functional safety, embedded software and testing. In October 2026 it announced approximately $20 million in new financing commitments, part of which depends on a proposed merger closing. The hiring fits a business whose potential advantage is making control dependable at the machine level. [Careers](https://www.fortrobotics.com/careers) · [Financing commitments](https://www.fortrobotics.com/news/fort-robotics-secures-approximately-20-million-in-additional-funding-led-by-tiger-global-and-mark-cuban-companies)

Their competitive pressure comes partly from general-purpose infrastructure. **LiveKit Portal gives developers a shared session for robot media, control and recording.** LiveKit raised a $100 million Series C in January 2026, although that finances the whole company. [Portal documentation](https://docs.livekit.io/robotics/integrations/portal/concepts/) · [Financing](https://livekit.com/blog/livekit-series-c)

My expectation is that reusable infrastructure will make basic video and command transport easier to assemble. Ottopia and FORT have a stronger case where difficult networks, safety requirements or hardware integration justify specialist engineering. But a dependable connection still leaves the customer with another problem: organizing the work that happens over it.

## 2. Managing the incident

A fleet needs to identify which robot needs help, show an operator enough context and make the appropriate recovery action available. Fleet software provides that operating workflow. Its value grows when it also connects the robot's problem to the customer's business systems.

**Formant sells the software used to observe and operate fleets.** Its current Physical AI sales opening asks the hire to develop a repeatable approach to AI labs, robot manufacturers and integrators. Its verified financing record here is a $21 million round announced in October 2023. Together, the product and hiring suggest an effort to turn an existing fleet platform into a repeatable sale across a wider set of robotics customers. [Company](https://www.formant.ai/about) · [Sales role](https://ats.rippling.com/formant-careers/jobs/758ad102-662d-4b2e-be24-cc35b0c3c460) · [Funding](https://www.prnewswire.com/news-releases/formants-explosive-enterprise-growth-attracts-new-investment-led-by-bmw-i-ventures-joined-by-intel-capital-and-gs-futures-301952771.html)

**InOrbit sells robot operations software with a strong integration component.** Its deployment-engineering role calls out warehouse management, manufacturing and enterprise planning systems. It also asks engineers to turn repeated manual interventions into tooling. The company announced a Series A in September 2025 without disclosing the amount. [Deployment role](https://www.inorbit.ai/apply-forward-deployed-engineer) · [Series A](https://www.inorbit.ai/press/series-a-investment)

These companies compete for the place where the customer runs the fleet. InOrbit's hiring points toward embedding that software in facility operations; Formant's visible sales role points toward finding a repeatable route into labs, manufacturers and integrators. Integrations and established procedures could make either platform difficult to replace. They also create a delivery cost if every new customer requires substantial custom work.

With the connection and console in place, the fleet still needs someone to handle the incident. Staffing is the next purchasing decision.

## 3. Supplying the operator

An operator service takes responsibility for staffing, training and coverage. Its economics depend on the work being done: occasional recoveries require a different operation from continuous remote piloting.

**Aktoria offers human operations for robots and is recruiting beyond that service.** Alongside a research role in vision-language-action models—models that connect visual observations and instructions to robot actions—it lists a role organizing first-person video collection. The latter covers collection partners, equipment and upload quality. Aktoria is YC-backed; this review did not verify a financing amount. [Company](https://aktoria.com/) · [Research role](https://www.ycombinator.com/companies/aktoria-robotics/jobs/WlROHB1-robot-learning-researcher-vla-foundation-models) · [Collection role](https://www.ycombinator.com/companies/aktoria-robotics/jobs/eES62Ab-egocentric-operations-lead) · [YC](https://www.ycombinator.com/companies/aktoria-robotics)

That pairing suggests a route beyond selling operator hours: organize collection, then evaluate which data improves a robot's behavior. The possible edge is a feedback loop between collection and learning. The research hiring shows an intention to build that loop; its value would have to show up in customers' model results.

**Extend Robotics is expanding from immersive robot controls into selling completed industrial work.** Its September 2026 £2.6 million Pre-A announcement describes outcome-priced services and an operator network. Customers would buy a result while Extend organizes more of the technology and human work behind it. [Company announcement](https://www.extendrobotics.com/post/extend-robotics-raises-2-6-million-to-let-manufacturers-hire-robots-by-the-outcome-not-buy-them-by)

These are two different directions for an operator business. Aktoria's hiring points toward data and learning. Extend's financing announcement points toward responsibility for production. The first needs evidence that recordings improve models; the second needs task revenue to cover equipment, operator time and recovery costs. Each brings the supplier into competition with a different group of companies.

## 4. Turning operations into training data

Aktoria's data ambitions lead to a separate market: customers buying examples of work rather than the work itself. Recordings become more useful when they preserve what the robot saw, what the operator commanded and what the machine actually did. Collection, organization and evaluation then become products in their own right.

**PrismaX sells robot data through subscriptions and enterprise collection.** It announced $11 million led by a16z CSX in June 2025. Where Aktoria's hiring suggests a move from operations toward learning, PrismaX markets the dataset as the purchase itself. Its potential advantage depends on supplying useful tasks and consistent quality that customers would find expensive to collect themselves. [Financing](https://prismax.ai/blog/prismax-raises-11m-a16z-robotics-funding) · [Current offer](https://prismax.ai/)

**Viam approaches the same workflow from device software.** Its platform spans robot control, diagnostics and data capture. A current data-platform opening describes a pipeline from recorded episodes through labeling, datasets and training to inference on devices. Separate roles cover fleet management and deployment engineering. Its March 2025 $30 million Series C took company-reported funding to $117 million at that announcement. [Platform](https://www.viam.com/platform/overview) · [Data role](https://job-boards.greenhouse.io/viamrobotics/jobs/6008423004) · [Fleet role](https://job-boards.greenhouse.io/viamrobotics/jobs/5821871004) · [Deployment team](https://job-boards.greenhouse.io/viamrobotics/jobs/6146938004) · [Financing](https://www.viam.com/press-releases/viam-announces-30-million-series-c)

Viam's hiring connects two markets discussed above. Managing the fleet puts it alongside Formant and InOrbit; managing the recordings and learning pipeline brings it into the data workflow. Its possible advantage is reducing the integration between operating a robot and improving it. Its challenge is delivering that breadth without becoming a custom engineering project for each customer.

PrismaX and Viam also illustrate two distinct purchases: a customer can buy data, or buy tools to manage its own data. Both face another source of competition—the robot manufacturers that already own the machine, deployment and recordings.

## 5. Selling the complete robot service

An integrated supplier brings the robot and its human fallback into one commercial offer. The customer has fewer pieces to assemble, while the supplier takes responsibility for more of the costs. This is where Extend's move toward completed work meets companies built around that model from the outset.

**Avatar Robotics sells an industrial workforce built around robots and operators.** Its August 2026 $6.5 million seed supports that approach. Avatar and Extend are therefore useful comparisons: both ask customers to buy productive capacity, with the supplier organizing the work behind it. Their advantage would come from making that capacity easy to buy and dependable to use. [Avatar financing](https://www.prnewswire.com/news-releases/avatar-robotics-raises-6-5-million-seed-to-build-the-unlimited-industrial-workforce-302843349.html)

**Contoro focuses that model on trailer unloading.** Its March 2025 $12 million Series A brought reported cumulative funding to $22 million. Current openings combine motion planning with field service and manufacturing, suggesting an emphasis on making deployments repeatable at customer sites. [Financing](https://www.globenewswire.com/news-release/2025/03/25/3049120/0/en/Contoro-Robotics-Secures-12M-Series-A-to-Bring-AI-Powered-Trailer-Unloading-to-Scale.html) · [Current roles](https://jobs.ashbyhq.com/contoro)

Compared with broader industrial-workforce offerings, Contoro's narrow task could make robot design, operator training and recovery procedures easier to standardize. Field-service hiring also identifies the cost of that promise: machines need installation and support. The competitive test is whether each additional deployment becomes cheaper to deliver.

**Coco applies an integrated model to sidewalk delivery.** Its current openings include service leadership and city technicians. Those roles point toward the local operating capacity needed to expand a delivery network. Coco announced $80 million in financing in June 2025; a subsequent spokesperson clarification said the figure covered multiple funding events. [Current roles](https://jobs.ashbyhq.com/cocodelivery) · [Announcement](https://www.prnewswire.com/news-releases/coco-robotics-raises-80m-to-expand-autonomous-delivery-and-ai-platform-302478405.html) · [Clarification](https://techcrunch.com/2025/06/11/sam-altman-backed-coco-robotics-raises-80m/)

Coco competes with other delivery fleets, including Starship and Serve. Its potential edge involves delivery relationships, route coverage and maintenance as well as autonomy. As with Contoro, expanding deployments creates a support burden; hiring reveals investment in that capacity, but does not establish who has the lowest operating cost.

**Telexistence connects integrated operations back to the data opportunity.** It builds retail robots with remote assistance and is now recruiting leaders for models intended to handle a broad range of robot tasks, as well as humanoid systems. The model role spans teleoperation data through deployment. The company raised a $170 million Series B in 2023, and its announced Seven-Eleven humanoid program targets 2029. [Retail system](https://tx-inc.com/en/blog/2021/11/02/11451/) · [Model role](https://jobs.lever.co/tx-inc.com/819724df-476a-43c5-9643-70fb8d8f1b6e) · [Humanoid role](https://jobs.lever.co/tx-inc.com/ab280654-8bca-4335-9744-aa2ef4e66d66) · [Series B](https://tx-inc.com/en/blog/2023/07/06/12082/) · [Roadmap](https://tx-inc.com/en/blog/2025/09/30/12542/)

That gives Telexistence a different starting point from Aktoria or PrismaX: it can change the robot, collection process and deployed model together. The unresolved question is how much its retail experience helps it learn broader tasks. The hiring and humanoid roadmap show the ambition; they do not yet establish that transfer.

## Where the competitive boundaries are moving

The clearest pattern is expansion into adjacent work. Extend is taking on more responsibility for production. Aktoria is recruiting to connect collection with model research. Viam is building across fleet operations and learning. Telexistence is using an integrated robot business as the starting point for a broader model and hardware program.

Those moves put companies with different origins into direct competition. A robot team might buy operators from Aktoria and data from PrismaX, manage its own collection through Viam, or buy a complete service from an integrated supplier. A supplier's potential edge rests on making its part of that decision easier, cheaper or more reliable than the alternatives.

The evidence to watch follows from those choices: less integration effort for fleet platforms, measurable learning gains for data suppliers, and less support work per deployment for robot services. That is what would turn the expansion visible in funding and hiring into a durable business advantage.

## Company explorer

Use **Landscape** to browse the wider market, **Capital** to compare dated financing disclosures, and **Hiring** to inspect selected current openings. Select a company for its product, sources, direction and competitive assessment. The explorer includes smaller suppliers and acquired businesses that are not discussed individually above; their profiles mark gaps and ownership status.

<link rel="stylesheet" href="/robot-intervention/landscape.css?v=9">
<div id="intervention-landscape"><p class="ri-loading">Loading the company research…</p></div>
<noscript><p><a href="/robot-intervention/companies.json">Download the company research</a>.</p></noscript>
<script src="/robot-intervention/landscape.js?v=9" defer></script>

---

**Sources and scope.** Public sources checked November 10, 2026. Financing records retain their announcement date, currency and structure; they are not current cash balances or a complete history of capital raised. Job listings are a selected snapshot. Missing funding or hiring records mean unverified in this review. The explorer separates source evidence from interpretations of direction and competitive position.

[Download the sourced company records](/robot-intervention/companies.json).
