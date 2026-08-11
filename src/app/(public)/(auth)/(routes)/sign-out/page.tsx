import Link from 'next/link';
import { signOut } from '@auth/authJs';
import styles from './page.module.css';

export default function SignOutPage() {
	return (
		<main className={styles.page}>
			<p className={styles.wordmark}>Stan na dan</p>
			<h1>Odjava sa naloga.</h1>
			<p>Zatvorite trenutnu sesiju na ovom uređaju.</p>
			<form
				action={async () => {
					'use server';
					await signOut({ redirectTo: '/sign-in' });
				}}
			>
				<button type="submit">Odjavi se</button>
			</form>
			<Link href="/">Vrati se na početnu</Link>
		</main>
	);
}
