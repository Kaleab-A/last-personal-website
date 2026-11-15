import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export interface SheetMeta {
	id: string;
	label: string;
	/** Standalone page for this sheet's content, linked from its header. */
	href?: string;
}

interface Props {
	meta: SheetMeta;
	index: number;
	/** 0 = front of the pile. */
	depth: number;
	takeFocus: boolean;
	onFocusTaken: () => void;
	onActivate: (index: number, fromKeyboard?: boolean) => void;
	children?: ReactNode;
}

/** Small fixed tilts so the mobile pile looks hand-stacked, not generated. */
const TILTS = [-0.6, 0.45, -0.3, 0.7, -0.45, 0.3];

export default function Sheet({ meta, index, depth, takeFocus, onFocusTaken, onActivate, children }: Props) {
	const isFront = depth === 0;
	const titleRef = useRef<HTMLHeadingElement>(null);
	const titleId = `sheet-${meta.id}`;

	// After a keyboard user brings this sheet forward, move focus into it.
	useEffect(() => {
		if (takeFocus && isFront) {
			titleRef.current?.focus({ preventScroll: true });
			onFocusTaken();
		}
	}, [takeFocus, isFront, onFocusTaken]);

	const style = {
		'--o': depth,
		'--i': index,
		'--tilt': TILTS[index % TILTS.length],
	} as CSSProperties;

	return (
		<section
			className="sheet"
			data-front={isFront || undefined}
			style={style}
			aria-labelledby={titleId}
			onClick={isFront ? undefined : () => onActivate(index)}
		>
			<header className="sheet__head">
				<span className="sheet__num" aria-hidden="true">
					{String(index + 1).padStart(2, '0')}
				</span>
				<h2 className="sheet__title" id={titleId} ref={titleRef} tabIndex={-1}>
					{isFront ? (
						meta.label
					) : (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								// detail === 0 means Enter/Space rather than a pointer click.
								onActivate(index, e.detail === 0);
							}}
						>
							<span className="visually-hidden">Bring to front: </span>
							{meta.label}
						</button>
					)}
				</h2>
				{isFront && meta.href ? (
					<a className="sheet__open" href={meta.href}>
						open page →
					</a>
				) : null}
			</header>
			{/* Sheets behind the front one can't be tabbed into or clicked inside. */}
			<div className="sheet__body" inert={!isFront}>
				{children}
			</div>
		</section>
	);
}
