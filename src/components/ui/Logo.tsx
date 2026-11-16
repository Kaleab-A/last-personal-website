import type { CSSProperties } from 'react';

/** React twin of Logo.astro, for islands. `src` must already include the base path. */
export default function Logo({ src }: { src: string }) {
	return <span className="logo" aria-hidden="true" style={{ '--logo': `url("${src}")` } as CSSProperties} />;
}
