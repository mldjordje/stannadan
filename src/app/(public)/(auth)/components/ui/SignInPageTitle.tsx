import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';

function SignInPageTitle() {
	return (
		<div className="w-full">
			<img
				className="w-12"
				src="/site-assets/images/logo/favicon.png"
				alt="logo"
			/>

			<Typography className="mt-8 text-4xl leading-[1.25] font-extrabold tracking-tight">Prijava</Typography>
			<div className="mt-0.5 flex items-baseline font-medium">
				<Typography>Prijavi se Google nalogom za goste ili admin tim.</Typography>
				<Link
					className="ml-1"
					to="/sign-up"
				>
					Napravi nalog
				</Link>
			</div>
		</div>
	);
}

export default SignInPageTitle;
