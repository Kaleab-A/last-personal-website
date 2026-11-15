import type { ProjectView } from '../../lib/content';
import './projects.css';

const STATUS: Record<ProjectView['status'], string | null> = {
	done: null,
	'in-progress': 'in progress',
	idea: 'idea',
};

/** One project. Rendered statically by Astro and inside the ProjectFilter island. */
export default function ProjectCard({ project }: { project: ProjectView }) {
	const status = STATUS[project.status];
	return (
		<article className="project-card">
			<div className="project-card__inner">
				{project.image ? (
					<img className="project-card__img" src={project.image} alt="" loading="lazy" decoding="async" />
				) : null}
				<div className="project-card__body">
					<h3 className="project-card__title">{project.title}</h3>
					<p className="project-card__meta label">
						{project.year}
						{status ? ` · ${status}` : ''}
						{project.draft ? ' · draft' : ''}
					</p>
					<p className="project-card__summary">{project.summary}</p>
					{project.skills.length > 0 ? (
						<ul className="project-card__skills" aria-label="Skills">
							{project.skills.map((skill) => (
								<li key={skill}>{skill}</li>
							))}
						</ul>
					) : null}
					{project.links.length > 0 ? (
						<p className="project-card__links">
							{project.links.map((link) => (
								<a key={link.label} href={link.href}>
									{link.label}
								</a>
							))}
						</p>
					) : null}
				</div>
			</div>
		</article>
	);
}
