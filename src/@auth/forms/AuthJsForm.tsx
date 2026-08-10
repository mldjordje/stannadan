import { Alert } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import AuthJsProviderSelect from './AuthJsProviderSelect';
import signinErrors from './signinErrors';

type AuthJsFormProps = { formType: 'signin' | 'signup' };

function AuthJsForm(_props: AuthJsFormProps) {
	const searchParams = useSearchParams();

	const errorType = searchParams.get('error');

	const error = errorType && (signinErrors[errorType] ?? signinErrors.default);
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
			<AuthJsProviderSelect />
		</div>
	);
}

export default AuthJsForm;
