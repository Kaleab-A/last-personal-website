/**
 * Prefix a site path with the configured base, so links work both on the live
 * site (/last-personal-website/...) and on branch previews
 * (/last-personal-website/preview/<branch>/...). External URLs pass through.
 */
export function url(path = '/'): string {
	if (/^[a-z]+:/i.test(path) || path.startsWith('//') || path.startsWith('#')) return path;
	const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
	const clean = path.replace(/^\/+/, '');
	return `${base}/${clean}`;
}

/** True when the current path is `href` or a page under it (for nav highlighting). */
export function isCurrent(currentPath: string, href: string): boolean {
	const strip = (p: string) => p.replace(/\/+$/, '') || '/';
	const current = strip(currentPath);
	const target = strip(url(href));
	if (target === strip(url('/'))) return current === target;
	return current === target || current.startsWith(target + '/');
}
