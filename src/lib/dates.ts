const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 2026-11-15 — dates are shown ISO-style, in UTC so they never shift a day. */
export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** "2024-06" → "Jun 2024"; undefined → "Present". */
export function monthYear(value?: string): string {
	if (!value) return 'Present';
	const [year, month] = value.split('-');
	return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Rough reading time for a Markdown body, at ~220 words per minute. */
export function readingMinutes(body = ''): number {
	const words = body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/\$\$[\s\S]*?\$\$/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}
