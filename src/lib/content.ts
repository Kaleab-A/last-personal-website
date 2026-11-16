/**
 * The only place pages read content from. Handles drafts, sorting, and
 * turning raw entries into the small shapes components need.
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { url } from './url';

/** Drafts are visible in `npm run dev` and on branch previews, never on the live site. */
export const SHOW_DRAFTS = import.meta.env.DEV || import.meta.env.PUBLIC_PREVIEW === 'true';

const visible = ({ data }: { data: { draft?: boolean } }) => SHOW_DRAFTS || !data.draft;

export async function getSite() {
	const entry = await getEntry('site', 'site');
	if (!entry) throw new Error('src/content/site.yaml is missing');
	return entry.data;
}

export async function getPage(id: 'about' | 'now') {
	const entry = await getEntry('pages', id);
	if (!entry) throw new Error(`src/content/pages/${id}.md is missing`);
	return entry;
}

export type Post = CollectionEntry<'writing'>;

/** Newest first. */
export async function getPosts(): Promise<Post[]> {
	const posts = await getCollection('writing', visible);
	return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Serializable project shape, shared by static cards and the filter island. */
export interface ProjectView {
	id: string;
	kind: 'research' | 'project';
	title: string;
	summary: string;
	details: string[];
	note?: string;
	skills: string[];
	links: { label: string; href: string }[];
	image?: string;
	featured: boolean;
	status: 'done' | 'in-progress' | 'idea';
	year?: number;
	draft: boolean;
}

/**
 * Projects of one kind (or all): featured first, then by `order`, then newest
 * first (undated ones count as newest), then by title.
 */
export async function getProjects(kind?: ProjectView['kind']): Promise<ProjectView[]> {
	const entries = await getCollection('projects', (e) => visible(e) && (!kind || e.data.kind === kind));
	const time = (d?: Date) => d?.getTime() ?? Infinity;
	return entries
		.sort(
			(a, b) =>
				Number(b.data.featured) - Number(a.data.featured) ||
				(a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
				time(b.data.date) - time(a.data.date) ||
				a.data.title.localeCompare(b.data.title),
		)
		.map(({ id, data }) => {
			const links: ProjectView['links'] = [];
			if (data.links.github) links.push({ label: 'GitHub', href: data.links.github });
			if (data.links.demo) links.push({ label: 'Demo', href: data.links.demo });
			if (data.links.writeup) links.push({ label: 'Write-up', href: url(data.links.writeup) });
			return {
				id,
				kind: data.kind,
				title: data.title,
				summary: data.summary,
				details: data.details,
				note: data.note,
				skills: data.skills,
				links,
				image: data.image ? url(data.image) : undefined,
				featured: data.featured,
				status: data.status,
				year: data.date?.getUTCFullYear(),
				draft: data.draft,
			};
		});
}

export type Experience = CollectionEntry<'experience'>;

/** Newest first, split into work and education. */
export async function getExperience() {
	const entries = await getCollection('experience', visible);
	const sorted = entries.sort(
		(a, b) =>
			(b.data.end ?? '9999').localeCompare(a.data.end ?? '9999') ||
			(b.data.start ?? '9999').localeCompare(a.data.start ?? '9999'),
	);
	return {
		work: sorted.filter((e) => e.data.kind === 'work'),
		education: sorted.filter((e) => e.data.kind === 'education'),
	};
}
