import Image from 'next/image';
import AuthJsForm from '@auth/forms/AuthJsForm';
import SignInPageTitle from '../ui/SignInPageTitle';

/**
 * The sign in page.
 */
function SignInPageView() {
	return (
		<main className="auth-sign-in">
			<section className="auth-image-panel">
				<Image
					src="/site-assets/images/cinematic/studio-vertical-1600.webp"
					alt="Topao, pažljivo uređen enterijer apartmana u Nišu"
					fill
					priority
					sizes="(max-width: 767px) 100vw, 52vw"
				/>
				<div className="auth-image-copy">
					<p>Niš, Srbija</p>
					<h2>Vaš miran prostor u srcu grada.</h2>
				</div>
			</section>

			<section
				className="auth-form-panel"
				aria-label="Prijava na nalog"
			>
				<div className="auth-form-inner">
					<SignInPageTitle />

					<AuthJsForm formType="signin" />
					<p className="auth-privacy-note">
						Vaši podaci služe samo za pristup rezervacijama povezanim sa nalogom.
					</p>
				</div>
			</section>
		</main>
	);
}

export default SignInPageView;
