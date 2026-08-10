import Link from 'next/link';

export default function NotFound() {
	return (
		<section className="site-not-found">
			<div className="site-not-found__inner">
				<p>Stranica nije pronađena</p>
				<h1>Ovde nema ključa.</h1>
				<nav
					className="site-not-found__links"
					aria-label="Povratak na sajt"
				>
					<Link href="/">Početna</Link>
					<Link href="/apartments">Pogledajte apartmane</Link>
				</nav>
			</div>
		</section>
	);
}
