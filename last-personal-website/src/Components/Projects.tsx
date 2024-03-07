import Project from "./Project";
import Tags from "./Tags";
import { CSSProperties, useEffect } from "react";
import content from "../content.json";
import { useState } from "react";

const Projects = () => {
	const [tagsDetail, setTagsDetail] = useState<{
		[key: string]: {
			frequency: number;
			selected: boolean;
		};
	}>({});

	useEffect(() => {
		const newTagsDetail = { ...tagsDetail };
		for (let project of content["Fun Projects!!"].Projects) {
			for (let tag of project.Skills) {
				if (tagsDetail[tag]) {
					newTagsDetail[tag].frequency += 1;
				} else {
					newTagsDetail[tag] = { frequency: 1, selected: false };
				}
			}
		}

		setTagsDetail(newTagsDetail);
	}, []);

	const handleTagClick = (tag: string) => {
		const newTagsDetail = { ...tagsDetail };
		newTagsDetail[tag].selected = !newTagsDetail[tag].selected;
		setTagsDetail(newTagsDetail);
	};

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

			<Tags tagFreq={tagsDetail} handleTagClick={handleTagClick} />

			<div style={projectStyle}>
				{content["Fun Projects!!"].Projects.map((project, index) =>
					project.Skills.some((skill) => tagsDetail[skill]?.selected) ? (
						<Project key={index} project={project} />
					) : null
				)}
				{
					// If all tags are unselected, show one's with default tag true
					!Object.keys(tagsDetail).some((tag) => tagsDetail[tag].selected)
						? content["Fun Projects!!"].Projects.map((project, index) =>
								project.default ? (
									<Project key={index} project={project} />
								) : null
						  )
						: null
				}
			</div>
		</div>
	);
};

export default Projects;
