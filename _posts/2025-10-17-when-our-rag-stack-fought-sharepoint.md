---
layout: post
title: "Day 156: When Our RAG Stack Fought SharePoint Permissions"
date: 2025-10-17
categories: [AI, Knowledge Management, Retrieval]
tags: [rag, llm, sharepoint, vector-search, enterprise-ai, access-control]
---

**October 17, 2025 – Today's Vibe: Playing Bouncer for a LLM**

Today's mission: connect our retrieval-augmented generation (RAG) stack to a decade of SharePoint sites so the sales team can interrogate policies in plain English. Today's reality: 403 errors, phantom documents, and a hallucinated discount clause that doesn't exist anywhere in legal history. Turns out, letting an LLM read SharePoint without replicating permissions is like unlocking the office but forgetting which badge belongs to whom.

## The Hardship: Governance Whack-a-Mole

We ingest SharePoint docs into Azure Cognitive Search, embed them with a frontier model, and feed the top-k chunks to our chat endpoint. The pilot went smoothly in staging, but production had two explosive twists:

1. **Permission mismatches.** Our crawler used an app token with tenant-wide read rights, so embeddings included confidential docs even when the user asking the question only belonged to a single team site.
2. **Stale link rot.** SharePoint webhooks lagged, so deleted docs stayed in the vector store for hours. Users saw citations to pages IT had already archived.

When Sales asked, "What discounts can we legally offer for procurement co-ops?" the bot quoted a contract from a private M&A workspace. Legal nearly combusted.

## The Investigation: This Is Why Zero-Trust Exists

The logs made the issue obvious: we were enriching our vector store faster than we could enforce ACL filters. Every query looked roughly equivalent to this pseudo-call:

```python
search_results = vector_store.similarity_search(
    query_embedding,
    k=8,
    filter=None  # 😬
)
```

We assumed down-stream policy checks protected us, but the LLM never saw them. Once a sensitive chunk entered context, the model happily summarized it. We also discovered our crawler ignored SharePoint's `discoverable` flag, so "hidden" docs were still indexed.

## The Lesson: RAG Without Policy Is Just RAGe

I rewired the pipeline during an emergency coffee IV:

- **Per-user filters at retrieval time.** We now pass the caller's Azure AD object ID through to the vector store, which enforces row-level security before the LLM ever sees text.
- **Dual indexes.** Embeddings live in two stores: one for public content, one for restricted. The orchestrator chooses the right index based on access scopes.
- **Deletion-first webhooks.** The crawler listens for delete events and immediately tombstones affected embeddings. Insert events wait until the ACL snapshot finishes.

Most importantly, we added a pre-response validator. It checks citations, replays them through Microsoft Graph, and redacts anything the user can't open. Here's the simplified hook:

```python
def redact_unreadable_citations(citations, user_token):
    safe = []
    for cite in citations:
        if graph.can_user_read(cite["site_id"], cite["drive_id"], cite["item_id"], token=user_token):
            safe.append(cite)
    return safe
```

Now the bot declines gracefully instead of inventing discounts from the legal twilight zone. Bonus: Legal finally agreed to join the office happy hour again.
