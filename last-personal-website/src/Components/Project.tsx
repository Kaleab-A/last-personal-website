import { CSSProperties } from "react";
import "./style.css";

type ProjectProps = {
	project: {
		Title: string;
		Description: string;
		Skills: string[];
		Github: string;
		Demo: string;
		default: boolean;
		imageURL: string;
	};
};

const Project = (project: ProjectProps) => {
	// Styling
	const projectStyle: CSSProperties = {
		width: "45%",
		border: "1px solid black",
		borderRadius: "20px",
		margin: "10px 0",
		overflow: "hidden",
	};

	const imgStyle: CSSProperties = {
		maxWidth: "35%",
		maxHeight: "100%",
		objectFit: "cover",
	};

	const projectContentStyle: CSSProperties = {
		margin: "10px",
	};

	const titleStyle: CSSProperties = {
		fontSize: "1.5em",
		fontWeight: "bold",
		marginBottom: "10px",
	};

	const textStyles: CSSProperties = {
		fontSize: "1em",
		marginBottom: "10px",
	};

	return (
		<div style={projectStyle} className="projectContainer">
			<img src={project.project.imageURL} alt="project" style={imgStyle} />
			<div style={projectContentStyle}>
				<h3 style={titleStyle}>{project.project.Title}</h3>
				<p style={textStyles}>{project.project.Description}</p>
				<div className="cardFooter">
					<a href={project.project.Github}>Github</a>
					<a href={project.project.Demo}>Video Demo</a>
				</div>
			</div>
		</div>
	);
};

export default Project;
