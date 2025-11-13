---
layout: post
title: "Day 162: When Bayesian Hyperparameter Search Melted My Wallet"
date: 2025-10-23
categories: [Machine Learning, Optimization, MLOps]
tags: [hyperparameter-tuning, bayesian-optimization, ray-tune, cost-control, experimentation]
---

**October 23, 2025 – Today's Vibe: Budget Alerts Are the New Alarm Clock**

I scheduled a Bayesian hyperparameter sweep for our churn model using Ray Tune and AWS Spot instances. I expected twelve trials. I woke up to 480 instances chewing through $2,100 because I forgot to set `max_concurrent_trials`. Finance sent a screenshot of our cloud bill before they said "good morning."

## The Hardship: Tuning Gone Wild

The pipeline auto-scales based on pending trials. My config set an ambitious search space (learning rate, tree depth, monotonic constraints) and enabled early termination. Sounds fine—until the scheduler decided to launch 40 parallel workers *per region*. Each worker spun up a full GPU-enabled container even though we ran gradient-boosted trees on CPUs.

## The Investigation: Defaults Are Not Your Friend

Here's the offending snippet:

```python
analysis = tune.run(
    train_model,
    scheduler=ASHAScheduler(metric="roc_auc", mode="max"),
    num_samples=300,
    resources_per_trial={"cpu": 4, "gpu": 1},  # copy-paste fail
)
```

- `num_samples=300` + 4 concurrent regions meant 1,200 possible trials.
- `resources_per_trial` demanded GPUs we didn't need, so spot capacity was scarce and Ray eagerly hoarded everything it could find.
- I forgot to cap concurrency with `max_concurrent_trials`, so Ray fired off as many workers as the cluster would allow.

## The Lesson: Set Guardrails Before Searching

I refactored the tuning orchestration to treat resources like a budget, not infinite candy:

1. **Concurrency caps.** Added `Tuner(..., tune_config=tune.TuneConfig(max_concurrent_trials=12))` so we never exceed a dozen workers globally.
2. **Right-size resources.** Dropped the phantom GPU request and switched to reserved CPU pools. We also pinned the cluster scaling policy to a sane maximum.
3. **Cost-aware early stopping.** Trials now log estimated spend per improvement. If the marginal ROC AUC gain falls below 0.001 for $20 of compute, we stop the experiment.

We also wired cloud cost alerts into Slack with job metadata so we know exactly which experiment misbehaves. The next tuning run finished under $120, and finance only pinged me to send memes, not invoices.
