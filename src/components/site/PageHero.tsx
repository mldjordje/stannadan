type PageHeroProps = {
	kicker: string;
	title: string;
	description: string;
};

function PageHero({ kicker, title, description }: PageHeroProps) {
	return (
		<section className="site-page-hero">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-xl-8 text-center">
						<p className="text-uppercase text-main-600 tw-text-sm fw-semibold tw-mb-4">{kicker}</p>
						<h1 className="tw-text-18 text-white fw-normal tw-mb-5">{title}</h1>
						<p className="text-white-50 tw-text-xl mb-0">{description}</p>
					</div>
				</div>
			</div>
		</section>
	);
}

export default PageHero;
