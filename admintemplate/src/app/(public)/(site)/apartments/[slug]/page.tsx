import Image from 'next/image';
import { notFound } from 'next/navigation';
import BookingRequestForm from '@/components/site/BookingRequestForm';
import PageHero from '@/components/site/PageHero';
import { formatCurrency } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

type ApartmentDetailsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

export default async function ApartmentDetailsPage({ params }: ApartmentDetailsPageProps) {
	const { slug } = await params;
	const data = await readStayData();
	const apartment = data.apartments.find((item) => item.slug === slug);

	if (!apartment) {
		notFound();
	}

	return (
		<>
			<PageHero kicker={apartment.locationNote} title={apartment.name} description={apartment.description} />
			<section className="tw-pb-10">
				<div className="container">
					<div className="row g-4 site-gallery-grid">
						{apartment.gallery.map((image) => (
							<div key={image} className="col-md-4">
								<Image src={image} alt={apartment.name} width={900} height={640} className="w-100" />
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="tw-pb-18">
				<div className="container">
					<div className="row g-5">
						<div className="col-lg-7">
							<div className="site-surface tw-p-7 h-100">
								<div className="d-flex flex-wrap gap-3 tw-mb-5">
									<span className="site-mini-card text-white">{apartment.guests} gosta</span>
									<span className="site-mini-card text-white">{apartment.beds} kreveta</span>
									<span className="site-mini-card text-white">{apartment.baths} kupatila</span>
									<span className="site-mini-card text-white">{apartment.size} m2</span>
								</div>
								<p className="text-white-50 tw-text-xl tw-mb-6">{apartment.description}</p>
								<div className="row g-4 tw-mb-6">
									<div className="col-md-6">
										<h3 className="tw-text-8 fw-normal text-white tw-mb-4">Sadrzaji</h3>
										<ul className="d-flex flex-column tw-gap-3 text-white-50">
											{apartment.amenities.map((item) => (
												<li key={item} className="d-flex align-items-center gap-3">
													<i className="ph-fill ph-check-circle text-main-600" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</div>
									<div className="col-md-6">
										<h3 className="tw-text-8 fw-normal text-white tw-mb-4">Pravila</h3>
										<ul className="d-flex flex-column tw-gap-3 text-white-50">
											{apartment.rules.map((item) => (
												<li key={item} className="d-flex align-items-center gap-3">
													<i className="ph-fill ph-dot-outline text-main-600" />
													<span>{item}</span>
												</li>
											))}
										</ul>
									</div>
								</div>
								<div className="site-mini-card">
									<p className="mb-2 text-white">Ocena gostiju: {apartment.rating.toFixed(2)} / 5</p>
									<p className="mb-0 text-white-50">{apartment.reviewCount} verifikovanih recenzija</p>
								</div>
							</div>
						</div>
						<div className="col-lg-5">
							<BookingRequestForm apartment={apartment} />
							<div className="site-mini-card mt-4">
								<p className="mb-2 text-white">Cena od {formatCurrency(apartment.pricePerNight)} po nocenju</p>
								<p className="mb-0 text-white-50">Booking.com i direktne rezervacije koriste isti availability feed za ovaj apartman.</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
