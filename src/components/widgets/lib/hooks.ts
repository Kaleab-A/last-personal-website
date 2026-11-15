import { useEffect, useRef, useState, type RefObject } from 'react';

/** Calls `callback(dt)` every animation frame while `running` (dt in seconds, capped). */
export function useAnimationFrame(callback: (dt: number) => void, running: boolean): void {
	const saved = useRef(callback);
	useEffect(() => {
		saved.current = callback;
	});
	useEffect(() => {
		if (!running) return;
		let id = 0;
		let last = performance.now();
		const loop = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			saved.current(dt);
			id = requestAnimationFrame(loop);
		};
		id = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(id);
	}, [running]);
}

/** True when the visitor asked for less motion. */
export function useReducedMotion(): boolean {
	const [reduce, setReduce] = useState(false);
	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		setReduce(query.matches);
		const onChange = () => setReduce(query.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}, []);
	return reduce;
}

/** True while the element is on screen, so animations can pause off screen. */
export function useInView(ref: RefObject<Element | null>): boolean {
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting));
		observer.observe(el);
		return () => observer.disconnect();
	}, [ref]);
	return inView;
}

/** Client coordinates → SVG user coordinates (handles any CSS scaling). */
export function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
	const matrix = svg.getScreenCTM();
	if (!matrix) return { x: 0, y: 0 };
	const p = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
	return { x: p.x, y: p.y };
}
