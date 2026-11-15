// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeBaseLinks from './src/lib/rehype-base-links.mjs';
import rehypeSidenotes from './src/lib/rehype-sidenotes.mjs';

// BASE_PATH is set by the deploy workflow so each branch can be previewed
// under /last-personal-website/preview/<branch>/. Locally it defaults to the
// live path so links behave the same as in production.
const base = process.env.BASE_PATH ?? '/last-personal-website/';

export default defineConfig({
	site: 'https://kaleab-a.github.io',
	base,
	integrations: [react(), mdx(), sitemap()],
	markdown: {
		// remark/rehype pipeline so posts can use $inline$ and $$display$$ LaTeX,
		// and so root-relative links in content ("/cv") get the base path.
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex, [rehypeBaseLinks, { base }], rehypeSidenotes],
		}),
		// Colors come from CSS variables in src/styles/tokens.css (monochrome).
		shikiConfig: { theme: 'css-variables' },
	},
});
