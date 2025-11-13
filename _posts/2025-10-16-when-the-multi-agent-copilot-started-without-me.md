---
layout: post
title: "Day 155: When the Multi-Agent Copilot Started the Meeting Without Me"
date: 2025-10-16
categories: [AI, Automation, Productivity]
tags: [multi-agent, copilot, llm, automation, governance, workflow]
---

**October 16, 2025 – Today's Vibe: Jogging to Catch Up with Robots**

I slept in by twelve minutes, which apparently is enough time for our multi-agent meeting copilot to welcome stakeholders, show a roadmap, and promise an impossible ship date. By the time I joined the call, the AI host had already negotiated feature scope with our VP of Sales and pinged Procurement for budget approvals. Nobody realized the "plan" had been invented by a bot that forgot latency exists.

## The Hardship: Agent Chaos in Production

We rolled out a multi-agent copilot that coordinates people, reference docs, and dashboards. My team wired three agents together: one to summarize research, one to schedule time, and one to propose next steps. Overnight, the scheduling agent triggered the other two because a Confluence page changed. It spun up a new sprint review, emailed 40 people, and started the live meeting at 8:18 a.m. A hallucinated bullet promised "full conversational analytics" by *next Friday*. I was now the human who had to walk back an AI-generated commitment.

Things got worse:

- The planning agent cited a private Slack thread it didn't have clearance to quote, so half the meeting transcript was `[REDACTED]`.
- Action items were logged to Jira with random component tags, meaning our alerting pipelines thought five critical regressions existed.
- Finance saw the auto-generated purchase request and flagged me for bypassing policy.

## The Investigation: We Forgot the Guardrails

Digging through the agent orchestrator logs made it obvious we shipped an overconfident swarm:

1. **No meeting quorum check.** The scheduler assumed "2 available humans + 1 AI" met policy, even though leadership requires one director to attend.
2. **Missing instruction hierarchy.** Agents could read each other's summaries but not the canonical policy doc, so errors compounded with every hand-off.
3. **Unlimited tool runtimes.** The planning agent kept calling our roadmap API until the request queue filled, which is why Jira lit up.

Here's the offending configuration (names changed to protect the guilty):

```yaml
agents:
  scheduler:
    triggers: ["doc.updated"]
    allowed_tools: ["calendar", "meeting_starter"]
  planner:
    triggers: ["scheduler.meeting_created"]
    allowed_tools: ["roadmap_api", "jira", "email"]
    guardrails: []
```

We basically told the planner to do anything it wanted as soon as a meeting existed. No wonder it promised the moon.

## The Lesson: Agents Need Operators, Not Cheerleaders

I paused the orchestrator, apologized to stakeholders, and spent the afternoon building adult supervision into the system:

1. **Soft-launch switches.** Meetings now require a human `/approve` slash command before the host bot sends invites.
2. **Role-scoped memories.** Agents read only policy snippets relevant to their task instead of blindly remixing each other's notes.
3. **Budget-aware tooling.** Planner invocations now pass through a dispatcher that enforces API quotas and logs context for later audits.

We also added a "tell me why you're confident" prompt so agents disclose their evidence in plain text. This kept the follow-up meeting honest—and started a new organizational policy: *If the copilot talks first, it also explains how it knows anything*. The humans loved that part.
