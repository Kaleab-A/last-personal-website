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

Name, greeting, tagline, social links, email, résumé PDF, research interests
(shown on `/research`, the home page and `/cv`), the skills shown on `/cv`, and
the radio's playlist. Comments in the file explain each field.

## About and Now: `src/content/pages/about.md`, `now.md`

Plain Markdown. Bump `updated:` in `now.md` whenever you change it.

## Add a project or research project: `src/content/projects/<anything>.yaml`

```yaml
kind: project                            # project → /projects, research → /research
title: Sock Matching
summary: One or two sentences. Lead with what it does.
details:                                 # optional bullets: methods, results, lessons
  - Shown on /projects and /research, not on the home page.
note: paper in progress                  # optional, shown next to the year
skills: [Machine Learning, Python]       # become the filter chips on /projects
links:                                   # all optional
  github: https://github.com/...
  demo: https://...
  writeup: /writing/some-post            # a post on this site
image: sockAI-1.jpg                      # optional, a file in public/
featured: true                           # projects: home page and CV; research: always shown
order: 1                                 # optional; smaller comes first
date: 2024-03-01                         # optional; used for sorting, the year is shown
status: done                             # done | in-progress | idea
draft: false
```

## Add a job or school: `src/content/experience/<anything>.yaml`

```yaml
kind: work                  # work | education
org: Some Company
role: Software Engineer
start: 2026-06              # YYYY-MM; leave out to show no dates
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
- Footnotes: `text[^1]` and later `[^1]: the note`. On wide screens they also
  appear in the margin beside the text.
- Margin notes (`.mdx` only, no import needed): `<Sidenote>an aside</Sidenote>`
  (lettered a, b, c…) and `<MarginNote>an unlettered aside</MarginNote>`.
- `.md` works too, if you don't need components.
- In inverted (dark) mode images are colour-inverted, which suits line art. For
  a photo, use `<img src="/photo.jpg" alt="..." data-no-invert />` in an `.mdx`
  post to keep it as is.

## Interactive figures in posts

`.mdx` posts can embed the widgets in `src/components/widgets/`. Import them at
the top of the post and add `client:visible` so each loads when scrolled to.
See `widgets-demo.mdx`.

```mdx
import GradientDescent from '../../components/widgets/GradientDescent';

<GradientDescent client:visible caption="What the reader should try." />
```

Available: `GradientDescent`, `Fourier` (`shape="square|sawtooth|triangle"`),
`TinyNet` (`dataset="circle|xor|moons"`). Figures are numbered automatically.

## Music: `public/` + `site.yaml`

Drop audio files in `public/` and list them under `music:`. Give each track more
than one source (e.g. `.ogg` and `.mp3`) so every browser can play it.
