import type { CSSProperties, ReactNode } from 'react';
import './widgets.css';

interface Props {
	/** The drawing. */
	children: ReactNode;
	/** Sliders, buttons, selects. */
	controls?: ReactNode;
	/** One line of numbers under the controls. */
	readout?: ReactNode;
	/** Announce readout changes to screen readers (only for user-driven updates). */
	liveReadout?: boolean;
	caption?: ReactNode;
	onReset?: () => void;
}

/** The frame every widget sits in: drawing, controls, readout, numbered caption. */
export default function Figure({ children, controls, readout, liveReadout = false, caption, onReset }: Props) {
	return (
		<figure className="widget">
			<div className="widget__stage">{children}</div>
			{controls || onReset ? (
				<div className="widget__controls">
					{controls}
					{onReset ? (
						<button type="button" className="btn widget__reset" onClick={onReset}>
							reset
						</button>
					) : null}
				</div>
			) : null}
			{readout ? (
				<p className="widget__readout" aria-live={liveReadout ? 'polite' : undefined}>
					{readout}
				</p>
			) : null}
			{caption ? <figcaption className="widget__caption">{caption}</figcaption> : null}
		</figure>
	);
}

interface SliderProps {
	label: string;
	min: number;
	max: number;
	step: number;
	value: number;
	onChange: (value: number) => void;
	format?: (value: number) => string;
}

export function Slider({ label, min, max, step, value, onChange, format = String }: SliderProps) {
	const pct = ((value - min) / (max - min)) * 100;
	return (
		<label className="widget__slider">
			<span>{label}</span>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.currentTarget.value))}
				style={{ '--pct': `${pct}%` } as CSSProperties}
			/>
			<output>{format(value)}</output>
		</label>
	);
}
