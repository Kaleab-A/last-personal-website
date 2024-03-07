import "./style.css";
import ReactAudioPlayer from "react-audio-player";

const Musica = () => {
	return (
		<div className="musica">
			<ReactAudioPlayer
				src="partridgeGetsLucky.ogg"
				style={{
					width: "100%",
					height: "100%",
				}}
				controls
				loop
			/>
			{/* Maybe remove autoplay */}
		</div>
	);
};

export default Musica;
