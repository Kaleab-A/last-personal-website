import { useEffect, useRef } from 'react';

interface Props {
	open: boolean;
	count: number;
	onClose: () => void;
}

/** The "?" cheat sheet: a native <dialog>, so Esc and focus trapping come free. */
export default function ShortcutHelp({ open, count, onClose }: Props) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	}, [open]);

	return (
		<dialog
			ref={ref}
			className="stack-help"
			aria-labelledby="stack-help-title"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose(); // click on the backdrop
			}}
		>
			<h2 id="stack-help-title" className="label">
				keyboard
			</h2>
			<dl>
				<dt>
					<kbd>1</kbd>–<kbd>{count}</kbd>
				</dt>
				<dd>jump to a page</dd>
				<dt>
					<kbd>←</kbd> <kbd>→</kbd>
				</dt>
				<dd>flip to the previous / next page</dd>
				<dt>
					<kbd>?</kbd>
				</dt>
				<dd>show this again</dd>
				<dt>
					<kbd>Esc</kbd>
				</dt>
				<dd>close</dd>
			</dl>
			<p className="muted">On a phone, swipe sideways to flip pages.</p>
			<form method="dialog">
				<button className="btn" type="submit">
					got it
				</button>
			</form>
		</dialog>
	);
}
