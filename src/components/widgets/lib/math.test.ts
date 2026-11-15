import { describe, expect, it } from 'vitest';
import { criticalRate, descend, gradient, value, type Quadratic } from './gd';
import { seeded } from './random';
import { accuracy, createNet, gradients, loss, makeDataset, trainStep } from './tinynet';

const bowl: Quadratic = { a: 1, b: 8, angle: Math.PI / 7 };

describe('gradient descent on a quadratic', () => {
	it('gradient matches finite differences', () => {
		const p: [number, number] = [0.7, -1.3];
		const h = 1e-6;
		const [gx, gy] = gradient(bowl, p);
		expect(gx).toBeCloseTo((value(bowl, [p[0] + h, p[1]]) - value(bowl, [p[0] - h, p[1]])) / (2 * h), 5);
		expect(gy).toBeCloseTo((value(bowl, [p[0], p[1] + h]) - value(bowl, [p[0], p[1] - h])) / (2 * h), 5);
	});

	it('converges below 2/λmax and diverges above it', () => {
		const eta = criticalRate(bowl);
		expect(eta).toBeCloseTo(0.25);
		const start: [number, number] = [-2, 1.5];
		const ok = descend(bowl, start, eta * 0.9, 300).at(-1)!;
		const bad = descend(bowl, start, eta * 1.1, 300).at(-1)!;
		expect(value(bowl, ok)).toBeLessThan(1e-6);
		expect(value(bowl, bad)).toBeGreaterThan(value(bowl, start));
	});
});

describe('tiny neural net', () => {
	it('backprop matches finite differences', () => {
		const rand = seeded(1);
		const net = createNet(3, rand);
		const data = makeDataset('xor', 20, rand);
		const g = gradients(net, data);
		const h = 1e-6;
		const check = (arr: Float64Array, i: number, analytic: number) => {
			const old = arr[i]!;
			arr[i] = old + h;
			const up = loss(net, data);
			arr[i] = old - h;
			const down = loss(net, data);
			arr[i] = old;
			expect(analytic).toBeCloseTo((up - down) / (2 * h), 5);
		};
		for (let i = 0; i < net.w1.length; i++) check(net.w1, i, g.w1[i]!);
		for (let j = 0; j < net.hidden; j++) {
			check(net.b1, j, g.b1[j]!);
			check(net.w2, j, g.w2[j]!);
		}
	});

	it('learns XOR and the circle', () => {
		for (const kind of ['xor', 'circle'] as const) {
			const rand = seeded(7);
			const data = makeDataset(kind, 120, rand);
			const net = createNet(6, rand);
			const before = loss(net, data);
			for (let i = 0; i < 1500; i++) trainStep(net, data, 0.5);
			expect(loss(net, data)).toBeLessThan(before);
			expect(accuracy(net, data)).toBeGreaterThan(0.9);
		}
	});
});
