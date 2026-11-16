const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 2026-11-15 — dates are shown ISO-style, in UTC so they never shift a day. */
export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}

/** "2024-06" → "Jun 2024"; "2024" → "2024"; undefined → "Present". */
export function monthYear(value?: string): string {
	if (!value) return 'Present';
	const [year, month] = value.split('-');
	return month ? `${MONTHS[Number(month) - 1]} ${year}` : year!;
}

/**
 * A date range for the CV: "Aug 2024 – Present", "2023 – 2027", and within
 * one year "May – Aug 2025". No start means no dates (or just the end).
 */
export function dateRange(start?: string, end?: string): string | null {
	if (!start) return end ? monthYear(end) : null;
	const [startYear, startMonth] = start.split('-');
	const [endYear, endMonth] = end?.split('-') ?? [];
	if (end && startYear === endYear && startMonth && endMonth) {
		return startMonth === endMonth
			? monthYear(start)
			: `${MONTHS[Number(startMonth) - 1]} – ${MONTHS[Number(endMonth) - 1]} ${startYear}`;
	}
	return `${monthYear(start)} – ${monthYear(end)}`;
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
