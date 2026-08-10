import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { getProviders, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

const providerLogoPath = 'https://authjs.dev/img/providers';

function AuthJsProviderSelect() {
	const [socialProviders, setSocialProviders] = useState<{ id: string; name: string }[] | null>(null);

	useEffect(() => {
		let active = true;

		getProviders()
			.then((availableProviders) => {
				if (active) {
					setSocialProviders(
						Object.values(availableProviders ?? {})
							.filter((provider) => provider.id === 'google')
							.map(({ id, name }) => ({ id, name }))
					);
				}
			})
			.catch(() => {
				if (active) setSocialProviders([]);
			});

		return () => {
			active = false;
		};
	}, []);

	function handleSignIn(providerId: string) {
		try {
			signIn(providerId);
		} catch (error) {
			console.error(error);
		}
	}

	if (socialProviders === null) {
		return <p className="auth-provider-loading">Pripremamo Google prijavu…</p>;
	}

	if (socialProviders.length === 0) {
		return <Alert severity="warning">Google prijava trenutno nije podešena. Pokušajte ponovo kasnije.</Alert>;
	}

	return (
		<div className="auth-provider-select">
			<div className="auth-provider-list">
				{socialProviders.map((provider) => (
					<Button
						key={provider.id}
						className="auth-provider-button"
						onClick={() => handleSignIn(provider.id)}
						endIcon={
							<span className="auth-provider-icon">
								<img
									src={`${providerLogoPath}/${provider.id}.svg`}
									alt=""
								/>
							</span>
						}
					>
						<span>Nastavi preko {provider.name}</span>
					</Button>
				))}
			</div>
		</div>
	);
}

export default AuthJsProviderSelect;
