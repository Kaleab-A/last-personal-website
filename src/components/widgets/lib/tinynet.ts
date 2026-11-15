/**
 * A two-layer neural network for 2D binary classification, written out by
 * hand so the maths is visible: 2 inputs → `hidden` tanh units → 1 sigmoid
 * output, trained with full-batch gradient descent on cross-entropy loss.
 */
import { gaussian } from './random';

export interface Sample {
	x: number;
	y: number;
	/** 0 or 1 */
	label: number;
}

export interface Net {
	hidden: number;
	/** hidden × 2 input weights, row-major: [w_j,x, w_j,y, …] */
	w1: Float64Array;
	b1: Float64Array;
	w2: Float64Array;
	b2: number;
}

export function createNet(hidden: number, rand: () => number): Net {
	const w1 = new Float64Array(hidden * 2).map(() => gaussian(rand) * 1.2);
	const b1 = new Float64Array(hidden).map(() => gaussian(rand) * 0.5);
	const w2 = new Float64Array(hidden).map(() => gaussian(rand) / Math.sqrt(hidden));
	return { hidden, w1, b1, w2, b2: 0 };
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** P(label = 1 | x, y). */
export function predict(net: Net, x: number, y: number): number {
	let z = net.b2;
	for (let j = 0; j < net.hidden; j++) {
		z += net.w2[j]! * Math.tanh(net.w1[2 * j]! * x + net.w1[2 * j + 1]! * y + net.b1[j]!);
	}
	return sigmoid(z);
}

/** Mean binary cross-entropy. */
export function loss(net: Net, data: Sample[]): number {
	let total = 0;
	for (const s of data) {
		const p = Math.min(1 - 1e-12, Math.max(1e-12, predict(net, s.x, s.y)));
		total -= s.label * Math.log(p) + (1 - s.label) * Math.log(1 - p);
	}
	return total / data.length;
}

export function accuracy(net: Net, data: Sample[]): number {
	let right = 0;
	for (const s of data) if (predict(net, s.x, s.y) >= 0.5 === (s.label === 1)) right++;
	return right / data.length;
}

export interface Gradients {
	w1: Float64Array;
	b1: Float64Array;
	w2: Float64Array;
	b2: number;
}

/** Backpropagation: gradient of the mean loss with respect to every parameter. */
export function gradients(net: Net, data: Sample[]): Gradients {
	const H = net.hidden;
	const g: Gradients = {
		w1: new Float64Array(H * 2),
		b1: new Float64Array(H),
		w2: new Float64Array(H),
		b2: 0,
	};
	const h = new Float64Array(H);
	for (const s of data) {
		// forward
		let z2 = net.b2;
		for (let j = 0; j < H; j++) {
			h[j] = Math.tanh(net.w1[2 * j]! * s.x + net.w1[2 * j + 1]! * s.y + net.b1[j]!);
			z2 += net.w2[j]! * h[j]!;
		}
		// backward: for sigmoid + cross-entropy, dL/dz2 = p − label
		const dz2 = sigmoid(z2) - s.label;
		g.b2 += dz2;
		for (let j = 0; j < H; j++) {
			g.w2[j]! += dz2 * h[j]!;
			const dz1 = dz2 * net.w2[j]! * (1 - h[j]! * h[j]!); // tanh' = 1 − tanh²
			g.w1[2 * j]! += dz1 * s.x;
			g.w1[2 * j + 1]! += dz1 * s.y;
			g.b1[j]! += dz1;
		}
	}
	const n = data.length;
	g.w1.forEach((v, i) => (g.w1[i] = v / n));
	g.b1.forEach((v, i) => (g.b1[i] = v / n));
	g.w2.forEach((v, i) => (g.w2[i] = v / n));
	g.b2 /= n;
	return g;
}

/** One gradient-descent step, in place. */
export function trainStep(net: Net, data: Sample[], lr: number): void {
	const g = gradients(net, data);
	for (let i = 0; i < net.w1.length; i++) net.w1[i]! -= lr * g.w1[i]!;
	for (let j = 0; j < net.hidden; j++) {
		net.b1[j]! -= lr * g.b1[j]!;
		net.w2[j]! -= lr * g.w2[j]!;
	}
	net.b2 -= lr * g.b2;
}

export type DatasetKind = 'circle' | 'xor' | 'moons';

/** Toy datasets inside roughly [-1, 1]². */
export function makeDataset(kind: DatasetKind, n: number, rand: () => number): Sample[] {
	const data: Sample[] = [];
	const noise = () => gaussian(rand) * 0.06;
	for (let i = 0; i < n; i++) {
		const label = i % 2;
		if (kind === 'circle') {
			const r = label ? rand() * 0.45 : 0.65 + rand() * 0.35;
			const t = rand() * 2 * Math.PI;
			data.push({ x: r * Math.cos(t) + noise(), y: r * Math.sin(t) + noise(), label });
		} else if (kind === 'xor') {
			const x = rand() * 2 - 1;
			const y = rand() * 2 - 1;
			const pad = (v: number) => v + Math.sign(v) * 0.08;
			data.push({ x: pad(x), y: pad(y), label: x * y > 0 ? 1 : 0 });
		} else {
			const t = rand() * Math.PI;
			const [x, y] = label ? [1 - Math.cos(t), 0.5 - Math.sin(t)] : [Math.cos(t), Math.sin(t)];
			data.push({ x: (x - 0.5) * 0.85 + noise(), y: (y - 0.25) * 0.85 + noise(), label });
		}
	}
	return data;
}
