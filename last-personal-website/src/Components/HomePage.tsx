import Page from "./Page";
import Musica from "./Musica";
import { useState } from "react";
import FrontPage from "./FrontPage";

const HomePage = () => {
	const totalPages = 4; // UPDATE WHENEVER
	const pageToRender = [<FrontPage />];

	const [order, setOrder] = useState(Array.from(Array(totalPages).keys()));

	const handlePageClick = (pageOrder: number) => {
		const newOrder = [...order];

		// ---------- Swiching page Option 1
		// const indexZero = newOrder.indexOf(0);
		// const indexPage = newOrder.indexOf(page);

		// newOrder[indexZero] = page;
		// newOrder[indexPage] = 0;

		// ---------- Swiching page Option 2
		newOrder.forEach((value, index) => {
			if (order[index] < pageOrder) {
				newOrder[index] = value + 1;
				console.log("Changed", "index", index, "value", value);
			} else if (order[index] === pageOrder) {
				newOrder[index] = 0;
			}
		});

		setOrder(newOrder);
	};

	return (
		<>
			{Array.from(Array(totalPages).keys()).map((i) => (
				<Page
					key={i}
					value={i}
					order={order[i]}
					totalPages={totalPages}
					handlePageClick={handlePageClick}
					children={i < pageToRender.length ? pageToRender[i] : <></>}
				/>
			))}

			<Musica />
		</>
	);
};

export default HomePage;
