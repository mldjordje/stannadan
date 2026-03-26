import Image from 'next/image';
import Link from 'next/link';
import { Apartment } from '@/lib/stay/types';
import { formatCurrency } from '@/lib/stay/format';

type ApartmentCardProps = {
	apartment: Apartment;
};

function ApartmentCard({ apartment }: ApartmentCardProps) {
	return (
		<div className="site-card h-100">
			<div className="position-relative overflow-hidden rounded-4">
				<Image
					src={apartment.coverImage}
					alt={apartment.name}
					width={900}
					height={640}
					className="w-100 site-card-image"
				/>
				<div className="site-card-badge">
					{formatCurrency(apartment.pricePerNight)}
					<span className="text-white-50"> / noc</span>
				</div>
			</div>
			<div className="tw-pt-6">
				<div className="d-flex justify-content-between gap-4 flex-wrap tw-mb-4">
					<div>
						<p className="text-uppercase tw-text-xs text-main-600 fw-semibold mb-2">{apartment.locationNote}</p>
						<h3 className="tw-text-8 fw-normal text-white mb-0">{apartment.name}</h3>
					</div>
					<div className="text-end">
						<p className="mb-1 text-white">
							<i className="ph-fill ph-star text-main-600 me-1" />
							{apartment.rating.toFixed(2)}
						</p>
						<p className="mb-0 text-white-50 tw-text-sm">{apartment.reviewCount} recenzija</p>
					</div>
				</div>
				<p className="text-white-50 tw-text-lg tw-mb-5">{apartment.teaser}</p>
				<div className="d-flex flex-wrap gap-3 tw-mb-5 text-white-50 tw-text-sm">
					<span>{apartment.guests} gosta</span>
					<span>{apartment.beds} kreveta</span>
					<span>{apartment.baths} kupatila</span>
					<span>{apartment.size} m2</span>
				</div>
				<Link
					href={`/apartments/${apartment.slug}`}
					className="tw-btn-hover-white bg-main-600 tw-py-4 tw-px-8 text-heading font-heading d-inline-flex align-items-center tw-gap-2 tw-rounded-lg"
				>
					Detalji i rezervacija
					<span className="d-inline-block lh-1 tw-text-lg">
						<i className="ph ph-arrow-up-right" />
					</span>
				</Link>
			</div>
		</div>
	);
}

export default ApartmentCard;
