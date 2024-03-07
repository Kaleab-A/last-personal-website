import React from "react";
import { CSSProperties } from "react";

// Each Tag component
const Tag = (props: {
	tag: string;
	selected: boolean;
	handleTagClick: (tag: string) => void;
}) => {
	const [selected, setSelected] = React.useState(props.selected);

	// Styling
	const tagStyle: CSSProperties = {
		border: "1px solid black",
		margin: "5px",
		padding: "5px",
		backgroundColor: selected ? "lightblue" : "white",
	};

	return (
		<div
			className="container"
			id={props.tag}
			style={tagStyle}
			onClick={() => {
				setSelected(!selected);
				props.handleTagClick(props.tag);
			}}
		>
			<p>{props.tag}</p>
		</div>
	);
};

export default Tag;
