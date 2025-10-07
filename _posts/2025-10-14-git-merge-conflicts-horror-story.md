---
layout: post
title: "Day 153: Git Merge Conflicts (Or: When My Team and I Edited the Same Notebook Simultaneously)"
date: 2025-10-14
categories: [Version Control, Collaboration, Data Science]
tags: [git, version-control, jupyter, collaboration, workflow, best-practices]
---

**October 14, 2025 – Today's Vibe: Why Did We Think This Would Work?**

Have you ever tried to merge two Jupyter notebooks that three different people edited at the same time? If your answer is "no," congratulations on your excellent life choices. If your answer is "yes," then pour yourself a drink, because you understand the fresh hell I experienced today.

## The Hardship: The Notebook That Became a Battlefield

Our data science team had a shared Jupyter notebook for customer churn analysis. It lived in our team's Git repo, and we all worked on it during a sprint. Sounds fine, right? We're professionals. We know how to use Git.

Except we didn't coordinate who was editing what, and we all committed our changes independently. Then, when it came time to merge everyone's work into the main branch, Git threw up its hands and gave us 47 merge conflicts. In *JSON*. Because that's what Jupyter notebooks are: giant, deeply nested JSON files filled with cell IDs, metadata, and output blobs.

I opened the notebook in VS Code to resolve the conflicts and was greeted with this nightmare:

```json
<<<<<<< HEAD
{"cell_type": "code", "execution_count": 12, "metadata": {}, "outputs": [{"data": {"text/plain": ["..."]}}], "source": ["df.groupby('region').sum()"]}
=======
{"cell_type": "code", "execution_count": 8, "metadata": {}, "outputs": [{"data": {"text/html": ["..."]}}], "source": ["df.groupby('customer_type').mean()"]}
>>>>>>> feature-branch
```

Multiply that by 47 conflicts, and you can imagine my despair. I spent three hours manually stitching the notebook back together, and even then, I wasn't sure if I'd accidentally deleted someone's work. By the end, I was questioning why we even use version control for notebooks.

## The Investigation: Why Notebooks and Git Don't Play Nice

The core problem: **Jupyter notebooks are not designed for version control**. They're JSON files that include:
- Cell execution counts (which change every time you run a cell)
- Output data (charts, tables, images embedded as base64)
- Metadata (kernel info, timestamps, widget state)

When two people edit the same notebook, Git sees changes in *all of these fields*, not just the code. So even if Alice edited cell 3 and Bob edited cell 10, Git might still flag conflicts because their execution counts or kernel metadata differ.

It's a disaster waiting to happen.

## The Lesson: Treat Notebooks Like Drafts, Not Production Code

After untangling this mess, I had a long conversation with my team about how we should *actually* be using notebooks in a collaborative environment. Here's what we learned:

**1. Don't Commit Notebook Outputs to Git**

Outputs bloat the repo and cause unnecessary conflicts. Strip them before committing:

```bash
# Install nbstripout to automatically remove outputs
pip install nbstripout

# Set it up for your repo (run once)
nbstripout --install

# Now Git will auto-strip outputs on commit
git add analysis.ipynb
git commit -m "Update churn analysis"
```

This prevents conflicts caused by differing output data and keeps your repo lean.

**2. Use nbdime for Notebook Diffs and Merges**

`nbdime` is a Git extension specifically for Jupyter notebooks. It understands notebook structure and shows diffs at the cell level, not the raw JSON level.

```bash
# Install nbdime
pip install nbdime

# Configure it for your repo
nbdime config-git --enable --global

# Now Git will use nbdime for notebook diffs
git diff analysis.ipynb  # Shows cell-level changes, not JSON
```

For merging conflicts:

```bash
# Use nbdime's merge tool
nbdime mergetool analysis.ipynb
```

It opens a visual UI where you can see conflicting cells side-by-side and choose which version to keep. Game-changer.

**3. Use Branch Protection and Divide Notebooks by Feature**

We now assign each analyst a specific section of the analysis, and we use separate notebooks or modules where possible:

```
notebooks/
  01_data_loading.ipynb       (Alice owns this)
  02_feature_engineering.ipynb (Bob owns this)
  03_modeling.ipynb           (Carol owns this)
```

Instead of everyone editing one giant notebook, we modularize. Then we combine results in a final reporting notebook.

**4. Convert Critical Code to Python Modules**

For code we knew would be reused (like data cleaning functions), we moved it out of the notebook and into `.py` files:

```python
# data_utils.py
import pandas as pd

def clean_customer_data(df):
    """Remove duplicates and handle missing values."""
    df = df.drop_duplicates(subset=['customer_id'])
    df['age'].fillna(df['age'].median(), inplace=True)
    return df
```

Then in the notebook:

```python
from data_utils import clean_customer_data

df = pd.read_csv('customers.csv')
df = clean_customer_data(df)
```

This way, if two people need to edit the cleaning logic, they edit `data_utils.py` (which Git handles much better), not a JSON blob.

**5. Use Jupyter Lab's RTC (Real-Time Collaboration)**

For simultaneous work, we now use JupyterLab's real-time collaboration feature, which works like Google Docs:

```bash
# Install JupyterLab 3.1+
pip install jupyterlab

# Launch with RTC enabled
jupyter lab --collaborative
```

Multiple people can edit the same notebook at once, and changes sync live. No more merge conflicts for collaborative sessions.

## Mistakes I Vow Not to Repeat

1. **Letting everyone edit the same notebook without coordination**. We should've used a shared doc or Slack channel to call dibs on sections.
2. **Not using nbstripout from day one**. Outputs in Git are pure noise.
3. **Not exploring notebook alternatives for production code**. Notebooks are great for exploration, but for reproducible analysis, we should've used Python scripts + Make/Snakemake from the start.
4. **Not testing nbdime earlier**. I wasted hours manually resolving JSON conflicts when a tool existed to do it for me.

## Your Automation Toolkit: Collaborative Notebook Workflow

Here's our team's new workflow for avoiding notebook merge hell:

**1. Repo Setup Script**

Every new analyst runs this when joining the team:

```bash
#!/bin/bash
# setup_notebook_workflow.sh

echo "Setting up Jupyter + Git workflow..."

# Install required tools
pip install nbstripout nbdime jupyterlab

# Enable nbstripout (removes outputs on commit)
nbstripout --install

# Enable nbdime for better diffs/merges
nbdime config-git --enable

echo "Done! You're ready to collaborate safely."
```

**2. Pre-Commit Hooks**

We use `pre-commit` to enforce clean notebooks:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/kynan/nbstripout
    rev: 0.6.1
    hooks:
      - id: nbstripout

  - repo: https://github.com/nbQA-dev/nbQA
    rev: 1.7.0
    hooks:
      - id: nbqa-black  # Format code in notebooks
      - id: nbqa-flake8  # Lint code in notebooks
```

Install hooks:

```bash
pip install pre-commit
pre-commit install
```

Now every commit is automatically cleaned and formatted.

**3. Notebook Review Checklist**

Before merging any notebook PR, we check:
- [ ] Outputs are stripped
- [ ] No hardcoded paths or API keys
- [ ] Code cells are ordered logically
- [ ] Markdown cells explain the analysis
- [ ] Reusable code is moved to `.py` modules

**4. Alternative: Use Jupytext**

For maximum Git-friendliness, we started using `jupytext` to save notebooks as paired `.py` files:

```bash
# Install jupytext
pip install jupytext

# Pair a notebook with a .py file
jupytext --set-formats ipynb,py:percent analysis.ipynb
```

Now every time you save the `.ipynb`, Jupytext auto-generates a clean `.py` version:

```python
# %% [markdown]
# # Customer Churn Analysis

# %%
import pandas as pd
df = pd.read_csv('customers.csv')

# %%
df.groupby('region').mean()
```

The `.py` version is much easier for Git to diff and merge. You can edit either file, and Jupytext keeps them in sync.

**5. Communication Protocol**

We now use a Slack channel to coordinate notebook edits:

> Alice: "I'm editing cells 1-5 in churn_analysis.ipynb for the next hour"
> Bob: "Cool, I'll work on cells 10-15"

Low-tech, but effective.

## The Takeaway

Jupyter notebooks are amazing for exploratory analysis, but they're terrible for collaborative version control unless you set up the right guardrails. Today's three-hour merge conflict marathon taught me that the tools exist to make this painless (nbstripout, nbdime, Jupytext), but you have to be proactive about implementing them.

The real lesson? Git was designed for plain text code, not nested JSON with embedded images. If you're working with notebooks on a team, you need to adapt your workflow accordingly, or you'll spend more time resolving conflicts than doing actual analysis.

**What's your notebook collaboration horror story? Drop it in the comments!** I need to know if anyone's had it worse than me.

---

*Tomorrow's finale: "The Day I Almost Leaked PII (And How I Caught It Just in Time)." Ethical data handling is not optional.*
