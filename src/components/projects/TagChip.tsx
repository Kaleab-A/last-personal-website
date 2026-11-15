interface Props {
	label: string;
	count: number;
	pressed: boolean;
	onToggle: () => void;
}

/** A toggle button for one skill. Fully controlled by its parent. */
export default function TagChip({ label, count, pressed, onToggle }: Props) {
	return (
		<button type="button" className="chip" aria-pressed={pressed} onClick={onToggle}>
			{label}
			<span className="chip__count" aria-label={`${count} projects`}>
				{count}
			</span>
		</button>
	);
}
