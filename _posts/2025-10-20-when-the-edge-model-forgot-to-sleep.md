---
layout: post
title: "Day 159: When the Edge Model Forgot to Sleep"
date: 2025-10-20
categories: [AI, Edge Computing, IoT]
tags: [on-device, quantization, tensor, energy, iot, scheduling]
---

**October 20, 2025 – Today's Vibe: Babysitting Tiny GPUs with Espresso**

We launched an on-device anomaly detector for warehouse robots. It's a quantized transformer that watches vibration data and screams if bearings fail. Overnight, 400 robots drained their batteries because the model refused to enter low-power mode. Facilities called me at 5 a.m. asking why the fleet looked like it partied all night.

## The Hardship: Battery Drain on Steroids

The edge model runs on a Jetson Orin Nano with a strict duty cycle: sample for 5 seconds, infer once, sleep for 55. Two things broke:

1. **Telemetry backlog.** We deployed a new firmware build that started buffering IMU readings in RAM. When connectivity hiccuped, the inference loop processed *all* buffered frames instead of just the latest.
2. **GPU residency.** TensorRT kept the GPU hot even when there was nothing to process, thanks to a stray `context.execute_async_v3()` call without a matching `context.synchronize()` and `stream.free()`.

Robots burned 30% more power per shift, and maintenance wanted answers yesterday.

## The Investigation: Profiling at the Edge

I built a quick tracing script to prove the loop was running continuously:

```python
import time

def profile_loop():
    last_run = time.time()
    while True:
        run_inference()
        now = time.time()
        print(f"Δt={now - last_run:.2f}s")
        last_run = now
        enter_sleep()
```

The deltas never exceeded 7 seconds. Clearly, our sleep logic defaulted to "barely nap."

We also reviewed the deployment config and found the duty-cycle thresholds hard-coded in two different files—one in firmware, one in the container image. They disagreed by 40 seconds.

## The Lesson: Power Budgets Need Contracts

Fixing things required boring discipline:

- **Single source of truth.** Duty-cycle parameters now live in a signed config bundle that both firmware and container read at startup. If they disagree, the process refuses to boot.
- **Backpressure-aware sampling.** The sensor loop drops intermediate frames when the queue exceeds 3 batches, ensuring we never replay ancient data.
- **Explicit GPU teardown.** After each inference we now call `context.set_optimization_profile_async`, `stream.synchronize()`, and `stream.free()`. Usage dropped from 11 W to 4 W per idle minute.

We also hooked the robots into a Prometheus gateway so ops can alert when duty cycle deviates. The next morning, the fleet actually slept—and so did I.
