/**
 * Gradient descent on a 2D quadratic bowl f(p) = ½ pᵀ A p, where A has
 * eigenvalues `a` and `b` and is rotated by `angle`. Small enough to reason
 * about exactly: it converges iff 0 < η < 2 / λ_max.
 */
export type Point = [number, number];

export interface Quadratic {
	a: number;
	b: number;
	/** Rotation of the bowl's axes, in radians. */
	angle: number;
}

/** The symmetric matrix A as [a11, a12, a22]. */
export function matrix({ a, b, angle }: Quadratic): [number, number, number] {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return [a * c * c + b * s * s, (a - b) * c * s, a * s * s + b * c * c];
}

export function value(q: Quadratic, [x, y]: Point): number {
	const [m11, m12, m22] = matrix(q);
	return 0.5 * (m11 * x * x + 2 * m12 * x * y + m22 * y * y);
}

export function gradient(q: Quadratic, [x, y]: Point): Point {
	const [m11, m12, m22] = matrix(q);
	return [m11 * x + m12 * y, m12 * x + m22 * y];
}

/** Learning rates at or above this diverge. */
export function criticalRate(q: Quadratic): number {
	return 2 / Math.max(q.a, q.b);
}

/** The iterates x₀, x₁, …, x_steps. Stops early once it has clearly blown up. */
export function descend(q: Quadratic, start: Point, lr: number, steps: number): Point[] {
	const path: Point[] = [start];
	let p = start;
	for (let i = 0; i < steps; i++) {
		const [gx, gy] = gradient(q, p);
		p = [p[0] - lr * gx, p[1] - lr * gy];
		path.push(p);
		if (Math.hypot(p[0], p[1]) > 1e6) break;
	}
	return path;
}
