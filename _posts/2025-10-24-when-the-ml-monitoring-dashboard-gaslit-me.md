---
layout: post
title: "Day 163: When the ML Monitoring Dashboard Gaslit Me"
date: 2025-10-24
categories: [Machine Learning, Monitoring, Operations]
tags: [mlops, monitoring, drift, dashboards, alerting, data-quality]
---

**October 24, 2025 – Today's Vibe: Trust But Verify (Especially Dashboards)**

Our ML observability stack reported "all clear" while customers complained the recommendation engine was pushing winter jackets to Miami. The dashboard said drift < 0.05. Reality said otherwise. Turned out our monitoring pipeline silently fell back to training stats whenever the daily batch job was late. So yes, everything looked identical—because we compared data to itself.

## The Hardship: Drift Alarms Muted by Defaults

We rely on a nightly job that computes production feature histograms and uploads them to an S3 bucket. The monitoring service compares them to training baselines. When the batch job missed its window (thanks, upstream outage), the service loaded the last *successful* upload and labeled it "today." No one noticed the timestamp mismatch because the UI used the report's logical date, not the file's actual modified time.

## The Investigation: Missing Freshness Checks

Digging into the job revealed this gem:

```python
latest = sorted(glob.glob("/data/histograms/*.json"))[-1]
with open(latest) as fp:
    payload = json.load(fp)
upload(payload)  # no notion of date inside payload
```

If the pipeline fails, the same histogram keeps uploading. The monitoring service trusts whatever arrives most recently. No freshness metadata meant we couldn't tell stale data from new.

## The Lesson: Observability Needs Observability

I patched both sides of the pipeline:

1. **Signed timestamps.** Each histogram file now includes `collected_at` and `source_snapshot` fields. The monitoring service rejects payloads older than 26 hours.
2. **Data availability alerts.** Added a lightweight cron that checks for fresh files and pages me if nothing new arrives by 2 a.m.
3. **UI honesty.** The dashboard now displays both the intended logical date and the actual ingest timestamp so on-call engineers can spot lag instantly.

Quick snippet from the validator:

```python
if (now - payload["collected_at"]) > timedelta(hours=26):
    raise ValueError("Histogram too old; refusing to compute drift")
```

Once the fix shipped, the drift alerts spiked exactly as they should have. We paused the rec engine, retrained with the latest browse data, and customers went back to seeing sunscreen instead of snow boots.
