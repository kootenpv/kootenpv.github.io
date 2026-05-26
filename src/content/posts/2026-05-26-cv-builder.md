---
title: "An interactive CV builder"
subtitle: "Tag, filter, flavor, export — at /cv"
date: 2026-05-26
tags: ["cv", "resume", "astro", "tools"]
---

I've put up an interactive CV at [/cv](/cv). The idea: keep everything I've done in one place without it turning into a wall, and let whoever's looking pull out only the parts that are relevant to them.

![Screenshot of the CV builder at /cv — sidebar with flavor presets and tag filters on the left, profile and experience cards on the right.](/img/cv/cv-builder.png)

## What it does

The page loads my career data from a single JSON file (jobs, skills, talks, competitions, open source, …) and lets you shape it on the fly:

- **Flavors** — five presets (Quant / HFT, ML Consultant, ML + Developer, Engineer + Data Scientist, Data Engineer & NLP) that pre-select a tag set and rewrite the headline role.
- **Tags** — every job and skill is tagged, with a counter showing how many entries each tag pulls in. Click to include, click again to drop.
- **Manual include/exclude** — click any job card to override the tag filter.
- **Search** — free-text filter across titles, companies, bullets, tech, tags.
- **Export PDF** — print-to-PDF with the sidebar hidden, so the result is a clean one-page (or three-page) CV.

One source of truth, no separate CV files to keep in sync — the role-specific cut happens in the browser.

## Want to use it yourself?

The whole thing is in the repo at <https://github.com/kootenpv/kootenpv.github.io>. The `resume/` directory is the self-contained version — a single `index.html` plus `data.json`. Drop it on any static host, swap in your own data, and you've got an interactive CV builder for yourself.

If you do, drop me a line — I'd like to see what other shapes this takes.
