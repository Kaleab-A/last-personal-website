/**
 * Copies each Markdown footnote ([^1]) next to its reference as a
 * <span class="sidenote sidenote--auto">, so on wide screens footnotes sit in
 * the margin beside the text. The normal footnotes section stays in place for
 * narrow screens, print and screen readers (the copies are aria-hidden).
 */
export default function rehypeSidenotes() {
	return (/** @type {any} */ tree) => {
		/** @type {Map<string, any>} */
		const notes = new Map();
		walk(tree, (node) => {
			if (node.tagName === 'li' && String(node.properties?.id ?? '').startsWith('user-content-fn-')) {
				notes.set(node.properties.id, node);
			}
		});
		if (notes.size === 0) return;

		walk(tree, (node) => {
			if (!node.children) return;
			for (let i = node.children.length - 1; i >= 0; i--) {
				const sup = node.children[i];
				if (sup.tagName !== 'sup') continue;
				const ref = sup.children?.find((c) => c.properties && 'dataFootnoteRef' in c.properties);
				if (!ref) continue;
				const id = String(ref.properties.href ?? '').replace(/^#/, '');
				const note = notes.get(id);
				if (!note) continue;
				const number = textOf(ref);
				node.children.splice(i + 1, 0, {
					type: 'element',
					tagName: 'span',
					properties: { className: ['sidenote', 'sidenote--auto'], ariaHidden: 'true', dataN: number },
					children: inline(note.children),
				});
			}
		});
	};
}

/** Footnote <li> content, flattened to phrasing content, minus the ↩ backlink. */
function inline(children) {
	const out = [];
	for (const child of children) {
		if (child.properties && 'dataFootnoteBackref' in child.properties) continue;
		if (child.tagName === 'p') out.push(...inline(child.children), { type: 'text', value: ' ' });
		else if (child.children) out.push({ ...child, children: inline(child.children) });
		else out.push(child);
	}
	return out;
}

function textOf(node) {
	if (node.type === 'text') return node.value;
	return (node.children ?? []).map(textOf).join('');
}

function walk(node, visit) {
	visit(node);
	for (const child of node.children ?? []) walk(child, visit);
}
