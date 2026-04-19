# Code With Behnam

Source for [codewithbehnam.github.io](https://codewithbehnam.github.io/).

The site is built with Jekyll on top of the [`al-folio`](https://github.com/alshedivat/al-folio) theme and adapted into a simpler professional portfolio/blog for Behnam Ebrahimi.

## Focus

- healthcare BI
- analytics engineering
- Power BI, DAX, and SQL
- dashboards and decision support
- practical AI and automation

## Structure

- `_pages/about.md`: homepage and profile copy
- `_pages/blog.md`: writing archive
- `_pages/projects.md`: selected project index
- `_posts/`: long-form writing
- `_projects/`: project entries rendered by the theme
- `_data/socials.yml`: public social links
- `_config.yml`: site metadata and theme settings
- `_sass/_custom.scss`: local UI overrides on top of al-folio

## Local Development

Install dependencies:

```bash
bundle install
```

Run the site:

```bash
bundle exec jekyll serve
```

Open `http://localhost:4000`.

Production build:

```bash
bundle exec jekyll build
```

## Deployment

The repository deploys through GitHub Actions using `.github/workflows/deploy.yml`.

The workflow builds the site, purges unused CSS, and publishes `_site/` to GitHub Pages.

## Content Notes

- Keep post front matter clean and consistent.
- Prefer concise summaries and real examples over filler copy.
- Project entries should represent actual builds or working artifacts.
- When site positioning changes, update `_config.yml`, `_pages/about.md`, this README, and the repo metadata together.

## License

MIT. See [LICENSE](LICENSE).
