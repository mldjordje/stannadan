'use client';

import Link from 'next/link';
import useUser from '@auth/useUser';
import styles from './Error401PageView.module.css';

export default function Error401PageView() {
	const { isGuest } = useUser();

	return (
		<main className={styles.page}>
			<p className={styles.code}>401 / Pristup</p>
			<h1>Nalog nema admin dozvolu.</h1>
			<p>Admin panel je dostupan samo odobrenim Google nalozima.</p>
			<div className={styles.actions}>
				<Link href={isGuest ? '/sign-in' : '/sign-out'}>
					{isGuest ? 'Prijavi se preko Google-a' : 'Odjavi ovaj nalog'}
				</Link>
				<Link href="/">Vrati se na sajt</Link>
			</div>
		</main>
	);
}
