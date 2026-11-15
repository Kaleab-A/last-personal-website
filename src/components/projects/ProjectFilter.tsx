import { useMemo, useState } from 'react';
import type { ProjectView } from '../../lib/content';
import ProjectCard from './ProjectCard';
import TagChip from './TagChip';

/**
 * Skill filter for the projects page. No skills selected → every project.
 * One or more selected → projects that use any of them.
 */
export default function ProjectFilter({ projects }: { projects: ProjectView[] }) {
	const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

	// Most-used skills first, then alphabetical.
	const skills = useMemo(() => {
		const counts = new Map<string, number>();
		for (const project of projects) {
			for (const skill of project.skills) counts.set(skill, (counts.get(skill) ?? 0) + 1);
		}
		return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
	}, [projects]);

	const toggle = (skill: string) =>
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(skill)) next.delete(skill);
			else next.add(skill);
			return next;
		});

	const visible =
		selected.size === 0 ? projects : projects.filter((p) => p.skills.some((s) => selected.has(s)));

	return (
		<div className="project-filter">
			<div className="chip-row" role="group" aria-label="Filter projects by skill">
				{skills.map(([skill, count]) => (
					<TagChip
						key={skill}
						label={skill}
						count={count}
						pressed={selected.has(skill)}
						onToggle={() => toggle(skill)}
					/>
				))}
				{selected.size > 0 ? (
					<button type="button" className="chip chip--clear" onClick={() => setSelected(new Set())}>
						clear ×
					</button>
				) : null}
			</div>
			<p className="label muted" aria-live="polite">
				Showing {visible.length} of {projects.length}
			</p>
			<div className="project-grid">
				{visible.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</div>
		</div>
	);
}
