import { useCallback, useState, useRef, type CSSProperties, type ReactNode } from 'react';
import Sheet, { type SheetMeta } from './Sheet';
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

/**
 * The overlapping pages on the home page. Content is static HTML rendered by
 * Astro; this island only decides which sheet is on top.
 */
export default function PageStack({ sheets, ...slots }: Props) {
	const [order, setOrder] = useState(() => initialOrder(sheets.length));
	const [focusIndex, setFocusIndex] = useState<number | null>(null);
	const stackRef = useRef<HTMLDivElement>(null);

	const activate = useCallback((index: number, fromKeyboard = false) => {
		setOrder((current) => bringToFront(current, index));
		if (fromKeyboard) setFocusIndex(index);
		if (window.matchMedia(PILE_QUERY).matches) {
			const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			stackRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
		}
	}, []);

	const clearFocus = useCallback(() => setFocusIndex(null), []);

	return (
		<div ref={stackRef} className="stack" style={{ '--n': sheets.length } as CSSProperties}>
			{sheets.map((meta, i) => (
				<Sheet
					key={meta.id}
					meta={meta}
					index={i}
					depth={order[i] ?? i}
					takeFocus={focusIndex === i}
					onFocusTaken={clearFocus}
					onActivate={activate}
				>
					{slots[meta.id] as ReactNode}
				</Sheet>
			))}
		</div>
	);
}
