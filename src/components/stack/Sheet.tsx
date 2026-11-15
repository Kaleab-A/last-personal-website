import {
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type MouseEvent,
	type PointerEvent,
	type ReactNode,
} from 'react';

export interface SheetMeta {
	id: string;
	label: string;
	/** Standalone page for this sheet's content, linked from its header. */
	href?: string;
}

export interface Offset {
	x: number;
	y: number;
}

interface Props {
	meta: SheetMeta;
	index: number;
	/** 0 = front of the pile. */
	depth: number;
	/** How far this sheet has been dragged from its place in the stack. */
	offset?: Offset;
	takeFocus: boolean;
	onFocusTaken: () => void;
	onActivate: (index: number, fromKeyboard?: boolean) => void;
	onMove: (id: string, offset: Offset) => void;
	children?: ReactNode;
}

/** Small fixed tilts so the mobile pile looks hand-stacked, not generated. */
const TILTS = [-0.6, 0.45, -0.3, 0.7, -0.45, 0.3];
/** Dragging is for mice and pens on screens big enough to show the stack. */
const DRAG_QUERY = '(min-width: 640px) and (min-height: 520px) and (pointer: fine)';
const NO_OFFSET: Offset = { x: 0, y: 0 };

export default function Sheet({
	meta,
	index,
	depth,
	offset = NO_OFFSET,
	takeFocus,
	onFocusTaken,
	onActivate,
	onMove,
	children,
}: Props) {
	const isFront = depth === 0;
	const titleRef = useRef<HTMLHeadingElement>(null);
	const titleId = `sheet-${meta.id}`;
	const [dragging, setDragging] = useState(false);
	const drag = useRef<{ id: number; px: number; py: number; ox: number; oy: number; moved: boolean } | null>(null);
	const swallowClick = useRef(false);

	// After a keyboard user brings this sheet forward, move focus into it.
	useEffect(() => {
		if (takeFocus && isFront) {
			titleRef.current?.focus({ preventScroll: true });
			onFocusTaken();
		}
	}, [takeFocus, isFront, onFocusTaken]);

	// ---- drag by the header ----
	const onPointerDown = (e: PointerEvent<HTMLElement>) => {
		if (e.button !== 0 || e.pointerType === 'touch') return;
		if (!window.matchMedia(DRAG_QUERY).matches) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (e.target instanceof HTMLElement && e.target.closest('a')) return;
		drag.current = { id: e.pointerId, px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y, moved: false };
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e: PointerEvent<HTMLElement>) => {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		const dx = e.clientX - d.px;
		const dy = e.clientY - d.py;
		if (!d.moved) {
			if (Math.hypot(dx, dy) < 4) return; // a click, not a drag (yet)
			d.moved = true;
			setDragging(true);
			onActivate(index); // picking a sheet up puts it on top
		}
		onMove(meta.id, { x: d.ox + dx, y: d.oy + dy });
	};
	const onPointerEnd = (e: PointerEvent<HTMLElement>) => {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		drag.current = null;
		if (d.moved) {
			swallowClick.current = true; // the click that ends a drag isn't a click
			setDragging(false);
		}
	};
	const onClickCapture = (e: MouseEvent) => {
		if (!swallowClick.current) return;
		swallowClick.current = false;
		e.stopPropagation();
		e.preventDefault();
	};

	const style = {
		'--o': depth,
		'--i': index,
		'--tilt': TILTS[index % TILTS.length],
		'--x': `${offset.x}px`,
		'--y': `${offset.y}px`,
	} as CSSProperties;

	return (
		<section
			className="sheet"
			data-front={isFront || undefined}
			data-dragging={dragging || undefined}
			style={style}
			aria-labelledby={titleId}
			onClick={isFront ? undefined : () => onActivate(index)}
			onClickCapture={onClickCapture}
		>
			<header
				className="sheet__head"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerEnd}
				onPointerCancel={onPointerEnd}
			>
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
