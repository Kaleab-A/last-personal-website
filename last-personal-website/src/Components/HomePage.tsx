import Page from "./Page";
import Musica from "./Musica";
import { useState } from "react";

const HomePage = () => {
	const totalPages = 4; // UPDATE WHENEVER

	const [order, setOrder] = useState(Array.from(Array(totalPages).keys()));

	const handlePageClick = (page: number) => {
		const newOrder = [...order];

		// ---------- Swiching page Option 1
		// const indexZero = newOrder.indexOf(0);
		// const indexPage = newOrder.indexOf(page);

		// newOrder[indexZero] = page;
		// newOrder[indexPage] = 0;

		// ---------- Swiching page Option 2
		// console.log("old order", newOrder, "page", page);
		newOrder.forEach((value, index) => {
			if (order[index] < page) {
				newOrder[index] = value + 1;
				console.log("Changed", "index", index, "value", value);
			} else if (order[index] === page) {
				newOrder[index] = 0;
			}
		});
		// console.log("new order", newOrder);

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
				/>
			))}

			<Musica />
		</>
	);
};

export default HomePage;
