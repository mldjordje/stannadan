import Image from 'next/image';
import Link from 'next/link';
import ApartmentCard from '@/components/site/ApartmentCard';
import { formatCurrency } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function HomePage() {
	const data = await readStayData();
	const featuredApartments = data.apartments.filter((apartment) => apartment.featured);

	return (
		<>
			<section className="banner-area background-img position-relative overflow-hidden" style={{ padding: '180px 0 120px' }}>
				<Image src={data.property.heroImage} alt={data.property.name} fill priority style={{ objectFit: 'cover' }} />
				<div className="site-hero-overlay" />
				<div className="container position-relative z-2">
					<div className="row align-items-center justify-content-between gy-5">
						<div className="col-xl-7 col-lg-8">
							<p className="banner-subtitle tw-text-xl text-uppercase text-main-600 tw-mb-7">{data.property.city} short stay</p>
							<h1 className="banner-title tw-text-29 text-white fw-normal tw-mb-8">
								Stan na dan u Nisu sa modernim sajtom, Google prijavom i Booking.com sync tokom cele sezone.
							</h1>
							<p className="text-white-50 tw-text-xl tw-mb-8">{data.property.tagline}</p>
							<div className="d-flex align-items-center flex-wrap row-gap-3 tw-gap-13">
								<Link
									className="tw-btn-hover-white bg-main-600 tw-py-5 tw-px-12 text-heading font-heading d-inline-flex align-items-center tw-gap-3 tw-rounded-lg"
									href="/apartments"
								>
									Pregledaj apartmane
									<span className="d-inline-block lh-1 tw-text-lg">
										<i className="ph ph-arrow-up-right" />
									</span>
								</Link>
								<div>
									<p className="mb-1 text-white">
										<i className="ph-fill ph-star text-main-600 me-2" />
										4.9 / 5 zadovoljstvo gostiju
									</p>
									<p className="mb-0 text-white-50">Direktne i Booking.com rezervacije na istom kalendaru</p>
								</div>
							</div>
						</div>
						<div className="col-xl-4 col-lg-4">
							<div className="site-surface tw-p-7">
								<p className="text-uppercase text-main-600 fw-semibold tw-text-sm tw-mb-4">Operativni pregled</p>
								<div className="row g-3">
									<div className="col-6">
										<div className="site-stat">
											<p className="tw-text-12 text-white fw-normal mb-1">{data.apartments.length}</p>
											<p className="mb-0 text-white-50">Aktivna apartmana</p>
										</div>
									</div>
									<div className="col-6">
										<div className="site-stat">
											<p className="tw-text-12 text-white fw-normal mb-1">{data.reservations.length}</p>
											<p className="mb-0 text-white-50">Rezervacije u sistemu</p>
										</div>
									</div>
									<div className="col-12">
										<div className="site-stat">
											<p className="mb-2 text-white">Od {formatCurrency(Math.min(...data.apartments.map((item) => item.pricePerNight)))}</p>
											<p className="mb-0 text-white-50">cene po nocenju sa spremnim direktnim upitom</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="tw-py-16">
				<div className="container">
					<div className="row g-4">
						{data.property.highlights.map((item) => (
							<div key={item} className="col-md-6 col-xl-3">
								<div className="site-mini-card h-100">
									<div className="text-main-600 tw-text-4xl tw-mb-4">
										<i className="ph-bold ph-check-circle" />
									</div>
									<p className="mb-0 text-white tw-text-lg">{item}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="tw-pb-18">
				<div className="container">
					<div className="d-flex justify-content-between gap-4 flex-wrap align-items-end tw-mb-10">
						<div>
							<p className="text-uppercase text-main-600 fw-semibold tw-text-sm tw-mb-4">Najtrazeniji smestaj</p>
							<h2 className="tw-text-15 fw-normal text-white mb-0">Apartmani spremni za direktnu prodaju i kanal sync</h2>
						</div>
						<Link href="/availability" className="text-main-600 font-heading tw-text-lg">
							Otvori dostupnost
						</Link>
					</div>
					<div className="row g-4">
						{featuredApartments.map((apartment) => (
							<div key={apartment.id} className="col-lg-6">
								<ApartmentCard apartment={apartment} />
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
