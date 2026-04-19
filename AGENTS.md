# AGENTS.md

Guidance for contributors and agents working in this repository.

## Purpose

This repository powers `https://codewithbehnam.github.io/`, a personal site for Behnam Ebrahimi focused on healthcare BI, analytics engineering, Power BI, SQL, dashboards, and applied AI.

The site uses the `al-folio` Jekyll theme, but it should not read like an academic template or a stock demo.

## Stack

- Jekyll
- `al-folio`
- GitHub Pages via GitHub Actions

Key files:

- `_config.yml`: site metadata, theme options, navigation behavior
- `_pages/about.md`: homepage/profile content
- `_pages/blog.md`: writing archive
- `_pages/projects.md`: project listing
- `_projects/`: project pages and card data
- `_data/socials.yml`: social links
- `_sass/_custom.scss`: local UI overrides
- `.github/workflows/deploy.yml`: deployment pipeline

## UI Direction

Prefer:

- restrained editorial layout
- strong typography and spacing
- minimal chrome
- clean hierarchy
- short, direct copy

Avoid:

- academic filler sections
- demo/sample content
- decorative gradients and noisy motion
- dashboard-card overload
- duplicated pages that say the same thing

## Content Rules

- Keep the homepage as the main profile/positioning page.
- Keep the project list intentionally small and concrete.
- Use posts for substantial writing, not placeholder notes.
- If a theme feature is unused, disable it in `_config.yml` instead of building around it.

## Development

Typical local workflow:

```bash
bundle install
bundle exec jekyll serve
```

Production build:

```bash
bundle exec jekyll build
```

If Ruby or Bundler is unavailable, state that clearly instead of claiming the build was verified.

## Maintenance

- Keep repo metadata aligned with the live site.
- Remove obsolete content and sample files when they stop serving the site.
- Preserve working theme runtime files unless you are sure they are dead.
- Keep commits focused and push only when the requested work is complete.
