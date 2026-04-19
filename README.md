# Code With Behnam

Source for my GitHub Pages website and blog: https://codewithbehnam.github.io/

This site is where I publish writing on healthcare BI, analytics engineering, Power BI, SQL, data products, dashboards, and applied AI. It combines long-form posts, lightweight project pages, and profile content into a single Jekyll site.

## What This Repo Contains

- personal website content
- blog posts under [`_posts/`](_posts)
- standalone pages under [`_pages/`](_pages)
- project data under [`_data/projects.yml`](_data/projects.yml)
- Jekyll configuration in [`_config.yml`](_config.yml)
- custom styling and scripts in [`assets/`](assets)

## Stack

- Jekyll
- GitHub Pages
- Minimal Mistakes theme
- custom CSS and JavaScript

## Main Sections

- `Home`: landing page and featured content
- `Writing`: full post archive
- `Projects`: selected work and experiments
- `Categories`: broad topic map
- `Tags`: narrower topic navigation
- `About`: personal profile and links

## Local Development

### 1. Install dependencies

```bash
bundle install
```

### 2. Run the site locally

```bash
bundle exec jekyll serve
```

Then open:

```text
http://localhost:4000
```

### 3. Production-style build

```bash
bundle exec jekyll build
```

The generated site will be written to `_site/`.

## Content Workflow

### Add a new post

Create a Markdown file in `_posts/` using the standard Jekyll naming format:

```text
YYYY-MM-DD-post-title.md
```

Include front matter such as:

```yaml
---
layout: post
title: "Your Post Title"
date: 2026-04-19
categories: [Analytics, Power BI]
tags: [powerbi, sql, dashboard]
---
```

### Update page content

- site pages live in `_pages/`
- navigation is controlled in `_data/navigation.yml`
- global metadata lives in `_config.yml`

## Repo Metadata

This repository is intended to present well both as a codebase and as the source behind the live site, so the README, About page, repo description, homepage URL, and topics should stay aligned.

Recommended public links:

- Website: https://codewithbehnam.github.io/
- GitHub profile: https://github.com/CodeWithBehnam
- LinkedIn: https://linkedin.com/in/behnam-ebrahimi-7b417473

## Notes

- this repo is content-first, not app-first
- GitHub Pages build compatibility matters
- clean metadata matters because the repo doubles as a public profile asset

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
