import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

export interface SheetMeta {
	id: string;
	label: string;
	/** Standalone page for this sheet's content, linked from its corner. */
	href?: string;
}

interface Props {
	meta: SheetMeta;
	index: number;
	/** 0 = front of the pile. */
	depth: number;
	onActivate: (index: number) => void;
	/** Phone deck only: +1 = swiped to the next page, -1 = previous. */
	onSwipe: (direction: 1 | -1) => void;
	children?: ReactNode;
}

/** How far (px) a swipe has to travel before it flips the page. */
const SWIPE_THRESHOLD = 70;
const DECK_QUERY = '(max-width: 639px), (max-height: 519px)';

export default function Sheet({ meta, index, depth, onActivate, onSwipe, children }: Props) {
	const isFront = depth === 0;
	const [dragX, setDragX] = useState(0);
	const start = useRef<{ x: number; y: number; id: number; horizontal?: boolean } | null>(null);

	// Swipe left/right on the front page (touch only, phone deck only).
	const onPointerDown = (e: PointerEvent) => {
		if (!isFront || e.pointerType === 'mouse' || !window.matchMedia(DECK_QUERY).matches) return;
		start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
	};
	const onPointerMove = (e: PointerEvent) => {
		const s = start.current;
		if (!s || s.id !== e.pointerId) return;
		const dx = e.clientX - s.x;
		const dy = e.clientY - s.y;
		if (s.horizontal === undefined && Math.hypot(dx, dy) > 10) s.horizontal = Math.abs(dx) > Math.abs(dy);
		if (s.horizontal) setDragX(dx);
	};
	const onPointerEnd = (e: PointerEvent) => {
		const s = start.current;
		if (!s || s.id !== e.pointerId) return;
		start.current = null;
		const dx = e.clientX - s.x;
		setDragX(0);
		if (s.horizontal && Math.abs(dx) > SWIPE_THRESHOLD) onSwipe(dx < 0 ? 1 : -1);
	};

	const style = {
		'--o': depth,
		'--i': index,
		'--drag': `${dragX}px`,
	} as CSSProperties;

	return (
		<section
			className="sheet"
			id={`panel-${meta.id}`}
			role="tabpanel"
			aria-labelledby={`tab-${meta.id}`}
			data-front={isFront || undefined}
			data-dragging={dragX !== 0 || undefined}
			style={style}
			onClick={isFront ? undefined : () => onActivate(index)}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerEnd}
			onPointerCancel={onPointerEnd}
		>
			{isFront && meta.href ? (
				<a className="sheet__open" href={meta.href}>
					open page →
				</a>
			) : null}
			{/* Sheets behind the front one can't be tabbed into or clicked inside. */}
			<div className="sheet__body" inert={!isFront}>
				{children}
			</div>
		</section>
	);
}
