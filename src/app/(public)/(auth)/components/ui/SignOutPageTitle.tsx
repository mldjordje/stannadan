import Typography from '@mui/material/Typography';

function SignOutPageTitle() {
	return (
		<div className="w-full">
			<Typography className="text-center text-xl font-semibold">Stan na dan</Typography>

			<Typography className="mt-8 text-center text-4xl leading-[1.25] font-extrabold tracking-tight">
				Uspešno ste se odjavili.
			</Typography>
		</div>
	);
}

export default SignOutPageTitle;
