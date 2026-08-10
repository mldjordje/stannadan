import { Alert } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import AuthJsProviderSelect from './AuthJsProviderSelect';
import AuthJsCredentialsSignInForm from './AuthJsCredentialsSignInForm';
import AuthJsCredentialsSignUpForm from './AuthJsCredentialsSignUpForm';
import signinErrors from './signinErrors';
import { authJsProviderMap } from '@auth/authJs';

type AuthJsFormProps = { formType: 'signin' | 'signup' };

function AuthJsForm(props: AuthJsFormProps) {
	const { formType = 'signin' } = props;

	const searchParams = useSearchParams();

	const errorType = searchParams.get('error');

	const error = errorType && (signinErrors[errorType] ?? signinErrors.default);
	const credentialsEnabled = authJsProviderMap.some((provider) => provider.id === 'credentials');

	return (
		<div className="flex flex-col space-y-8">
			{error && (
				<Alert
					className="mt-4"
					severity="error"
					sx={(theme) => ({
						backgroundColor: theme.palette.error.light,
						color: theme.palette.error.dark
					})}
				>
					{error}
				</Alert>
			)}
			{formType === 'signin' && credentialsEnabled && <AuthJsCredentialsSignInForm />}
			{formType === 'signup' && credentialsEnabled && <AuthJsCredentialsSignUpForm />}
			<AuthJsProviderSelect />
		</div>
	);
}

export default AuthJsForm;
