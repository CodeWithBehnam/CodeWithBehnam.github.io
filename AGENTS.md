# AGENTS.md

Guidance for agents and contributors working in this repository.

## Purpose

This repository powers `https://codewithbehnam.github.io/`, a personal Jekyll site focused on:

- healthcare BI
- analytics engineering
- Power BI and SQL
- dashboards and data products
- practical AI

The site should feel professional, restrained, and easy to scan. Avoid over-designed marketing patterns and unnecessary UI chrome.

## Stack

- Jekyll
- GitHub Pages
- Minimal Mistakes theme with custom layouts and CSS

Important files:

- `_config.yml`: site metadata and Jekyll config
- `index.html`: homepage content
- `_layouts/home.html`: homepage layout wrapper
- `_includes/home/hero.html`: homepage hero
- `assets/css/main.css`: main custom styling
- `_pages/`: top-level pages
- `_posts/`: blog posts
- `_data/navigation.yml`: primary nav

## Development Rules

### Homepage

The homepage should have a single rendering path.

- `index.html` is the source of truth for homepage sections
- `_layouts/home.html` should render the hero and then `{{ content }}`
- do not reintroduce duplicate homepage systems through extra include chains unless there is a clear reason

### UI Direction

Prefer:

- calm editorial layout
- clean typography
- consistent spacing
- simple panels and restrained accents
- obvious hierarchy

Avoid:

- noisy gradients
- gimmicky hero treatments
- dashboard-card overload
- decorative labels that do not help orientation
- duplicated sections with similar content

### Content

Posts should include clean front matter:

```yaml
---
layout: post
title: "Post title"
date: YYYY-MM-DD
categories: [Category]
tags: [tag-one, tag-two]
---
```

Keep titles readable and professional. Tags and categories should help navigation, not create clutter.

### Metadata

When site positioning changes, keep these aligned:

- `_config.yml`
- `README.md`
- About page
- GitHub repo description, homepage URL, and topics

## Local Development

Typical workflow:

```bash
bundle install
bundle exec jekyll serve
```

Production-style build:

```bash
bundle exec jekyll build
```

If Ruby or Bundler is missing in the local environment, note that clearly instead of pretending the site was validated.

## Cleanup Expectations

Remove dead files when they are clearly unused, especially:

- old one-off migration notes
- duplicate homepage includes
- empty draft or test content
- scripts that are not referenced anywhere

Do not remove working site content without checking references first.

## Git

- keep commits focused
- prefer one clear commit per logical change
- avoid unrelated formatting churn
- push to `main` only when the requested work is complete
