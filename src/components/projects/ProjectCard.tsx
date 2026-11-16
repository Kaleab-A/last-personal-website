import type { ProjectView } from '../../lib/content';
import './projects.css';

const STATUS: Record<ProjectView['status'], string | null> = {
	done: null,
	'in-progress': 'in progress',
	idea: 'idea',
};

interface Props {
	project: ProjectView;
	/** Also show the detail bullets (on /projects; the home page keeps cards short). */
	full?: boolean;
}

/** One project. Rendered statically by Astro and inside the ProjectFilter island. */
export default function ProjectCard({ project, full = false }: Props) {
	const status = STATUS[project.status];
	const meta = [project.year, project.note ?? status, project.draft ? 'draft' : null].filter(Boolean);
	return (
		<article className="project-card">
			<div className="project-card__inner">
				{project.image ? (
					<img className="project-card__img" src={project.image} alt="" loading="lazy" decoding="async" />
				) : null}
				<div className="project-card__body">
					<h3 className="project-card__title">{project.title}</h3>
					{meta.length > 0 ? <p className="project-card__meta label">{meta.join(' · ')}</p> : null}
					<p className="project-card__summary">{project.summary}</p>
					{full && project.details.length > 0 ? (
						<ul className="project-card__details">
							{project.details.map((detail) => (
								<li key={detail}>{detail}</li>
							))}
						</ul>
					) : null}
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
