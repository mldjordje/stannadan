import Link from 'next/link';
import PublicInformationLayout from '@/components/site/shared/PublicInformationLayout';
import { readStayData } from '@/lib/stay/store';

export default async function ContactPage() {
	const data = await readStayData();

	return (
		<PublicInformationLayout
			intro="Kontakt i lokacija"
			heading={`Na pravom mestu u gradu ${data.property.city}.`}
			description="Javite nam kada planirate dolazak. Odgovorićemo direktno, pomoći oko izbora apartmana i podeliti sve detalje za prijatan dolazak."
			actions={
				<>
					<Link href={`tel:${data.property.phone}`}>Pozovite domaćina</Link>
					<Link href={`mailto:${data.property.email}`}>Pošaljite email</Link>
				</>
			}
			aside={
				<section aria-labelledby="neighborhood-title">
					<h2
						id="neighborhood-title"
						data-public-section-title
					>
						U komšiluku
					</h2>
					<ul data-public-list>
						{data.property.neighborhood.map((item) => (
							<li
								key={item.label}
								data-public-row
							>
								<span data-public-label>{item.label}</span>
								<span data-public-value>{item.distance}</span>
							</li>
						))}
					</ul>
				</section>
			}
		>
			<section
				data-public-section
				aria-labelledby="contact-details-title"
			>
				<h2
					id="contact-details-title"
					data-public-section-title
				>
					Direktan kontakt
				</h2>
				<address>
					<ul data-public-list>
						<li data-public-row>
							<span data-public-label>Telefon</span>
							<p data-public-value>
								<Link href={`tel:${data.property.phone}`}>{data.property.phone}</Link>
								<span data-public-meta>Za pitanja o terminima i boravku</span>
							</p>
						</li>
						<li data-public-row>
							<span data-public-label>Email</span>
							<p data-public-value>
								<Link href={`mailto:${data.property.email}`}>{data.property.email}</Link>
								<span data-public-meta>Pišite nam kada vam odgovara</span>
							</p>
						</li>
						<li data-public-row>
							<span data-public-label>Adresa</span>
							<p data-public-value>
								<Link
									href={data.property.googleMapsUrl}
									target="_blank"
									rel="noreferrer"
								>
									{data.property.address}
								</Link>
								<span data-public-meta>Otvorite lokaciju na mapi</span>
							</p>
						</li>
					</ul>
				</address>
			</section>
		</PublicInformationLayout>
	);
}
