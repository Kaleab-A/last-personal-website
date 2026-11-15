import { describe, expect, it } from 'vitest';
import { bringToFront, frontIndex, initialOrder } from './order';

const isPermutation = (order: number[]) =>
	[...order].sort((a, b) => a - b).every((d, i) => d === i);

describe('initialOrder', () => {
	it('puts sheet 0 in front', () => {
		expect(initialOrder(4)).toEqual([0, 1, 2, 3]);
		expect(initialOrder(0)).toEqual([]);
	});
});

describe('bringToFront', () => {
	it('moves the chosen sheet to depth 0 and shifts the ones above it back', () => {
		expect(bringToFront([0, 1, 2, 3], 2)).toEqual([1, 2, 0, 3]);
	});

	it('leaves sheets that were already behind it alone', () => {
		expect(bringToFront([0, 1, 2, 3], 1)).toEqual([1, 0, 2, 3]);
	});

	it('is a no-op for the front sheet and out-of-range indexes', () => {
		expect(bringToFront([2, 0, 1], 1)).toEqual([2, 0, 1]);
		expect(bringToFront([0, 1], 5)).toEqual([0, 1]);
	});

	it('does not mutate its input', () => {
		const order = [0, 1, 2];
		bringToFront(order, 2);
		expect(order).toEqual([0, 1, 2]);
	});

	it('always returns a permutation, however many times it is applied', () => {
		let order = initialOrder(5);
		for (const i of [4, 2, 2, 0, 3, 1, 4, 4, 0]) {
			order = bringToFront(order, i);
			expect(isPermutation(order)).toBe(true);
			expect(frontIndex(order)).toBe(i);
		}
	});
});
