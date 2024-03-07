import content from "../content.json";
import { CSSProperties } from "react";
import Tag from "./Tag";

const Tags = (props: {
	tagFreq: { [key: string]: { frequency: number; selected: boolean } };
	handleTagClick: (tag: string) => void;
}) => {
	// Styling
	const tagsStyle: CSSProperties = {
		display: "flex",
		justifyContent: "flex-start",
		width: "100%",
		flexWrap: "wrap",
	};

	return (
		<div style={tagsStyle}>
			{Object.keys(props.tagFreq).map((tag, index) => (
				<Tag
					key={index}
					tag={tag}
					selected={props.tagFreq[tag].selected}
					handleTagClick={props.handleTagClick}
				/>
			))}
		</div>
	);
};

export default Tags;
