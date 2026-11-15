import { useMemo, useRef, useState } from 'react';
import Figure, { Slider } from './Figure';
import { useAnimationFrame, useInView, useReducedMotion } from './lib/hooks';

type Shape = 'square' | 'sawtooth' | 'triangle';

/** Sine-series coefficients: f(t) ≈ Σ amp · sin(n t). */
const SERIES: Record<Shape, { formula: string; terms: (count: number) => { n: number; amp: number }[] }> = {
	square: {
		formula: '(4/π) Σ sin(nt)/n,  n odd',
		terms: (count) => Array.from({ length: count }, (_, k) => ({ n: 2 * k + 1, amp: 4 / ((2 * k + 1) * Math.PI) })),
	},
	sawtooth: {
		formula: '(2/π) Σ (−1)ⁿ⁺¹ sin(nt)/n',
		terms: (count) =>
			Array.from({ length: count }, (_, k) => ({ n: k + 1, amp: ((k % 2 ? -1 : 1) * 2) / ((k + 1) * Math.PI) })),
	},
	triangle: {
		formula: '(8/π²) Σ (−1)^((n−1)/2) sin(nt)/n²,  n odd',
		terms: (count) =>
			Array.from({ length: count }, (_, k) => {
				const n = 2 * k + 1;
				return { n, amp: ((k % 2 ? -1 : 1) * 8) / (Math.PI * Math.PI * n * n) };
			}),
	},
};

const W = 520;
const H = 240;
const CX = 120;
const CY = H / 2;
const R = 62; // radius scale
const WAVE_X = 250; // where the traced wave starts
const WAVE_LEN = 250; // px of history
const SPEED = 1.1; // radians per second

/** Tip of the chain of circles at time t, plus every circle along the way. */
function chain(terms: { n: number; amp: number }[], t: number) {
	let x = CX;
	let y = CY;
	const circles: { x: number; y: number; r: number; nx: number; ny: number }[] = [];
	for (const { n, amp } of terms) {
		const r = amp * R;
		const nx = x + r * Math.cos(n * t);
		const ny = y - r * Math.sin(n * t);
		circles.push({ x, y, r: Math.abs(r), nx, ny });
		x = nx;
		y = ny;
	}
	return { tip: { x, y }, circles };
}

interface Props {
	caption?: string;
	shape?: Shape;
}

/**
 * Circles spinning at whole-number speeds, stacked tip to tail. Their tip
 * traces a wave; add more circles and it approaches the target shape.
 */
export default function Fourier({ caption, shape: initialShape = 'square' }: Props) {
	const [shape, setShape] = useState<Shape>(initialShape);
	const [count, setCount] = useState(4);
	const [playing, setPlaying] = useState(true);
	const [t, setT] = useState(0);
	const reduce = useReducedMotion();
	const ref = useRef<HTMLDivElement>(null);
	const inView = useInView(ref);

	const terms = useMemo(() => SERIES[shape].terms(count), [shape, count]);
	const animate = playing && inView && !reduce;
	useAnimationFrame((dt) => setT((v) => v + dt * SPEED), animate);

	// The wave is a pure function of t, so it never needs a history buffer:
	// a point WAVE_LEN px to the right is the tip's height that long ago.
	const wave = useMemo(() => {
		const pts: string[] = [];
		for (let px = 0; px <= WAVE_LEN; px += 2) {
			const past = t - px / 60;
			pts.push(`${WAVE_X + px},${chain(terms, past).tip.y.toFixed(2)}`);
		}
		return pts.join(' ');
	}, [terms, t]);

	const { tip, circles } = chain(terms, t);

	return (
		<Figure
			caption={caption}
			onReset={() => {
				setShape(initialShape);
				setCount(4);
				setT(0);
				setPlaying(true);
			}}
			controls={
				<>
					<label className="widget__slider">
						<span>shape</span>
						<select value={shape} onChange={(e) => setShape(e.currentTarget.value as Shape)}>
							<option value="square">square</option>
							<option value="sawtooth">sawtooth</option>
							<option value="triangle">triangle</option>
						</select>
					</label>
					<Slider label="circles" min={1} max={30} step={1} value={count} onChange={setCount} />
					{!reduce ? (
						<button type="button" className="btn" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
							{playing ? 'pause' : 'play'}
						</button>
					) : null}
				</>
			}
			readout={<>{shape} ≈ {SERIES[shape].formula} · first {count} term{count > 1 ? 's' : ''}</>}
		>
			<div ref={ref}>
				<svg
					viewBox={`0 0 ${W} ${H}`}
					role="img"
					aria-label={`${count} rotating circles tracing an approximation of a ${shape} wave.`}
				>
					<line className="w-faint" x1={WAVE_X} y1={CY} x2={W - 10} y2={CY} />
					{circles.map((c, i) => (
						<g key={i}>
							<circle className="w-faint" cx={c.x} cy={c.y} r={c.r} />
							<line className="w-thin" x1={c.x} y1={c.y} x2={c.nx} y2={c.ny} />
						</g>
					))}
					<line className="w-faint" x1={tip.x} y1={tip.y} x2={WAVE_X} y2={tip.y} strokeDasharray="3 3" />
					<polyline className="w-line" points={wave} />
					<circle className="w-dot" cx={tip.x} cy={tip.y} r={3.5} />
					<circle className="w-dot" cx={WAVE_X} cy={tip.y} r={3} />
				</svg>
			</div>
		</Figure>
	);
}
