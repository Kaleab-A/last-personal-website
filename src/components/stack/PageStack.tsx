import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Sheet, { type Offset, type SheetMeta } from './Sheet';
import { bringToFront, initialOrder } from './order';
import './stack.css';

export type { SheetMeta };

interface Props {
	sheets: SheetMeta[];
	/** Each sheet's content arrives as an Astro named slot: <div slot="intro">. */
	[slot: string]: unknown;
}

/** Below this the stack turns into a vertical pile (see stack.css). */
const PILE_QUERY = '(max-width: 639px), (max-height: 519px)';
/** Dragged positions survive reloads within the tab, not forever. */
const STORAGE_KEY = 'stack-offsets';

/**
 * The overlapping pages on the home page. Content is static HTML rendered by
 * Astro; this island decides which sheet is on top, and (on desktop) where
 * each sheet has been dragged to.
 */
export default function PageStack({ sheets, ...slots }: Props) {
	const [order, setOrder] = useState(() => initialOrder(sheets.length));
	const [offsets, setOffsets] = useState<Record<string, Offset>>({});
	const [focusIndex, setFocusIndex] = useState<number | null>(null);
	const stackRef = useRef<HTMLDivElement>(null);
	const restored = useRef(false);

	// Restore dragged positions after hydration (server HTML is always tidy).
	useEffect(() => {
		try {
			const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
			if (saved && typeof saved === 'object') setOffsets(saved);
		} catch {
			/* storage unavailable: start tidy */
		}
		restored.current = true;
	}, []);

	useEffect(() => {
		if (!restored.current) return;
		try {
			if (Object.keys(offsets).length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(offsets));
			else sessionStorage.removeItem(STORAGE_KEY);
		} catch {
			/* ignore */
		}
	}, [offsets]);

	const activate = useCallback((index: number, fromKeyboard = false) => {
		setOrder((current) => bringToFront(current, index));
		if (fromKeyboard) setFocusIndex(index);
		if (window.matchMedia(PILE_QUERY).matches) {
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			stackRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
		}
	}, []);

	// Keep a dragged sheet's header within the stack area.
	const move = useCallback((id: string, { x, y }: Offset) => {
		const rect = stackRef.current?.getBoundingClientRect();
		const maxX = rect ? rect.width * 0.45 : Infinity;
		const maxY = rect ? rect.height * 0.45 : Infinity;
		const clamp = (v: number, max: number) => Math.round(Math.max(-max, Math.min(max, v)));
		setOffsets((prev) => ({ ...prev, [id]: { x: clamp(x, maxX), y: clamp(y, maxY) } }));
	}, []);

	const clearFocus = useCallback(() => setFocusIndex(null), []);
	const messy = Object.values(offsets).some((o) => o.x !== 0 || o.y !== 0);

	return (
		<div ref={stackRef} className="stack" style={{ '--n': sheets.length } as CSSProperties}>
			{sheets.map((meta, i) => (
				<Sheet
					key={meta.id}
					meta={meta}
					index={i}
					depth={order[i] ?? i}
					offset={offsets[meta.id]}
					takeFocus={focusIndex === i}
					onFocusTaken={clearFocus}
					onActivate={activate}
					onMove={move}
				>
					{slots[meta.id] as ReactNode}
				</Sheet>
			))}
			{messy ? (
				<button type="button" className="btn stack__tidy" onClick={() => setOffsets({})}>
					tidy up
				</button>
			) : null}
		</div>
	);
}
