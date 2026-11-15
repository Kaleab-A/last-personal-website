import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './radio.css';

export interface Track {
	title: string;
	/** Already base-prefixed URLs; the browser picks the first it can play. */
	sources: string[];
}

const MIME: Record<string, string> = {
	ogg: 'audio/ogg',
	oga: 'audio/ogg',
	opus: 'audio/ogg; codecs=opus',
	mp3: 'audio/mpeg',
	m4a: 'audio/mp4',
	aac: 'audio/aac',
	wav: 'audio/wav',
};
const mimeOf = (src: string) => MIME[src.split('.').pop()?.toLowerCase() ?? ''];

const clock = (seconds: number) => {
	if (!Number.isFinite(seconds)) return '0:00';
	const s = Math.floor(seconds);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/**
 * The little radio in the corner. Never autoplays. Persisted across page
 * navigations (transition:persist in BaseLayout), so music keeps going.
 */
export default function MusicWidget({ tracks }: { tracks: Track[] }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [current, setCurrent] = useState(0);
	const [duration, setDuration] = useState(0);
	const [failed, setFailed] = useState(false);
	const wantsPlay = useRef(false);

	// Switching tracks: load the new sources, keep playing if we were.
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		audio.load();
		setCurrent(0);
		setDuration(0);
		setFailed(false);
		if (wantsPlay.current) audio.play().catch(() => setFailed(true));
	}, [index]);

	if (tracks.length === 0) return null;
	const track = tracks[index % tracks.length]!;
	const many = tracks.length > 1;

	const toggle = () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) {
			wantsPlay.current = true;
			audio.play().catch(() => setFailed(true));
		} else {
			wantsPlay.current = false;
			audio.pause();
		}
	};

	const next = () => setIndex((i) => (i + 1) % tracks.length);

	return (
		<aside className="radio" aria-label="Music player" data-playing={playing || undefined}>
			<audio
				ref={audioRef}
				preload="none"
				loop={!many}
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
				onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
				onEnded={next}
				onError={() => setFailed(true)}
			>
				{track.sources.map((src) => (
					<source key={src} src={src} type={mimeOf(src)} />
				))}
			</audio>

			<button type="button" className="radio__play" onClick={toggle} aria-label={playing ? 'Pause music' : 'Play music'}>
				<span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
			</button>

			<div className="radio__info">
				<span className="radio__label">
					radio
					<span className="radio__eq" aria-hidden="true">
						<i />
						<i />
						<i />
					</span>
				</span>
				<span className="radio__title" title={track.title}>
					{failed ? "can't play this here" : track.title}
				</span>
				<input
					className="radio__seek"
					type="range"
					min={0}
					max={duration || 0}
					step="any"
					value={current}
					disabled={!duration}
					aria-label="Seek"
					aria-valuetext={`${clock(current)} of ${clock(duration)}`}
					onChange={(e) => {
						const audio = audioRef.current;
						if (audio) audio.currentTime = Number(e.currentTarget.value);
					}}
					style={{ '--pct': duration ? `${(current / duration) * 100}%` : '0%' } as CSSProperties}
				/>
			</div>

			<span className="radio__time" aria-hidden="true">
				{clock(current)}
			</span>

			{many ? (
				<button type="button" className="radio__next" onClick={next} aria-label="Next track">
					<span aria-hidden="true">»</span>
				</button>
			) : null}
		</aside>
	);
}
