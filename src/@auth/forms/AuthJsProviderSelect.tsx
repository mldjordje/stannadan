import Button from '@mui/material/Button';
import { signIn } from 'next-auth/react';
import { authJsProviderMap } from '@auth/authJs';

const providerLogoPath = 'https://authjs.dev/img/providers';

function AuthJsProviderSelect() {
	function handleSignIn(providerId: string) {
		try {
			signIn(providerId);
		} catch (error) {
			console.error(error);
		}
	}

	if (authJsProviderMap?.length === 0) {
		return null;
	}

	return (
		<div className="auth-provider-select">
			<div className="auth-provider-divider">
				<span>ili nastavite putem</span>
			</div>
			<div className="auth-provider-list">
				{Object.values(authJsProviderMap)
					.filter((provider) => provider.id !== 'credentials')
					.map((provider) => (
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
							<span>Prijava preko {provider.name}</span>
						</Button>
					))}
			</div>
		</div>
	);
}

export default AuthJsProviderSelect;
