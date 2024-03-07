import Project from "./Project";
import Tags from "./Tags";
import { CSSProperties } from "react";
import content from "../content.json";

const Projects = () => {
	// Styling
	const projectStyle: CSSProperties = {
		display: "flex",
		justifyContent: "space-around",
		flexDirection: "row",
		flexWrap: "wrap",
		width: "100%",
	};

	return (
		<div className="container">
			<h2>{content["Fun Projects!!"].Title}</h2>
			<h4>{content["Fun Projects!!"].Subtitle}</h4>
			<Tags />
			<div style={projectStyle}>
				{content["Fun Projects!!"].Projects.map((project, index) => (
					<Project key={index} project={project} />
				))}
			</div>
		</div>
	);
};

export default Projects;
