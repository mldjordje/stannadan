type TickerProps = {
	items: string[];
};

/**
 * Slow editorial marquee. Pure CSS transform, no scroll hijacking —
 * the page itself never scrolls sideways.
 */
function Ticker({ items }: TickerProps) {
	const line = (
		<span>
			{items.map((item) => (
				<span key={item}>
					{item}
					<span className="dot">&nbsp;&nbsp;&#8226;</span>
				</span>
			))}
		</span>
	);

	return (
		<div
			className="snd-ticker"
			aria-hidden="true"
		>
			<div className="snd-ticker-track">
				{line}
				{line}
			</div>
		</div>
	);
}

export default Ticker;
