import {
	forwardRef,
	useRef,
	type CSSProperties,
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
} from 'react';
import type { Offset, SheetMeta } from './Sheet';

interface Props {
	meta: SheetMeta;
	index: number;
	/** 0 = front of the pile. */
	depth: number;
	selected: boolean;
	/** How far this tab's sheet has been dragged from its place in the stack. */
	offset: Offset;
	lifted: boolean;
	onActivate: (index: number) => void;
	onKeyDown: (e: KeyboardEvent, index: number) => void;
	/** Drag (desktop, mouse/pen): the tab is the handle that carries its sheet. */
	onMove: (id: string, offset: Offset) => void;
	onLift: (id: string | null) => void;
}

/** Dragging is for mice and pens on screens big enough to show the stack. */
const DRAG_QUERY = '(min-width: 640px) and (min-height: 520px) and (pointer: fine)';

/** A folder tab on a sheet's top edge. Click it to bring the sheet forward, or drag it to move the sheet. */
const Tab = forwardRef<HTMLButtonElement, Props>(function Tab(
	{ meta, index, depth, selected, offset, lifted, onActivate, onKeyDown, onMove, onLift },
	ref,
) {
	const drag = useRef<{ id: number; px: number; py: number; ox: number; oy: number; moved: boolean } | null>(null);
	const swallowClick = useRef(false);

	const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
		if (e.button !== 0 || e.pointerType === 'touch') return;
		if (!window.matchMedia(DRAG_QUERY).matches) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		drag.current = { id: e.pointerId, px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y, moved: false };
		e.currentTarget.setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		const dx = e.clientX - d.px;
		const dy = e.clientY - d.py;
		if (!d.moved) {
			if (Math.hypot(dx, dy) < 4) return; // a click, not a drag (yet)
			d.moved = true;
			onLift(meta.id);
			onActivate(index); // picking a sheet up puts it on top
		}
		onMove(meta.id, { x: d.ox + dx, y: d.oy + dy });
	};
	const onPointerEnd = (e: PointerEvent<HTMLButtonElement>) => {
		const d = drag.current;
		if (!d || d.id !== e.pointerId) return;
		drag.current = null;
		if (d.moved) {
			swallowClick.current = true; // the click that ends a drag isn't a click
			onLift(null);
		}
	};
	const onClick = (e: MouseEvent) => {
		if (swallowClick.current) {
			swallowClick.current = false;
			e.preventDefault();
			return;
		}
		onActivate(index);
	};

	const style = {
		'--i': index,
		'--o': depth,
		'--x': `${offset.x}px`,
		'--y': `${offset.y}px`,
	} as CSSProperties;

	return (
		<button
			ref={ref}
			type="button"
			role="tab"
			id={`tab-${meta.id}`}
			className="stack__tab"
			aria-selected={selected}
			aria-controls={`panel-${meta.id}`}
			tabIndex={selected ? 0 : -1}
			data-lifted={lifted || undefined}
			style={style}
			onClick={onClick}
			onKeyDown={(e) => onKeyDown(e, index)}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerEnd}
			onPointerCancel={onPointerEnd}
		>
			<span className="stack__tab-num" aria-hidden="true">
				{String(index + 1).padStart(2, '0')}
			</span>
			<span className="stack__tab-label">{meta.label}</span>
		</button>
	);
});

export default Tab;
