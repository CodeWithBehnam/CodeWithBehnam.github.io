# Contributing to CodeWithBehnam Blog

Thank you for your interest in contributing! This document provides guidelines for contributing to this blog.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists
2. Create a new issue with a clear title and description
3. Include steps to reproduce (for bugs)
4. Add relevant labels

### Suggesting Content

Have an idea for a blog post or tutorial?

1. Open an issue with the `content-suggestion` label
2. Describe the topic and target audience
3. Explain why it would be valuable

### Submitting Changes

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Test locally with Jekyll
5. Commit your changes (`git commit -m 'Add: brief description'`)
6. Push to your branch (`git push origin feature/your-feature-name`)
7. Open a Pull Request

## Blog Post Guidelines

### Writing Style

- Use clear, concise language
- Include code examples where appropriate
- Add proper headings and structure
- Use markdown formatting consistently

### Post Format

```markdown
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD
categories: [Category1, Category2]
tags: [tag1, tag2, tag3]
---

Brief introduction paragraph.

## Section 1

Content here...

## Conclusion

Summary and key takeaways.
```

### File Naming

Posts should follow this naming convention:
```
YYYY-MM-DD-post-title.md
```

### Content Requirements

- Original content or properly attributed
- Code examples tested and working
- Images optimized for web
- Links checked and valid
- Proper grammar and spelling

## Code Guidelines

### HTML/CSS

- Use semantic HTML5 elements
- Follow consistent indentation (2 spaces)
- Add comments for complex sections
- Ensure responsive design

### JavaScript

- Use ES6+ features
- Add JSDoc comments for functions
- Keep functions small and focused
- Handle errors appropriately

### Jekyll/Liquid

- Test templates with sample data
- Use includes for reusable components
- Follow Jekyll best practices
- Document custom plugins

## Testing

Before submitting:

1. Test locally with `bundle exec jekyll serve`
2. Check responsive design on multiple devices
3. Validate HTML and CSS
4. Test all links
5. Check browser console for errors

## Commit Messages

Use clear, descriptive commit messages:

- `Add: new blog post about [topic]`
- `Fix: broken link in [post]`
- `Update: styling for [component]`
- `Remove: deprecated [feature]`
- `Refactor: [component] for better performance`

## Pull Request Process

1. Update README.md if needed
2. Ensure all tests pass
3. Request review from maintainer
4. Address review comments
5. Squash commits if requested

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks
- Spam or promotional content
- Publishing others' private information

## Questions?

Feel free to open an issue for any questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to CodeWithBehnam! 🚀
