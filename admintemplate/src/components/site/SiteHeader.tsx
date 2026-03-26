import Image from 'next/image';
import Link from 'next/link';
import { PropertyProfile, UserRole } from '@/lib/stay/types';

type SiteHeaderProps = {
	property: PropertyProfile;
	userName?: string | null;
	roles?: UserRole[];
};

const navigationItems = [
	{ href: '/', label: 'Pocetna' },
	{ href: '/apartments', label: 'Apartmani' },
	{ href: '/availability', label: 'Dostupnost' },
	{ href: '/contact', label: 'Kontakt' }
];

function SiteHeader({ property, userName, roles = [] }: SiteHeaderProps) {
	const isAdmin = roles.includes('admin');
	const primaryHref = userName ? (isAdmin ? '/admin' : '/account') : '/sign-in';
	const primaryLabel = userName ? (isAdmin ? 'Admin panel' : 'Moj nalog') : 'Google prijava';

	return (
		<header className="header tw-transition-all tw-z-99 header-transparent fixed-header">
			<div className="container tw-container-1750-px">
				<nav className="d-flex align-items-center justify-content-between position-relative py-3">
					<div className="logo">
						<Link href="/" className="link d-flex align-items-center gap-3">
							<Image
								src="/site-assets/images/logo/logo-white.png"
								alt={property.name}
								width={180}
								height={54}
								className="max-w-200-px"
							/>
							<span className="text-white font-heading tw-text-lg d-none d-lg-inline">{property.city}</span>
						</Link>
					</div>
					<div className="d-none d-lg-block">
						<ul className="nav-menu d-flex align-items-center tw-gap-8">
							{navigationItems.map((item) => (
								<li key={item.href} className="nav-menu__item">
									<Link href={item.href} className="nav-menu__link text-white font-heading tw-py-11 fw-normal">
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div className="d-flex align-items-center tw-gap-4">
						{userName ? (
							<div className="d-none d-md-flex align-items-center tw-gap-3 rounded-pill border border-white border-opacity-25 px-3 py-2">
								<span className="tw-text-sm text-white-50">Prijavljen</span>
								<span className="font-heading text-white">{userName}</span>
							</div>
						) : null}
						<Link
							href={primaryHref}
							className="tw-btn-hover-yellow bg-white tw-py-4 tw-px-7 text-uppercase text-heading font-heading d-inline-flex align-items-center tw-gap-2 tw-rounded-lg"
						>
							{primaryLabel}
							<span className="d-inline-block lh-1 tw-text-lg">
								<i className="ph ph-arrow-up-right" />
							</span>
						</Link>
					</div>
				</nav>
			</div>
		</header>
	);
}

export default SiteHeader;
