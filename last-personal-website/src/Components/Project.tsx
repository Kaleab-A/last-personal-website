import { CSSProperties } from "react";

type ProjectProps = {
	project: {
		Title: string;
		Description: string;
		Skills: string[];
		Github: string;
		Demo: string;
		default: boolean;
	};
};

const Project = (project: ProjectProps) => {
	// Styling
	const projectStyle: CSSProperties = {
		width: "40%",
		border: "1px solid black",
		margin: "20px 0",
		height: "150px",
	};

	return (
		<div style={projectStyle}>
			<h3>{project.project.Title}</h3>
			<p>{project.project.Description}</p>
			<p>{project.project.Skills.join(", ")}</p>
			<a href={project.project.Github}>Github</a>
			<a href={project.project.Demo}>Demo</a>
		</div>
	);
};

export default Project;
