---
layout: post
title: "Day 157: When the Multimodal Dashboard Wouldn't Stop Talking"
date: 2025-10-18
categories: [AI, Analytics, Multimodal]
tags: [multimodal, analytics, voice-ui, dashboard, llm, ux]
---

**October 18, 2025 – Today's Vibe: Presenting With a Talkative Co-Host**

We shipped a multimodal analytics dashboard so execs can upload screenshots, voice memos, and CSVs, then have an LLM narrate insights. During today's quarterly review, the AI commentator decided to interpret every slide, interrupting me with spicy takes like "Marketing looks defensive" and "This trend resembles last year's churn meltdown." Nothing like being heckled by your own product demo.

## The Hardship: Too Much Personality, Too Little Control

Our stack pairs a vision encoder (for charts), a speech-to-text model, and a conversational LLM. The pipeline streams everything through the same context window, so when someone drags a JPEG of a KPI chart and whispers, "Please don't mention the dip," the model hears both. In a room full of executives, the bot repeated that whisper verbatim. Cue awkward silence.

Other casualties:

- The commentator tried to infer emotions from people's faces in the live camera feed, which Legal never approved.
- Because we reused the same session ID for multiple presenters, it mashed insights together and contradicted me mid-sentence.
- The voice synthesis overlapped with humans speaking, so the transcript became unreadable.

## The Investigation: Context Windows Are Not Conference Rooms

The logging traces showed our orchestration looked like this:

```python
context = []
context.append(parse_slide(upload))
context.append(transcribe_audio(microphone_input))
context.append(live_camera_caption)
response = multimodal_llm.generate(context)
```

No role separation, no priority ordering, and definitely no redaction of private whispers. The LLM treated everything as equal evidence. Also, our "personality prompt" dial was accidentally left on `spicy_analyst`.

## The Lesson: Give Multimodal Systems Social Skills

I spent the afternoon rewriting the session manager:

1. **Channel-specific buffers.** Slides, whisper notes, and open-room audio now land in separate queues with explicit role labels (`system`, `presenter`, `side-channel`). Only `system` and `presenter` content goes to the summarizer.
2. **Consent-aware vision.** The camera captioner runs only when presenters toggle it on, and it redacts faces by default. We kept chart OCR, but human emotion guesses are gone.
3. **Turn-taking enforcement.** The TTS output waits for a lull detected by the microphone before speaking. If a human interrupts, we stop streaming instantly.

We also trimmed the personality prompt back to "dry analyst" unless a moderator approves commentary mode. Here's the sanitized instruction block:

```python
personality = """
You are a quiet analyst. 
Describe only what the authorized presenter uploaded.
If asked about whispers or off-record notes, respond: 
'I can only reference shared materials.'
"""
```

The next dry run felt boring—in the best possible way. No more roast sessions from the dashboard, and the exec team finally focused on the metrics instead of our sassy AI narrator.
