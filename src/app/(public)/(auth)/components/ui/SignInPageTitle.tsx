import Link from 'next/link';

function SignInPageTitle() {
	return (
		<header className="auth-title">
			<Link
				href="/"
				className="auth-home-link"
				aria-label="Stan na Dan Niš, početna"
			>
				<span>Stan na dan</span>
			</Link>
			<p className="auth-eyebrow">Moj nalog</p>
			<h1>Dobro došli.</h1>
			<p className="auth-intro">Prijavite se da biste pregledali svoje rezervacije.</p>
		</header>
	);
}

export default SignInPageTitle;
