import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactNode,
} from 'react';
import Sheet, { type Offset, type SheetMeta } from './Sheet';
import ShortcutHelp from './ShortcutHelp';
import Tab from './Tab';
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
/** Dragged positions survive reloads within the tab, not forever. */
const STORAGE_KEY = 'stack-offsets';
const NO_OFFSET: Offset = { x: 0, y: 0 };

const isTyping = (el: EventTarget | null) =>
	el instanceof HTMLElement && !!el.closest('input, textarea, select, [contenteditable="true"]');

/**
 * The overlapping pages on the home page, with a folder tab per page.
 * Content is static HTML rendered by Astro; this island decides which sheet is
 * on top and (on desktop) where each sheet has been dragged to.
 *
 * Keys: 1–9 jump to a page, ←/→ flip through, ? shows the cheat sheet.
 * The front page is mirrored in the URL hash (/#projects), so it can be linked.
 * With a mouse, dragging a tab moves its sheet; "tidy up" puts them back.
 */
export default function PageStack({ sheets, ...slots }: Props) {
	const [order, setOrder] = useState(() => initialOrder(sheets.length));
	const [offsets, setOffsets] = useState<Record<string, Offset>>({});
	const [lifted, setLifted] = useState<string | null>(null);
	const [helpOpen, setHelpOpen] = useState(false);
	const stackRef = useRef<HTMLDivElement>(null);
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const restored = useRef(false);
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

	// Keep a dragged sheet within reach of the stack area.
	const move = useCallback((id: string, { x, y }: Offset) => {
		const rect = stackRef.current?.getBoundingClientRect();
		const maxX = rect ? rect.width * 0.45 : Infinity;
		const maxY = rect ? rect.height * 0.45 : Infinity;
		const clamp = (v: number, max: number) => Math.round(Math.max(-max, Math.min(max, v)));
		setOffsets((prev) => ({ ...prev, [id]: { x: clamp(x, maxX), y: clamp(y, maxY) } }));
	}, []);

	const messy = Object.values(offsets).some((o) => o.x !== 0 || o.y !== 0);

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
	const onTabKeyDown = useCallback(
		(e: ReactKeyboardEvent, index: number) => {
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
		},
		[activate, count],
	);

	const select = useCallback((index: number) => activate(index), [activate]);

	return (
		<div ref={stackRef} className="stack stack--tabs" style={{ '--n': count } as CSSProperties}>
			<div className="stack__tabs" role="tablist" aria-label="Pages">
				{sheets.map((meta, i) => (
					<Tab
						key={meta.id}
						ref={(el) => {
							tabRefs.current[i] = el;
						}}
						meta={meta}
						index={i}
						depth={order[i] ?? i}
						selected={i === front}
						offset={offsets[meta.id] ?? NO_OFFSET}
						lifted={lifted === meta.id}
						onActivate={select}
						onKeyDown={onTabKeyDown}
						onMove={move}
						onLift={setLifted}
					/>
				))}
			</div>

			{sheets.map((meta, i) => (
				<Sheet
					key={meta.id}
					meta={meta}
					index={i}
					depth={order[i] ?? i}
					offset={offsets[meta.id] ?? NO_OFFSET}
					lifted={lifted === meta.id}
					onActivate={select}
					onSwipe={(dir) => step(dir)}
				>
					{slots[meta.id] as ReactNode}
				</Sheet>
			))}

			{messy ? (
				<button type="button" className="btn stack__tidy" onClick={() => setOffsets({})}>
					tidy up
				</button>
			) : null}
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
