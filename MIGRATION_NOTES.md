# Migration to Minimal Mistakes Theme

## What Changed

### ✅ Completed
1. **Theme**: Migrated from `jekyll-theme-minimal` to `minimal-mistakes-jekyll`
2. **Gemfile**: Updated with Minimal Mistakes dependencies including `jekyll-include-cache`
3. **_config.yml**: Completely reconfigured for Minimal Mistakes with:
   - Author profile with bio and social links
   - Navigation configuration
   - Category and tag archives using liquid (GitHub Pages compatible)
   - Proper defaults for posts and pages
4. **Navigation**: Created `_data/navigation.yml` with main menu
5. **Pages**: Created new `_pages/` directory with:
   - `blog.md` - Blog archive page
   - `categories.md` - Category archive page
   - `tags.md` - Tag archive page
   - `projects.md` - Projects collection page
   - `about.md` - About page in markdown
6. **Layouts**: Removed custom layouts (now using Minimal Mistakes built-in layouts)
7. **Plugins**: Removed custom plugins (GitHub Pages doesn't support them)
8. **Old directories**: Removed `blog/`, `categories/`, `tags/`, `about/`, `faceted/`

### 📋 What You Need to Do

1. **Push to GitHub**: Commit and push all changes
   ```bash
   git add .
   git commit -m "Migrate to Minimal Mistakes theme"
   git push origin main
   ```

2. **Wait for GitHub Pages**: It may take a few minutes for GitHub Pages to rebuild

3. **Optional Customizations**:
   - Change theme skin in `_config.yml` (line 2): `minimal_mistakes_skin: "default"`
     - Options: "air", "aqua", "contrast", "dark", "dirt", "neon", "mint", "plum", "sunrise"
   - Add your profile image to `/assets/images/` and update `author.avatar` path
   - Customize colors by adding custom CSS in `/assets/css/main.scss`

### 🎨 Theme Features Now Available

- ✅ Responsive design
- ✅ Author profile sidebar
- ✅ Social sharing buttons
- ✅ Related posts
- ✅ Table of contents (TOC) for long posts
- ✅ Read time estimates
- ✅ Category and tag archives
- ✅ Search functionality
- ✅ Comments support (configure if needed)
- ✅ Analytics support (configure if needed)

### 📝 Post Front Matter

Your existing posts will work, but you can enhance them with Minimal Mistakes features:

```yaml
---
layout: single  # Already set as default
title: "Your Post Title"
date: 2025-10-07
categories: [Category1, Category2]
tags: [tag1, tag2, tag3]
# Optional enhancements:
toc: true  # Table of contents (enabled by default)
toc_sticky: true  # Sticky TOC (enabled by default)
header:
  image: /assets/images/header.jpg  # Header image
  teaser: /assets/images/teaser.jpg  # Teaser for archive pages
excerpt: "Custom excerpt text"  # Override auto-generated excerpt
---
```

### 🔧 Troubleshooting

If something doesn't look right after deployment:
1. Check GitHub Pages build status in your repository settings
2. Ensure all paths in `_config.yml` are correct
3. Make sure `remote_theme: mmistakes/minimal-mistakes` is set correctly
4. Clear browser cache to see latest changes

### 📚 Resources

- [Minimal Mistakes Documentation](https://mmistakes.github.io/minimal-mistakes/docs/quick-start-guide/)
- [Minimal Mistakes Configuration](https://mmistakes.github.io/minimal-mistakes/docs/configuration/)
- [Minimal Mistakes Layouts](https://mmistakes.github.io/minimal-mistakes/docs/layouts/)

## Backup Files

If you need to revert or reference old files:
- `_layouts.backup/` - Original custom layouts
- `_includes.backup/` - Original custom includes
