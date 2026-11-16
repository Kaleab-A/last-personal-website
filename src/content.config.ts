/**
 * Content schemas. Every file in src/content/ is checked against these at
 * build time, so a missing field or a typo fails the build with a message
 * that names the file. See CONTENT.md for how to add things.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A logo or icon: a file in public/, e.g. "logos/dropbox.svg". Drawn in the text colour. */
const logo = z.string().optional();

const link = z.object({
	label: z.string(),
	url: z.url(),
	icon: logo,
});

/** src/content/site.yaml — name, intro text, links, music. */
const site = defineCollection({
	loader: glob({ pattern: 'site.yaml', base: './src/content' }),
	schema: z.object({
		name: z.string(),
		shortName: z.string(),
		description: z.string(),
		greeting: z.string(),
		tagline: z.string(),
		intro: z.string(),
		portrait: z.string(),
		email: z.email().optional(),
		resume: z.string().optional(),
		socials: z.array(link).default([]),
		/** Shown on /research, the home page and the CV. */
		interests: z.array(z.string()).default([]),
		/** The small "where I am" line under the tagline on the home page. */
		affiliations: z.array(z.object({ label: z.string(), url: z.url().optional(), logo })).default([]),
		skills: z
			.array(z.object({ group: z.string(), items: z.array(z.string()) }))
			.default([]),
		music: z
			.array(
				z.object({
					title: z.string(),
					/** One or more files in public/, e.g. ["song.ogg", "song.mp3"]. */
					sources: z.array(z.string()).min(1),
				}),
			)
			.default([]),
	}),
});

/** src/content/pages/about.md and now.md — free-form Markdown pages. */
const pages = defineCollection({
	loader: glob({ pattern: '*.md', base: './src/content/pages' }),
	schema: z.object({
		title: z.string(),
		updated: z.coerce.date().optional(),
	}),
});

/** src/content/projects/*.yaml — one file per project or research project. */
const projects = defineCollection({
	loader: glob({ pattern: '*.{yaml,yml}', base: './src/content/projects' }),
	schema: z.object({
		/** "research" goes on /research, "project" on /projects. */
		kind: z.enum(['research', 'project']).default('project'),
		title: z.string(),
		summary: z.string(),
		/** Optional bullet points: methods, results, lessons. Shown on the full pages. */
		details: z.array(z.string()).default([]),
		/** A short note shown next to the title, e.g. "paper in progress". */
		note: z.string().optional(),
		skills: z.array(z.string()).default([]),
		links: z
			.object({
				github: z.url().optional(),
				demo: z.url().optional(),
				writeup: z.string().optional(),
			})
			.default({}),
		/** File in public/, e.g. "sockAI-1.jpg". */
		image: z.string().optional(),
		/** Small logo next to the title, e.g. "logos/kaggle.svg". */
		logo,
		featured: z.boolean().default(false),
		/** Smaller comes first. Projects without one go after, newest first. */
		order: z.number().optional(),
		/** When it was done; the year is shown. Leave out if you'd rather not say. */
		date: z.coerce.date().optional(),
		status: z.enum(['done', 'in-progress', 'idea']).default('done'),
		draft: z.boolean().default(false),
	}),
});

const yearMonth = z
	.string()
	.regex(/^\d{4}(-(0[1-9]|1[0-2]))?$/, 'Use YYYY-MM (e.g. 2024-06) or just YYYY');

/** src/content/experience/*.yaml — one file per job or school. */
const experience = defineCollection({
	loader: glob({ pattern: '*.{yaml,yml}', base: './src/content/experience' }),
	schema: z.object({
		kind: z.enum(['work', 'education']),
		org: z.string(),
		role: z.string(),
		/** Leave out to show no dates at all. */
		start: yearMonth.optional(),
		/** Leave out for "present". */
		end: yearMonth.optional(),
		/** Instead of start/end, for a role held more than once (e.g. two summers). */
		periods: z.array(z.object({ start: yearMonth, end: yearMonth.optional() })).optional(),
		/** Small logo next to the organisation, e.g. "logos/dropbox.svg". */
		logo,
		location: z.string().optional(),
		url: z.url().optional(),
		bullets: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

/** src/content/writing/*.md(x) — blog posts. */
const writing = defineCollection({
	loader: glob({ pattern: '*.{md,mdx}', base: './src/content/writing' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		summary: z.string(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

export const collections = { site, pages, projects, experience, writing };
