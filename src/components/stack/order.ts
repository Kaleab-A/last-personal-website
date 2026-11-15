/**
 * Stack ordering. `order[i]` is how deep sheet i sits in the pile:
 * 0 = front, 1 = just behind it, and so on. Always a permutation of 0..n-1.
 */

/** Sheet 0 in front, sheet n-1 at the back. */
export function initialOrder(count: number): number[] {
	return Array.from({ length: count }, (_, i) => i);
}

/**
 * Pull sheet `index` to the front. Sheets that were in front of it shift back
 * by one; sheets behind it stay put — like pulling a page out of a pile and
 * laying it on top. (Port of "Option 2" from the original HomePage.tsx.)
 */
export function bringToFront(order: readonly number[], index: number): number[] {
	const depth = order[index];
	if (depth === undefined || depth === 0) return [...order];
	return order.map((d, i) => (i === index ? 0 : d < depth ? d + 1 : d));
}

/** Index of the sheet currently at the front. */
export function frontIndex(order: readonly number[]): number {
	return order.indexOf(0);
}
