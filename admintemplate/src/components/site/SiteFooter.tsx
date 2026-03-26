import Link from 'next/link';
import { PropertyProfile } from '@/lib/stay/types';

type SiteFooterProps = {
	property: PropertyProfile;
};

function SiteFooter({ property }: SiteFooterProps) {
	return (
		<footer className="footer position-relative overflow-hidden site-footer">
			<div className="container">
				<div className="row gy-5 tw-pt-18 tw-pb-10">
					<div className="col-lg-5">
						<p className="text-uppercase text-main-600 tw-text-sm fw-semibold mb-3">Stan na dan Nis</p>
						<h2 className="cursor-text tw-text-12 fw-normal text-white tw-mb-5">
							Brzo upravljanje rezervacijama i moderan boravak u centru grada.
						</h2>
						<p className="text-white-50 tw-text-lg mb-0">{property.description}</p>
					</div>
					<div className="col-md-4 col-lg-3">
						<h4 className="tw-text-505 fw-normal text-white tw-mb-6">Kontakt</h4>
						<ul className="d-flex flex-column tw-gap-4">
							<li>
								<Link href={`tel:${property.phone}`} className="text-white hover-text-main-600">
									{property.phone}
								</Link>
							</li>
							<li>
								<Link href={`mailto:${property.email}`} className="text-white hover-text-main-600">
									{property.email}
								</Link>
							</li>
							<li>
								<Link href={property.googleMapsUrl} className="text-white hover-text-main-600" target="_blank">
									{property.address}
								</Link>
							</li>
						</ul>
					</div>
					<div className="col-md-4 col-lg-2">
						<h4 className="tw-text-505 fw-normal text-white tw-mb-6">Navigacija</h4>
						<ul className="d-flex flex-column tw-gap-4">
							<li>
								<Link href="/apartments" className="text-white hover-text-main-600">
									Apartmani
								</Link>
							</li>
							<li>
								<Link href="/availability" className="text-white hover-text-main-600">
									Dostupnost
								</Link>
							</li>
							<li>
								<Link href="/account" className="text-white hover-text-main-600">
									Moj nalog
								</Link>
							</li>
							<li>
								<Link href="/admin" className="text-white hover-text-main-600">
									Admin
								</Link>
							</li>
						</ul>
					</div>
					<div className="col-md-4 col-lg-2">
						<h4 className="tw-text-505 fw-normal text-white tw-mb-6">U blizini</h4>
						<ul className="d-flex flex-column tw-gap-4">
							{property.neighborhood.map((item) => (
								<li key={item.label} className="text-white-50">
									<span className="d-block text-white">{item.label}</span>
									<span>{item.distance}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="border-top border-white border-opacity-10 py-4 d-flex justify-content-between gap-3 flex-wrap">
					<p className="mb-0 text-white-50">Direktne rezervacije, Booking.com sync i Google prijava u jednoj Next.js aplikaciji.</p>
					<Link href="/sign-in" className="text-main-600">
						Prijava i nalog
					</Link>
				</div>
			</div>
		</footer>
	);
}

export default SiteFooter;
