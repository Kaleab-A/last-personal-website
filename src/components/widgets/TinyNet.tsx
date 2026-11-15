import { useCallback, useMemo, useRef, useState } from 'react';
import Figure, { Slider } from './Figure';
import { useAnimationFrame, useInView, useReducedMotion } from './lib/hooks';
import { seeded } from './lib/random';
import { accuracy, createNet, loss, makeDataset, predict, trainStep, type DatasetKind, type Net } from './lib/tinynet';

const SIZE = 300;
const GRID = 30; // cells per side for the background shading
const DOMAIN = 1.25; // plot covers [-DOMAIN, DOMAIN]²
const STEPS_PER_FRAME = 4;
const MAX_EPOCHS = 4000;

const toPx = (v: number) => ((v + DOMAIN) / (2 * DOMAIN)) * SIZE;
const cellCenter = (i: number) => -DOMAIN + ((i + 0.5) * 2 * DOMAIN) / GRID;

interface Props {
	caption?: string;
	dataset?: DatasetKind;
}

/**
 * A 2 → H → 1 network learning to separate two classes of points, live.
 * The shading is the network's confidence that a spot belongs to the filled
 * class; the boundary is where it is 50/50.
 */
export default function TinyNet({ caption, dataset: initialDataset = 'circle' }: Props) {
	const [kind, setKind] = useState<DatasetKind>(initialDataset);
	const [hidden, setHidden] = useState(4);
	const [lr, setLr] = useState(0.5);
	const [seed, setSeed] = useState(3);
	const [playing, setPlaying] = useState(true);
	const [, setTick] = useState(0);
	const reduce = useReducedMotion();
	const frame = useRef<HTMLDivElement>(null);
	const inView = useInView(frame);

	const data = useMemo(() => makeDataset(kind, 160, seeded(11)), [kind]);
	const net = useRef<Net>(null!);
	if (!net.current) net.current = createNet(hidden, seeded(seed));
	const epoch = useRef(0);

	const restart = useCallback((h: number, s: number) => {
		net.current = createNet(h, seeded(s));
		epoch.current = 0;
		setTick((t) => t + 1);
	}, []);

	const train = (steps: number) => {
		for (let i = 0; i < steps && epoch.current < MAX_EPOCHS; i++) {
			trainStep(net.current, data, lr);
			epoch.current++;
		}
		setTick((t) => t + 1);
	};

	const running = playing && inView && !reduce && epoch.current < MAX_EPOCHS;
	useAnimationFrame(() => train(STEPS_PER_FRAME), running);

	const cells = [];
	for (let i = 0; i < GRID; i++) {
		for (let j = 0; j < GRID; j++) {
			const p = predict(net.current, cellCenter(i), -cellCenter(j));
			cells.push(
				<rect
					key={`${i}-${j}`}
					className="w-fill"
					x={(i * SIZE) / GRID}
					y={(j * SIZE) / GRID}
					width={SIZE / GRID}
					height={SIZE / GRID}
					fillOpacity={p * 0.32}
				/>,
			);
		}
	}

	const acc = accuracy(net.current, data);
	const done = epoch.current >= MAX_EPOCHS;

	return (
		<Figure
			caption={caption}
			onReset={() => {
				setKind(initialDataset);
				setHidden(4);
				setLr(0.5);
				setSeed(3);
				setPlaying(true);
				restart(4, 3);
			}}
			controls={
				<>
					<label className="widget__slider">
						<span>data</span>
						<select
							value={kind}
							onChange={(e) => {
								setKind(e.currentTarget.value as DatasetKind);
								restart(hidden, seed);
							}}
						>
							<option value="circle">circle</option>
							<option value="xor">xor</option>
							<option value="moons">moons</option>
						</select>
					</label>
					<Slider
						label="hidden units"
						min={1}
						max={8}
						step={1}
						value={hidden}
						onChange={(h) => {
							setHidden(h);
							restart(h, seed);
						}}
					/>
					<Slider label="η" min={0.05} max={2} step={0.05} value={lr} onChange={setLr} format={(v) => v.toFixed(2)} />
					{reduce ? (
						<button type="button" className="btn" onClick={() => train(200)} disabled={done}>
							train 200 steps
						</button>
					) : (
						<button type="button" className="btn" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
							{playing ? 'pause' : 'train'}
						</button>
					)}
					<button
						type="button"
						className="btn"
						onClick={() => {
							const s = seed + 1;
							setSeed(s);
							restart(hidden, s);
						}}
					>
						new weights
					</button>
				</>
			}
			readout={
				<>
					epoch {epoch.current}
					{done ? ' (stopped)' : ''} · loss {loss(net.current, data).toFixed(3)} · accuracy {(acc * 100).toFixed(0)}%
				</>
			}
		>
			<div ref={frame}>
				<svg
					viewBox={`0 0 ${SIZE} ${SIZE}`}
					role="img"
					aria-label={`A neural network with ${hidden} hidden units classifying the ${kind} dataset, currently ${(acc * 100).toFixed(0)}% accurate.`}
					style={{ maxWidth: '26rem', margin: '0 auto' }}
				>
					<g shapeRendering="crispEdges">{cells}</g>
					{data.map((s, i) =>
						s.label ? (
							<circle key={i} className="w-dot" cx={toPx(s.x)} cy={toPx(-s.y)} r={3.2} />
						) : (
							<circle key={i} className="w-hollow" cx={toPx(s.x)} cy={toPx(-s.y)} r={3} />
						),
					)}
				</svg>
			</div>
		</Figure>
	);
}
