import React, { useEffect } from "react";
import { CSSProperties } from "react";

// Each Tag component
const Tag = (props: { tag: string; selected: boolean }) => {
	const [selected, setSelected] = React.useState(props.selected);

	useEffect(() => {
		const handleClick = () => {
			console.log("clicked");
			setSelected(!selected);
		};

		document.getElementById(props.tag)?.addEventListener("click", handleClick);
	}, [selected]);

	// Styling
	const tagStyle: CSSProperties = {
		border: "1px solid black",
		margin: "5px",
		padding: "5px",
		backgroundColor: selected ? "lightblue" : "white",
	};

	return (
		<div className="container" id={props.tag} style={tagStyle}>
			<p>{props.tag}</p>
		</div>
	);
};

export default Tag;
