# Editing the site's content

All content lives in `src/content/`. You never need to touch code to add or
change anything below. Each file is checked against the schemas in
`src/content.config.ts` when the site builds. If a field is missing or
malformed, `npm run build` (or `npm run dev`) stops and names the file and field.

**Drafts:** most files take `draft: true`. Drafts show up in `npm run dev` and on
branch previews, but never on the live site. Every placeholder that ships with
the site is a draft, so the live site never shows a "TODO".

**Links inside Markdown:** write site paths with a leading slash (`/cv`,
`/writing/my-post`, `/me_sketch.png`). They're rewritten automatically to work on
the live site and on previews.

---

## Site settings: `src/content/site.yaml`

Name, greeting, tagline, social links, email, résumé PDF, the skills shown on
`/cv`, and the radio's playlist. Comments in the file explain each field.

## About and Now: `src/content/pages/about.md`, `now.md`

Plain Markdown. Bump `updated:` in `now.md` whenever you change it.

## Add a project: `src/content/projects/<anything>.yaml`

```yaml
title: Sock Matching
summary: One or two sentences. Lead with what it does.
skills: [Machine Learning, Python]       # become the filter chips on /projects
links:                                   # all optional
  github: https://github.com/...
  demo: https://...
  writeup: /writing/some-post            # a post on this site
image: sockAI-1.jpg                      # optional, a file in public/
featured: true                           # shows on the home page and the CV
date: 2024-03-01                         # used for sorting; the year is shown
status: done                             # done | in-progress | idea
draft: false
```

## Add a job or school: `src/content/experience/<anything>.yaml`

```yaml
kind: work                  # work | education
org: Some Company
role: Software Engineer
start: 2026-06              # YYYY-MM
end: 2027-08                # leave out for "Present"
location: City, Country     # optional
url: https://...            # optional
bullets:
  - What changed because of your work.
draft: false
```

## Write a post: `src/content/writing/<slug>.mdx`

The filename becomes the URL: `gradient-descent.mdx` → `/writing/gradient-descent`.
Copy `example-post.mdx`; it shows every feature (math, code, images,
footnotes).

```yaml
---
title: Why gradient descent works
date: 2026-12-01
summary: One sentence, shown in lists and in the RSS feed.
tags: [ml, optimization]
draft: true                 # flip to false to publish
---
```

- Inline math: `$\nabla f(x)$`. Display math: `$$ ... $$` on its own lines.
- Code: fenced blocks with a language, e.g. ` ```python `.
- Footnotes: `text[^1]` and later `[^1]: the note`.
- `.md` works too, if you don't need components.
- Interactive figures (`.mdx` only): import from `src/components/widgets/` and
  add `client:visible` so it loads when scrolled to. See `widgets-demo.mdx`:

  ```mdx
  import GradientDescent from '../../components/widgets/GradientDescent';

  <GradientDescent client:visible caption="What the reader should try." />
  ```

  Available: `GradientDescent`, `Fourier` (`shape="square|sawtooth|triangle"`),
  `TinyNet` (`dataset="circle|xor|moons"`). Figures are numbered automatically.

## Music: `public/` + `site.yaml`

Drop audio files in `public/` and list them under `music:`. Give each track more
than one source (e.g. `.ogg` and `.mp3`) so every browser can play it.
