---
layout: post
title: "Day 164: When Logistic Regression Saved the Quarter"
date: 2025-10-25
categories: [Machine Learning, Analytics, Strategy]
tags: [logistic-regression, interpretable-ml, stakeholders, feature-engineering, business-impact]
---

**October 25, 2025 – Today's Vibe: Old School Beats the Hype Train**

After two weeks of wrangling deep models, we discovered the answer to our churn crisis was... logistic regression. No transformers, no agents, no fancy embeddings. Just a humble linear model with clean features explaining why high-value customers paused subscriptions. Finance now thinks I'm a wizard; really, I just deleted features until the coefficients made sense.

## The Hardship: Stakeholders Didn't Trust the Black Box

We tried to pitch an XGBoost model to the retention team. They nodded politely, then refused to act because SHAP plots still looked like hieroglyphics. "Give us something we can explain to the board," they said. Meanwhile, monthly churn crept upward. Our complicated model underperformed on fresh cohorts and took hours to retrain.

## The Investigation: Simpler Models, Cleaner Insights

I rebuilt the pipeline starting from feature fundamentals:

1. Pulled the same customer cohort but engineered features the business actually tracks (invoice aging, last support ticket severity, product usage slope).
2. Standardized everything and fit a logistic regression with L1 penalty to encourage sparsity.
3. Compared coefficients to domain expectations. Suddenly the story clicked: invoice age > 45 days and zero product automation usage predicted churn with 74% lift.

Code snippet for posterity:

```python
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ("scale", StandardScaler()),
    ("clf", LogisticRegression(penalty="l1", solver="saga", max_iter=1000))
])
pipeline.fit(X_train, y_train)
```

## The Lesson: Interpretability Wins Meetings

We shipped the logistic regression model to production with a simple decision table:

- If `invoice_age > 45` and `usage_sessions_14d < 3` → trigger concierge outreach.
- If `has_support_ticket` AND `csat < 3` → escalate to success manager.
- Otherwise, enroll customer in the new automation onboarding drip.

Because coefficients map directly to features, Finance could model expected savings, Customer Success could build playbooks, and Legal approved the targeting logic in one meeting. Conversion improved within a week, proving (yet again) that the best model is the one people trust enough to use.
