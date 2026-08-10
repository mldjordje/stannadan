import Typography from '@mui/material/Typography';
import clsx from 'clsx';

type LogoProps = {
	className?: string;
};

/**
 * The logo component.
 */
function Logo(props: LogoProps) {
	const { className = '' } = props;
	return (
		<div className={clsx('flex flex-shrink-0 flex-grow items-center gap-3', className)}>
			<div className="flex flex-1 items-center gap-2">
				<div className="logo-text flex flex-auto flex-col gap-0.5">
					<Typography className="tracking-light text-lg leading-none font-semibold">Stan na dan</Typography>
					<Typography
						className="tracking-light text-[12px] leading-none font-semibold"
						color="text.secondary"
					>
						Administracija
					</Typography>
				</div>
			</div>
		</div>
	);
}

export default Logo;
