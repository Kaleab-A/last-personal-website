# last-personal-website

Kaleab's personal site: a stack of overlapping paper pages, black lines on white.

**Live:** https://kaleab-a.github.io/last-personal-website/

## Develop

Needs Node 22.23+ (see `.nvmrc`).

```sh
npm install
npm run dev       # http://localhost:4321/last-personal-website/
npm run build     # static site in dist/ (also validates all content)
npm run check     # type-check .astro/.ts files
npm test          # unit tests (vitest)
```

## Content

Everything you'd want to edit (bio, projects, jobs, posts, music) is a
Markdown or YAML file in `src/content/`. See **[CONTENT.md](CONTENT.md)**.

## How it's built

- [Astro](https://astro.build) produces static HTML for every page; React is
  only used for the interactive pieces (the page stack, the project filter, the
  radio).
- `src/components/stack/` holds the overlapping pages. `order.ts` is the pure
  "bring to front" logic (tested); `PageStack.tsx` and `Sheet.tsx` render it;
  `stack.css` does the layout, including the phone "pile".
- `src/styles/tokens.css` holds the whole visual system: change `--ink` and
  `--paper` and everything follows.
- Posts support LaTeX via remark-math + KaTeX.

## Branch previews

Every pushed branch is built by `.github/workflows/deploy.yml` and published to
`https://kaleab-a.github.io/last-personal-website/preview/<branch>/` (`/` in the
branch name becomes `-`). Previews show drafts, carry a "preview" banner, and
are hidden from search engines. Pushing `main` updates the live site. Deleting
a branch removes its preview.

One-time setup: repo **Settings → Actions → General → Workflow permissions →
Read and write**. Pages should stay on the `gh-pages` branch.
