import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { readStayData } from '@/lib/stay/store';

export default async function ContactPage() {
	const data = await readStayData();

	return (
		<>
			<PageHero
				kicker="Kontakt i lokacija"
				title="Brza komunikacija sa gostima i jednostavan dolazak u centar Nisa."
				description="Na ovoj stranici mozes drzati direktne kontakt informacije, instrukcije za dolazak i najvaznije tacke u okolini."
			/>
			<section className="tw-pb-18">
				<div className="container">
					<div className="row g-4">
						<div className="col-lg-5">
							<div className="site-surface tw-p-7 h-100">
								<h3 className="tw-text-8 fw-normal text-white tw-mb-6">Kontakt podaci</h3>
								<ul className="d-flex flex-column tw-gap-4 text-white-50">
									<li>
										<span className="d-block text-white">Telefon</span>
										<Link href={`tel:${data.property.phone}`} className="text-main-600">
											{data.property.phone}
										</Link>
									</li>
									<li>
										<span className="d-block text-white">Email</span>
										<Link href={`mailto:${data.property.email}`} className="text-main-600">
											{data.property.email}
										</Link>
									</li>
									<li>
										<span className="d-block text-white">Adresa</span>
										<Link href={data.property.googleMapsUrl} target="_blank" className="text-main-600">
											{data.property.address}
										</Link>
									</li>
								</ul>
							</div>
						</div>
						<div className="col-lg-7">
							<div className="site-surface tw-p-7 h-100">
								<h3 className="tw-text-8 fw-normal text-white tw-mb-6">Sta je u blizini</h3>
								<div className="row g-4">
									{data.property.neighborhood.map((item) => (
										<div key={item.label} className="col-md-4">
											<div className="site-mini-card h-100">
												<p className="mb-2 text-white">{item.label}</p>
												<p className="mb-0 text-white-50">{item.distance}</p>
											</div>
										</div>
									))}
								</div>
								<div className="site-mini-card mt-4">
									<p className="mb-0 text-white-50">
										Za pune Booking.com ili Google Maps integracije u produkciji ubacuju se pravi property linkovi i uputstva za self check-in.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
