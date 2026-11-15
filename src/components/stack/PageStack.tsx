import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
} from 'react';
import Sheet, { type SheetMeta } from './Sheet';
import ShortcutHelp from './ShortcutHelp';
import { bringToFront, frontIndex, initialOrder } from './order';
import './stack.css';
import './tabs.css';

export type { SheetMeta };

interface Props {
	sheets: SheetMeta[];
	/** Each sheet's content arrives as an Astro named slot: <div slot="intro">. */
	[slot: string]: unknown;
}

/** Below this the stack turns into a swipeable deck (see tabs.css). */
const DECK_QUERY = '(max-width: 639px), (max-height: 519px)';

const isTyping = (el: EventTarget | null) =>
	el instanceof HTMLElement && !!el.closest('input, textarea, select, [contenteditable="true"]');

/**
 * The overlapping pages on the home page, with a folder tab per page.
 * Content is static HTML rendered by Astro; this island only decides which
 * sheet is on top.
 *
 * Keys: 1–9 jump to a page, ←/→ flip through, ? shows the cheat sheet.
 * The front page is mirrored in the URL hash (/#projects), so it can be linked.
 */
export default function PageStack({ sheets, ...slots }: Props) {
	const [order, setOrder] = useState(() => initialOrder(sheets.length));
	const [helpOpen, setHelpOpen] = useState(false);
	const stackRef = useRef<HTMLDivElement>(null);
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const front = frontIndex(order);
	const count = sheets.length;

	const activate = useCallback(
		(index: number, { focusTab = false } = {}) => {
			const sheet = sheets[index];
			if (!sheet) return;
			setOrder((current) => bringToFront(current, index));
			if (focusTab) tabRefs.current[index]?.focus();
			tabRefs.current[index]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });

			// Mirror the front page in the URL (the first page means "no hash").
			const target = index === 0 ? location.pathname + location.search : `#${sheet.id}`;
			history.replaceState(history.state, '', target);

			if (window.matchMedia(DECK_QUERY).matches) {
				const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				const top = stackRef.current?.getBoundingClientRect().top ?? 0;
				if (top < 0) stackRef.current?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
			}
		},
		[sheets],
	);

	const step = useCallback(
		(delta: number, options?: { focusTab?: boolean }) => activate((front + delta + count) % count, options),
		[activate, front, count],
	);

	// Open the page named in the hash (/#projects), on load and on hash changes.
	useEffect(() => {
		const fromHash = () => {
			const id = decodeURIComponent(location.hash.slice(1));
			const index = sheets.findIndex((s) => s.id === id);
			if (index >= 0) setOrder((current) => bringToFront(current, index));
		};
		fromHash();
		window.addEventListener('hashchange', fromHash);
		return () => window.removeEventListener('hashchange', fromHash);
	}, [sheets]);

	// Page-wide shortcuts.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			// The island may outlive its page under client-side navigation.
			if (!stackRef.current?.isConnected) return window.removeEventListener('keydown', onKey);
			if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
			const inside = (selector: string) => e.target instanceof HTMLElement && !!e.target.closest(selector);
			if (inside('dialog')) return;

			if (/^[1-9]$/.test(e.key) && Number(e.key) <= count) {
				e.preventDefault();
				activate(Number(e.key) - 1, { focusTab: inside('[role="tablist"]') });
			} else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !inside('[role="tablist"]')) {
				// (inside the tab row, arrows are handled by onTabKeyDown)
				e.preventDefault();
				step(e.key === 'ArrowRight' ? 1 : -1);
			} else if (e.key === '?') {
				e.preventDefault();
				setHelpOpen((open) => !open);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [activate, step, count]);

	// Arrow keys inside the tab row, per the WAI-ARIA tabs pattern.
	const onTabKeyDown = (e: ReactKeyboardEvent, index: number) => {
		const keys: Record<string, number> = {
			ArrowRight: (index + 1) % count,
			ArrowLeft: (index - 1 + count) % count,
			Home: 0,
			End: count - 1,
		};
		const next = keys[e.key];
		if (next === undefined) return;
		e.preventDefault();
		activate(next, { focusTab: true });
	};

	return (
		<div ref={stackRef} className="stack stack--tabs" style={{ '--n': count } as CSSProperties}>
			<div className="stack__tabs" role="tablist" aria-label="Pages">
				{sheets.map((meta, i) => (
					<button
						key={meta.id}
						ref={(el) => {
							tabRefs.current[i] = el;
						}}
						type="button"
						role="tab"
						id={`tab-${meta.id}`}
						className="stack__tab"
						aria-selected={i === front}
						aria-controls={`panel-${meta.id}`}
						tabIndex={i === front ? 0 : -1}
						style={{ '--i': i, '--o': order[i] ?? i } as CSSProperties}
						onClick={() => activate(i)}
						onKeyDown={(e) => onTabKeyDown(e, i)}
					>
						<span className="stack__tab-num" aria-hidden="true">
							{String(i + 1).padStart(2, '0')}
						</span>
						<span className="stack__tab-label">{meta.label}</span>
					</button>
				))}
			</div>

			{sheets.map((meta, i) => (
				<Sheet
					key={meta.id}
					meta={meta}
					index={i}
					depth={order[i] ?? i}
					onActivate={activate}
					onSwipe={(dir) => step(dir)}
				>
					{slots[meta.id] as ReactNode}
				</Sheet>
			))}

			<button
				type="button"
				className="stack__help-btn"
				aria-label="Keyboard shortcuts"
				aria-haspopup="dialog"
				onClick={() => setHelpOpen(true)}
			>
				?
			</button>
			<ShortcutHelp open={helpOpen} count={count} onClose={() => setHelpOpen(false)} />
		</div>
	);
}
