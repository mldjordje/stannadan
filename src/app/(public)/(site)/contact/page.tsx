import Link from 'next/link';
import { IconCalendar, IconKey, IconPin } from '@/components/site/Icons';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import SceneHead from '@/components/site/SceneHead';
import { readStayData } from '@/lib/stay/store';

const ARRIVAL = [
	{
		icon: IconCalendar,
		title: 'Dan pre dolaska',
		body: 'Stiže ti poruka sa tačnom adresom, brojem stana i šifrom za ulaz u zgradu.'
	},
	{
		icon: IconKey,
		title: 'Na vratima',
		body: 'Sef sa ključem je pored zvona. Kod važi do kraja boravka, bez čekanja domaćina.'
	},
	{
		icon: IconPin,
		title: 'Parking',
		body: 'Mesto ispod zgrade, ulaz iz dvorišta. Ako dolaziš kombijem, javi unapred.'
	}
];

export default async function ContactPage() {
	const data = await readStayData();
	const { property } = data;

	return (
		<>
			<PageHero
				kicker="Kontakt"
				crumb="Kontakt"
				title={
					<>
						Javi se, <em>odgovaramo isti dan</em>.
					</>
				}
				description="Telefon radi od 8 do 22h. Za termine van sezone i duže boravke dogovaramo cenu direktno."
				image="/site-assets/images/custom/living-room.jpeg"
				imagePosition="55% 45%"
			/>

			<section className="snd-section">
				<div className="snd-wrap">
					<div className="snd-two">
						<Reveal className="snd-stack">
							<span className="snd-eyebrow">Direktna linija</span>

							<a
								href={`tel:${property.phone}`}
								className="snd-serif"
								style={{ fontSize: 'clamp(34px, 4.4vw, 58px)', lineHeight: 1.05, display: 'block' }}
							>
								{property.phone}
							</a>

							<a
								href={`mailto:${property.email}`}
								className="snd-it"
								style={{ fontSize: 26, color: 'var(--gold)' }}
							>
								{property.email}
							</a>

							<div className="snd-panel-plain">
								<span className="snd-mono">Adresa</span>
								<p
									className="snd-serif"
									style={{ fontSize: 22, marginTop: 8 }}
								>
									{property.address}
								</p>
								<a
									href={property.googleMapsUrl}
									target="_blank"
									rel="noreferrer"
									className="snd-tlink"
									style={{ marginTop: 18 }}
								>
									<span>Otvori na mapi</span>
									<span className="snd-arr" />
								</a>
							</div>

							<div className="snd-chips">
								{property.neighborhood.map((spot) => (
									<span
										key={spot.label}
										className="snd-chip"
									>
										{spot.label} · {spot.distance}
									</span>
								))}
							</div>
						</Reveal>

						<Reveal
							delay={1}
							className="snd-stack"
						>
							<div className="snd-panel">
								<span className="snd-eyebrow">Najbrži put do termina</span>
								<p
									className="snd-lede"
									style={{ marginTop: 16 }}
								>
									Izaberi datume na strani apartmana — upit stiže direktno u panel domaćina, sa
									izračunatom cenom.
								</p>
								<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
									<Link
										href="/apartments"
										className="snd-btn"
									>
										<span>Izaberi apartman</span>
										<span className="snd-arr" />
									</Link>
									<Link
										href="/availability"
										className="snd-tlink"
										style={{ alignSelf: 'center' }}
									>
										<span>Vidi kalendar</span>
									</Link>
								</div>
							</div>

							<p className="snd-body">{property.description}</p>
						</Reveal>
					</div>
				</div>
			</section>

			<section
				className="snd-section-tight"
				style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line-soft)' }}
			>
				<div className="snd-wrap">
					<SceneHead
						num="02"
						kicker="Dolazak"
						title={
							<>
								Check-in bez <em>ijednog poziva</em>.
							</>
						}
					/>
					<div className="snd-cardgrid">
						{ARRIVAL.map((step, index) => {
							const Icon = step.icon;

							return (
								<Reveal
									key={step.title}
									delay={index}
								>
									<div
										className="snd-card"
										style={{ height: '100%' }}
									>
										<span style={{ color: 'var(--gold)' }}>
											<Icon size={26} />
										</span>
										<span className="title">{step.title}</span>
										<p className="snd-body">{step.body}</p>
									</div>
								</Reveal>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}
