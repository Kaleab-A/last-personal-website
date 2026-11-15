import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import Figure, { Slider } from './Figure';
import { criticalRate, descend, value, type Point, type Quadratic } from './lib/gd';
import { toSvgPoint } from './lib/hooks';

/** A tilted, stretched bowl: eigenvalues 1 and 8, so η must stay below 2/8 = 0.25. */
const BOWL: Quadratic = { a: 1, b: 8, angle: Math.PI / 7 };
const W = 480;
const H = 320;
const UNIT = 70; // px per unit
const START: Point = [-2.6, 1.7];
const LEVELS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((r) => (r * r) / 2); // evenly spaced radii

const sx = (x: number) => W / 2 + x * UNIT;
const sy = (y: number) => H / 2 - y * UNIT;
const fromSvg = (x: number, y: number): Point => [(x - W / 2) / UNIT, (H / 2 - y) / UNIT];
const clampPoint = ([x, y]: Point): Point => [
	Math.max(-W / 2 / UNIT, Math.min(W / 2 / UNIT, x)),
	Math.max(-H / 2 / UNIT, Math.min(H / 2 / UNIT, y)),
];

interface Props {
	caption?: string;
}

/**
 * Drag the start point, change the learning rate, and watch gradient descent
 * slide into the bowl, zig-zag across it, or fly out of it.
 */
export default function GradientDescent({ caption }: Props) {
	const [start, setStart] = useState<Point>(START);
	const [lr, setLr] = useState(0.1);
	const [steps, setSteps] = useState(30);
	const svgRef = useRef<SVGSVGElement>(null);
	const dragging = useRef(false);

	const path = useMemo(() => descend(BOWL, start, lr, steps), [start, lr, steps]);
	const critical = criticalRate(BOWL);
	const end = path.at(-1)!;
	const diverging = lr >= critical;
	const zigzag = !diverging && lr > 1 / Math.max(BOWL.a, BOWL.b);

	const moveTo = (e: PointerEvent<SVGElement>) => {
		const svg = svgRef.current;
		if (!svg) return;
		const p = toSvgPoint(svg, e.clientX, e.clientY);
		setStart(clampPoint(fromSvg(p.x, p.y)));
	};

	const onKeyDown = (e: KeyboardEvent) => {
		const d = e.shiftKey ? 0.5 : 0.1;
		const moves: Record<string, Point> = {
			ArrowLeft: [-d, 0],
			ArrowRight: [d, 0],
			ArrowUp: [0, d],
			ArrowDown: [0, -d],
		};
		const m = moves[e.key];
		if (!m) return;
		e.preventDefault();
		setStart(([x, y]) => clampPoint([x + m[0], y + m[1]]));
	};

	const reset = () => {
		setStart(START);
		setLr(0.1);
		setSteps(30);
	};

	const angleDeg = (-BOWL.angle * 180) / Math.PI; // SVG's y axis points down
	const visible = path.filter(([x, y]) => Math.abs(x) < 50 && Math.abs(y) < 50);

	const status = diverging
		? `diverging: η ≥ 2/λmax = ${critical}`
		: zigzag
			? 'converging, but zig-zagging across the valley'
			: 'converging';

	return (
		<Figure
			caption={caption}
			onReset={reset}
			liveReadout
			controls={
				<>
					<Slider label="η" min={0.01} max={0.3} step={0.005} value={lr} onChange={setLr} format={(v) => v.toFixed(3)} />
					<Slider label="steps" min={1} max={60} step={1} value={steps} onChange={setSteps} />
				</>
			}
			readout={
				<>
					f(x₀) = {value(BOWL, start).toFixed(2)} → f(x<sub>{path.length - 1}</sub>) ={' '}
					{Number.isFinite(value(BOWL, end)) ? value(BOWL, end).toExponential(1) : '∞'} · {status}
				</>
			}
		>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${W} ${H}`}
				role="img"
				aria-label={`Contour plot of a quadratic bowl with a gradient descent path of ${path.length - 1} steps, ${status}.`}
				onPointerDown={(e) => {
					dragging.current = true;
					e.currentTarget.setPointerCapture(e.pointerId);
					moveTo(e);
				}}
				onPointerMove={(e) => dragging.current && moveTo(e)}
				onPointerUp={() => (dragging.current = false)}
				onPointerCancel={() => (dragging.current = false)}
				style={{ touchAction: 'none', cursor: 'crosshair' }}
			>
				<defs>
					<clipPath id="gd-clip">
						<rect width={W} height={H} />
					</clipPath>
				</defs>
				<g clipPath="url(#gd-clip)">
					{LEVELS.map((c) => (
						<ellipse
							key={c}
							className="w-faint"
							cx={sx(0)}
							cy={sy(0)}
							rx={Math.sqrt((2 * c) / BOWL.a) * UNIT}
							ry={Math.sqrt((2 * c) / BOWL.b) * UNIT}
							transform={`rotate(${angleDeg} ${sx(0)} ${sy(0)})`}
						/>
					))}
					<path className="w-thin" d={`M${sx(0) - 5},${sy(0)}h10M${sx(0)},${sy(0) - 5}v10`} />
					<polyline className="w-line" points={visible.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} />
					{visible.slice(1).map(([x, y], i) => (
						<circle key={i} className="w-dot" cx={sx(x)} cy={sy(y)} r={2.5} />
					))}
				</g>
				<circle
					className="w-hollow w-handle"
					cx={sx(start[0])}
					cy={sy(start[1])}
					r={8}
					tabIndex={0}
					role="button"
					aria-roledescription="draggable point"
					aria-label={`Start point at x ${start[0].toFixed(1)}, y ${start[1].toFixed(1)}. Arrow keys move it.`}
					onKeyDown={onKeyDown}
				/>
				<text className="w-text" x={10} y={H - 10}>
					drag anywhere to move the start
				</text>
			</svg>
		</Figure>
	);
}
