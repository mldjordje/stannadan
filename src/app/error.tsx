'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import styles from './error.module.css';

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorPage({ error, reset }: Props) {
	useEffect(() => console.error(error), [error]);

	return (
		<main className={styles.page}>
			<p>Greška</p>
			<h1>Nešto nije u redu.</h1>
			<span>Pokušajte ponovo ili se vratite na početnu stranu.</span>
			<div>
				<button
					type="button"
					onClick={reset}
				>
					Pokušaj ponovo
				</button>
				<Link href="/">Početna strana</Link>
			</div>
		</main>
	);
}
