import Link from 'next/link';
import { PropertyProfile } from '@/lib/stay/types';
import Reveal from './Reveal';

type SiteFooterProps = {
	property: PropertyProfile;
};

function SiteFooter({ property }: SiteFooterProps) {
	const year = new Date().getFullYear();

	return (
		<footer className="snd-foot">
			<div className="snd-wrap">
				<div className="snd-foot-top">
					<Reveal className="snd-foot-brand">
						<span className="word">
							Stan <span className="snd-gold">&#183;</span> na <span className="snd-gold">&#183;</span> Dan
						</span>
						<p className="snd-body">{property.description}</p>
						<div className="snd-chips">
							<a
								href={`tel:${property.phone}`}
								className="snd-chip"
							>
								{property.phone}
							</a>
							<a
								href={`mailto:${property.email}`}
								className="snd-chip"
							>
								Pošalji mejl
							</a>
						</div>
					</Reveal>

					<Reveal
						className="snd-foot-col"
						delay={1}
					>
						<h5>Stranice</h5>
						<ul>
							<li>
								<Link href="/apartments">Apartmani</Link>
							</li>
							<li>
								<Link href="/availability">Dostupnost</Link>
							</li>
							<li>
								<Link href="/contact">Kontakt</Link>
							</li>
							<li>
								<Link href="/account">Moj nalog</Link>
							</li>
						</ul>
					</Reveal>

					<Reveal
						className="snd-foot-col"
						delay={2}
					>
						<h5>Kontakt</h5>
						<ul>
							<li>
								<a href={`tel:${property.phone}`}>{property.phone}</a>
							</li>
							<li>
								<a href={`mailto:${property.email}`}>{property.email}</a>
							</li>
							<li>
								<a
									href={property.googleMapsUrl}
									target="_blank"
									rel="noreferrer"
								>
									{property.address}
								</a>
							</li>
						</ul>
					</Reveal>

					<Reveal
						className="snd-foot-col"
						delay={3}
					>
						<h5>U blizini</h5>
						<ul>
							{property.neighborhood.map((item) => (
								<li key={item.label}>
									{item.label}
									<span className="sub">{item.distance}</span>
								</li>
							))}
						</ul>
					</Reveal>
				</div>

				<div className="snd-foot-bot">
					<span>
						&#169; {year} {property.name}
					</span>
					<span className="snd-it" style={{ letterSpacing: 0, textTransform: 'none', fontSize: 14 }}>
						{property.city}, {property.country}
					</span>
					<Link
						href="/sign-in"
						className="snd-tlink"
					>
						<span>Prijava</span>
						<span className="snd-arr" />
					</Link>
				</div>
			</div>
		</footer>
	);
}

export default SiteFooter;
