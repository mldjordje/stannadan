import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';

function SignUpPageTitle() {
	return (
		<div className="w-full">
			<img
				className="w-12"
				src="/site-assets/images/logo/favicon.png"
				alt="logo"
			/>

			<Typography className="mt-8 text-4xl leading-[1.25] font-extrabold tracking-tight">Registracija</Typography>
			<div className="mt-0.5 flex items-baseline font-medium">
				<Typography>Vratite se na prijavu ako vec imate pristup.</Typography>
				<Link
					className="ml-1"
					to="/sign-in"
				>
					Prijava
				</Link>
			</div>
		</div>
	);
}

export default SignUpPageTitle;
