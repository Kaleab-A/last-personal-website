import "./style.css";
import { useEffect, useState, useRef } from "react";

const Page = (props: {
	order: number;
	totalPages: number;
	value: number;
	handlePageClick: (page: number) => void;
	children: React.ReactNode;
}) => {
	// Set z-index and margin of the page to be the order of the page
	const [zIndex, setZIndex] = useState(props.order);

	const pageDiv = useRef<HTMLDivElement>(null);
	const marginLeftMultiplier = -2;
	const marginTopMultiplier = -2.5;

	useEffect(() => {
		setZIndex(props.order);

		if (pageDiv.current) {
			pageDiv.current.style.left =
				50 + marginLeftMultiplier * props.order + "%";
			pageDiv.current.style.top = 50 + marginTopMultiplier * props.order + "%";
		}

		if (pageDiv.current) {
			pageDiv.current.addEventListener("click", () => {
				props.handlePageClick(props.order);
			});
		}
	}, [props.order]);

	return (
		<div
			className="page"
			style={{
				zIndex: -zIndex, // Assuming there is max 100 pages
			}}
			ref={pageDiv}
		>
			{/* <h1>
				Page {props.value} Order {props.order}
			</h1> */}

			{props.children}
		</div>
	);
};

export default Page;
