import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, getSite } from '../lib/content';
import { url } from '../lib/url';

export async function GET(context: APIContext) {
	const site = await getSite();
	const posts = await getPosts();
	return rss({
		title: `${site.shortName}'s writing`,
		description: site.description,
		site: context.site!,
		items: posts.map((post) => ({
			title: post.data.title,
			pubDate: post.data.date,
			description: post.data.summary,
			categories: post.data.tags,
			link: url(`/writing/${post.id}/`),
		})),
	});
}
