---
layout: page
title: projects
permalink: /projects/
description: Selected experiments, demos, and working artifacts across analytics, frontend exploration, and developer tooling.
nav: true
nav_order: 2
horizontal: true
---

<div class="projects">
  <p class="mb-4">
    I keep this collection intentionally small. Each entry represents a concrete build, experiment, or working artifact rather than a placeholder idea.
  </p>

  {% assign sorted_projects = site.projects | sort: "importance" %}
  <div class="container">
    <div class="row row-cols-1">
      {% for project in sorted_projects %}
        {% include projects_horizontal.liquid %}
      {% endfor %}
    </div>
  </div>
</div>
