---
layout: page
title: "Projects"
permalink: /projects/
author_profile: false
eyebrow: Workbench
subtitle: "Side projects and experimental tooling that augment the essays."
---

<section class="projects-archive" data-component="projects-archive">
  <div class="stack stack--gap-xl">
    <p class="lead">Each project explores a practical facet of analytics engineering, data visualisation, or developer tooling. Expect opinionated implementations, exhaustive documentation, and production-minded trade-offs.</p>

    <div class="project-grid">
      {% for project in site.data.projects %}
        {% include components/project-card.html project=project %}
      {% endfor %}
    </div>
  </div>
</section>
