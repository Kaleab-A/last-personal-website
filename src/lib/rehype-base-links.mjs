/**
 * Rewrites root-relative links and images in Markdown/MDX ("/cv",
 * "/me_sketch.png") so they include the site base path. Lets content files
 * use simple absolute paths that work on the live site and on previews.
 *
 * @param {{ base: string }} options
 */
export default function rehypeBaseLinks({ base }) {
	const prefix = base.replace(/\/+$/, '');
	/** @param {any} node */
	const visit = (node) => {
		if (node.type === 'element' && node.properties) {
			for (const attr of ['href', 'src']) {
				const value = node.properties[attr];
				if (
					typeof value === 'string' &&
					value.startsWith('/') &&
					!value.startsWith('//') &&
					!(prefix && (value === prefix || value.startsWith(prefix + '/')))
				) {
					node.properties[attr] = prefix + value;
				}
			}
		}
		if (node.children) node.children.forEach(visit);
	};
	return (/** @type {any} */ tree) => visit(tree);
}
