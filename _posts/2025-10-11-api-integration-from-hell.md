---
layout: post
title: "Day 150: API Integration From Hell (Or: How I Spent 6 Hours Debugging a Typo)"
date: 2025-10-11
categories: [Data Engineering, APIs, Python]
tags: [api, python, requests, debugging, data-pipeline, etl]
---

**October 11, 2025 – Today's Vibe: Questioning My Career Choices**

Let me tell you about the most humbling Friday of my life. I spent *six hours* debugging an API integration, convinced there was some deep, mysterious issue with authentication, rate limiting, or server-side configuration. Turns out, I'd misspelled a dictionary key. One letter. Six hours. I'm not okay.

## The Hardship: The API That Refused to Cooperate

My task was simple: pull daily sales data from our third-party e-commerce API and load it into our data warehouse for analysis. I'd integrated APIs dozens of times before. This should've been a 90-minute job, tops.

I wrote my Python script, hit run, and immediately got a `KeyError: 'api_key'` exception. Weird, but okay. I triple-checked my environment variables, regenerated my API key, re-read the documentation. Everything looked right. I tried again. Same error.

```python
import requests
import os

API_KEY = os.getenv('ECOMMERCE_API_KEY')
BASE_URL = 'https://api.ecommerce-platform.com/v2'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Attempt to fetch sales data
response = requests.get(
    f'{BASE_URL}/sales',
    headers=headers,
    params={'date': '2025-10-11'}
)

print(response.json())
```

But I kept getting authentication errors. I added verbose logging, checked the raw HTTP request headers, even used Postman to test the endpoint directly (which *worked*). I was losing my mind. Was there some invisible character in my API key? Was my Python environment haunted?

## The Investigation: Down to 2 AM

By 8 PM, I'd rewritten the script three times, switched from `requests` to `httpx`, and even tried making the call from a completely different machine. Nothing. I was getting responses like:

```json
{
  "error": "Invalid API credentials",
  "code": 401
}
```

I started doubting the documentation. Maybe the endpoint had changed? I scoured the API changelog. Nope. I reached out to their support. They said, "Your API key is valid; the issue is on your end." Gee, thanks.

At 2 AM, delirious and caffeine-poisoned, I did what I should've done at 5 PM: I printed out *every single variable* and *every single dictionary key* in my script to see exactly what was being sent.

```python
print(f"API_KEY: {API_KEY}")
print(f"Headers: {headers}")
print(f"Params: {params}")
```

And there it was, in the params dictionary:

```python
params = {'date': '2025-10-11', 'api-key': API_KEY}  # WRONG
# Documentation said it should be:
params = {'date': '2025-10-11', 'apikey': API_KEY}   # RIGHT
```

I had used `api-key` (with a hyphen) instead of `apikey` (no hyphen). The API silently ignored my key because it didn't recognize the parameter name, defaulting to unauthenticated requests. Six hours. One hyphen.

I closed my laptop and went to bed, questioning every decision that led me to this career.

## The Lesson: Debugging Basics Are Not Optional

Here's what I should've done *immediately*:

**1. Print Everything, Everywhere, All At Once**

When debugging APIs, don't assume anything. Print the raw request and response:

```python
import requests

response = requests.get(url, headers=headers, params=params)

# Log the actual request that was sent
print(f"Request URL: {response.request.url}")
print(f"Request Headers: {response.request.headers}")
print(f"Request Body: {response.request.body}")

# Log the response
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
```

This would've shown me that my `api-key` parameter wasn't being recognized.

**2. Use a REST Client to Isolate the Problem**

I should've immediately tested the exact same request in Postman or curl, then compared it line-by-line with my Python script. I did this eventually, but only after wasting hours.

```bash
# Test in curl first to establish a working baseline
curl -X GET "https://api.ecommerce-platform.com/v2/sales?date=2025-10-11&apikey=YOUR_KEY" \
  -H "Authorization: Bearer YOUR_KEY"
```

**3. Read the Docs Like Your Job Depends On It (Because It Does)**

I *thought* I'd read the documentation carefully, but I'd clearly skimmed past the parameter naming convention. Lesson learned: read twice, code once.

## Mistakes I Vow Not to Repeat

1. **Assuming I know the API structure without re-checking**. Even APIs I've used before can change.
2. **Debugging for hours without taking a break**. After 2 hours of no progress, I should've stepped away and come back with fresh eyes.
3. **Not using a debugger or logging library**. I was relying on print statements scattered randomly. Should've used `logging` from the start:

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug(f"API_KEY: {API_KEY}")
logger.debug(f"Request params: {params}")
```

4. **Not creating automated tests for API integrations**. If I'd had a unit test that checked parameter names, I'd have caught this instantly.

## Your Automation Toolkit: API Integration Survival Kit

Here's my new template for *any* API integration, which I'm now religiously following:

**1. API Request Wrapper with Logging**

```python
import requests
import logging
from typing import Dict, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def api_request(
    method: str,
    url: str,
    headers: Optional[Dict] = None,
    params: Optional[Dict] = None,
    data: Optional[Dict] = None
) -> requests.Response:
    """
    Wrapper for API requests with built-in logging and error handling.
    """
    logger.info(f"Making {method} request to {url}")
    logger.debug(f"Headers: {headers}")
    logger.debug(f"Params: {params}")
    logger.debug(f"Data: {data}")
    
    response = requests.request(
        method=method,
        url=url,
        headers=headers,
        params=params,
        json=data
    )
    
    logger.info(f"Response status: {response.status_code}")
    logger.debug(f"Response body: {response.text}")
    
    response.raise_for_status()  # Raise exception for bad status codes
    return response

# Usage
try:
    response = api_request(
        'GET',
        f'{BASE_URL}/sales',
        headers=headers,
        params={'date': '2025-10-11', 'apikey': API_KEY}  # Note: correct param name!
    )
    data = response.json()
except requests.exceptions.HTTPError as e:
    logger.error(f"API request failed: {e}")
```

**2. Pre-Flight Validation Script**

Before integrating any new API, I now run this checklist:

```python
# api_validation.py
import requests
import os

API_KEY = os.getenv('ECOMMERCE_API_KEY')
BASE_URL = 'https://api.ecommerce-platform.com/v2'

# Test 1: Is the API reachable?
try:
    response = requests.get(BASE_URL, timeout=5)
    print(f"✓ API is reachable (Status: {response.status_code})")
except requests.exceptions.RequestException as e:
    print(f"✗ API unreachable: {e}")

# Test 2: Is the API key valid?
headers = {'Authorization': f'Bearer {API_KEY}'}
response = requests.get(f'{BASE_URL}/auth/validate', headers=headers)
if response.status_code == 200:
    print("✓ API key is valid")
else:
    print(f"✗ API key invalid: {response.status_code}")

# Test 3: Can I fetch a small sample?
response = requests.get(
    f'{BASE_URL}/sales',
    headers=headers,
    params={'date': '2025-10-11', 'apikey': API_KEY, 'limit': 1}
)
if response.status_code == 200:
    print(f"✓ Data fetch successful: {response.json()}")
else:
    print(f"✗ Data fetch failed: {response.status_code} - {response.text}")
```

**3. Automated API Tests**

I now write pytest tests for any API integration:

```python
import pytest
import requests

def test_api_authentication():
    """Verify API key is accepted"""
    response = requests.get(
        'https://api.ecommerce-platform.com/v2/auth/validate',
        headers={'Authorization': f'Bearer {API_KEY}'}
    )
    assert response.status_code == 200

def test_sales_endpoint_params():
    """Verify required parameters are correct"""
    # This test would've caught my typo!
    params = {'date': '2025-10-11', 'apikey': API_KEY}
    response = requests.get(
        'https://api.ecommerce-platform.com/v2/sales',
        headers={'Authorization': f'Bearer {API_KEY}'},
        params=params
    )
    assert response.status_code == 200
    assert 'sales' in response.json()
```

**4. Use a .env File and python-dotenv**

Never hardcode API keys. Use environment variables:

```bash
# .env file
ECOMMERCE_API_KEY=your_actual_key_here
```

```python
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv('ECOMMERCE_API_KEY')
```

## The Takeaway

Today I learned that the simplest bugs are often the hardest to catch, especially when you're convinced the problem is complex. I wasted six hours because I didn't follow basic debugging practices: log everything, isolate variables, and test incrementally. 

Oh, and read the documentation. Like, actually *read* it. Every word. Twice.

**What's the longest you've debugged something embarrassingly simple? Drop it in the comments!** I need to know I'm not alone in this special kind of hell.

---

*Monday's entry: "Spark Job Meltdown: When 'Big Data' Became 'Too Big For My Cluster'." Stay tuned.*
