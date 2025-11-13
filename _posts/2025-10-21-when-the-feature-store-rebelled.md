---
layout: post
title: "Day 160: When the Feature Store Rebelled During Our Rebuild"
date: 2025-10-21
categories: [Machine Learning, Data Engineering, MLOps]
tags: [feature-store, mlops, data-quality, batch, streaming, governance]
---

**October 21, 2025 – Today's Vibe: Negotiating With a Metadata Service**

We upgraded our feature store to support both streaming and batch sources. Somewhere in the migration, all of our TTL policies evaporated and models started training on stale freshness data. The churn model used 3-day-old marketing impressions, our fraud model double-counted transactions, and Airflow looked like a Christmas tree of retries.

## The Hardship: Stale Features Everywhere

The new store promised unified definitions, but two problems surfaced instantly:

1. **Dual ingestion paths.** Batch jobs pushed to the offline store in UTC, while the streaming pipeline tagged records with device-local timestamps. When we materialized features, the join key `event_time` was inconsistent, so the store happily served mismatched windows.
2. **Metadata drift.** We forgot to migrate the freshness SLA metadata, so consumers saw `max_age = null` and assumed features were evergreen. Nobody noticed until model metrics cratered.

## The Investigation: Metadata Matters More Than Code

We diffed the old and new registries and found 47 feature views missing TTLs. Worse, the CLI import silently skipped unknown fields. Here's the culprit:

```python
FeatureView(
    name="web_impressions",
    entities=["user_id"],
    ttl=None,  # 😱 defaulted to never expire
    batch_source=batch_source,
    stream_source=stream_source,
)
```

The config generator didn't populate `ttl` because the schema changed from `timedelta` to `Duration`. Our template templated nothing.

## The Lesson: Treat Feature Definitions Like APIs

We rolled back, then reapplied the migration with adult supervision:

- **Schema validation.** Added a pre-flight script that compares feature definitions across versions and fails if TTLs or freshness policies drop.
- **Temporal alignment.** Both batch and streaming sources now convert event timestamps to UTC and include a `source_lag` field so we can monitor ingestion delay.
- **Consumer contracts.** Every feature view now emits metadata via OpenFeature hooks, so model pipelines can assert `max_age` before training or serving.

Example of the new validation check:

```python
def enforce_ttl(feature_view):
    if feature_view.ttl is None:
        raise ValueError(f"{feature_view.name} missing TTL")

for fv in registry.feature_views:
    enforce_ttl(fv)
```

It felt tedious, but the payoff was immediate: drift monitors calmed down, and the fraud model stopped hallucinating risk scores from expired impressions.
