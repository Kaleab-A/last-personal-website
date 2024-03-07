import { CSSProperties } from "react";
import content from "../content.json";

const FrontPage = () => {
	// Styling
	const containerStyle: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	};

	const imgStyle: CSSProperties = {
		width: "22%",
		marginTop: "30px",
		marginBottom: "50px",
	};

	const h1Style: CSSProperties = {
		fontSize: "55px",
		marginTop: "70px",
		marginBottom: "15px",
	};

	const pStyle: CSSProperties = {
		fontSize: "20px",
	};

	return (
		<div style={containerStyle}>
			<h2>{content.FrontPage.Title}</h2>
			<h1 style={h1Style}>{content.FrontPage.Text}</h1>
			<img
				src={content.FrontPage.Image}
				alt="front page intro"
				style={imgStyle}
			/>
			<p style={pStyle}>{content.FrontPage.Message}</p>
		</div>
	);
};

export default FrontPage;
