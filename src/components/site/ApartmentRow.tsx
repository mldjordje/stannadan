import Image from 'next/image';
import Link from 'next/link';
import { Apartment } from '@/lib/stay/types';
import { formatCurrency } from '@/lib/stay/format';
import { IconStar } from './Icons';
import Reveal from './Reveal';

type ApartmentRowProps = {
	apartment: Apartment;
	index: number;
};

/**
 * Editorial listing row: photograph on one side, the facts on the other,
 * flipping side every other entry.
 */
function ApartmentRow({ apartment, index }: ApartmentRowProps) {
	const flipped = index % 2 === 1;

	return (
		<article className={`snd-row${flipped ? ' is-flipped' : ''}`}>
			<Reveal className="snd-row-media">
				<Link
					href={`/apartments/${apartment.slug}`}
					className="snd-frame is-hoverable"
					style={{ display: 'block', aspectRatio: '16 / 11' }}
				>
					<Image
						src={apartment.coverImage}
						alt={apartment.name}
						fill
						sizes="(max-width: 1180px) 100vw, 55vw"
						style={{ objectFit: 'cover' }}
					/>
					<span className="snd-badge">
						<span className="k">Od</span>
						<span className="v">{formatCurrency(apartment.pricePerNight)}</span>
					</span>
				</Link>
			</Reveal>

			<Reveal
				className="snd-row-body"
				delay={1}
			>
				<div className="snd-stack-sm">
					<span className="snd-eyebrow">
						{String(index + 1).padStart(2, '0')} &#8212; {apartment.locationNote}
					</span>
					<h3 className="snd-row-title">{apartment.name}</h3>
				</div>

				<p className="snd-row-teaser">{apartment.teaser}</p>

				<div className="snd-specs">
					<div>
						<span className="k">Gosti</span>
						<span className="v">{apartment.guests}</span>
					</div>
					<div>
						<span className="k">Kreveti</span>
						<span className="v">{apartment.beds}</span>
					</div>
					<div>
						<span className="k">Kupatila</span>
						<span className="v">{apartment.baths}</span>
					</div>
					<div>
						<span className="k">Površina</span>
						<span className="v">
							{apartment.size}
							<small style={{ fontSize: 12, marginLeft: 3 }}>m&#178;</small>
						</span>
					</div>
				</div>

				<div className="snd-row-foot">
					<span className="snd-rating">
						<IconStar
							size={13}
							style={{ color: 'var(--gold)' }}
						/>
						<b>{apartment.rating.toFixed(2)}</b>
						{apartment.reviewCount} recenzija
					</span>
					<Link
						href={`/apartments/${apartment.slug}`}
						className="snd-btn"
					>
						<span>Pogledaj i rezerviši</span>
						<span className="snd-arr" />
					</Link>
				</div>
			</Reveal>
		</article>
	);
}

export default ApartmentRow;
