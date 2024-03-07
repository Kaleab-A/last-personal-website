import content from "../content.json";
import { useEffect } from "react";
import { CSSProperties } from "react";
import Tag from "./Tag";

const Tags = () => {
	const tagFreq: { [key: string]: number } = {};
	const toDisplay = [];

	// Styling
	const tagsStyle: CSSProperties = {
		display: "flex",
		justifyContent: "flex-start",
		width: "100%",
		flexWrap: "wrap",
	};

	for (let project of content["Fun Projects!!"].Projects) {
		for (let tag of project.Skills) {
			if (tagFreq[tag]) {
				tagFreq[tag] += 1;
			} else {
				tagFreq[tag] = 1;
			}
		}
	}

	for (let tag in tagFreq) {
		toDisplay.push({ tag, freq: tagFreq[tag] });
	}

	return (
		<div style={tagsStyle}>
			{Object.keys(tagFreq).map((tag, index) => (
				<Tag key={index} tag={tag} selected={false} />
			))}
		</div>
	);
};

export default Tags;
