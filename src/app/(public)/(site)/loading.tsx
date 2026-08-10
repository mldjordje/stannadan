export default function Loading() {
	return (
		<div
			className="site-route-loading"
			role="status"
			aria-live="polite"
		>
			<div className="site-route-loading__inner">
				<p>Pripremamo vaš boravak</p>
				<div
					className="site-route-loading__line"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
}
