interface SiteLogoProps {
	variant?: 'full' | 'mark';
	scheme?: 'dark' | 'light';
	width?: number;
}

export default function SiteLogo({ variant = 'full', scheme = 'dark', width = 210 }: SiteLogoProps) {
	const gold = '#C9A84C';
	const cream = scheme === 'dark' ? '#F4EFE6' : '#0A0E1A';
	const muted = scheme === 'dark' ? 'rgba(244,239,230,0.38)' : 'rgba(10,14,26,0.45)';
	const divider = scheme === 'dark' ? 'rgba(201,168,76,0.22)' : 'rgba(128,100,35,0.3)';

	if (variant === 'mark') {
		const h = 44;
		return (
			<svg
				viewBox="0 0 44 44"
				width={h}
				height={h}
				xmlns="http://www.w3.org/2000/svg"
				aria-label="Stan na Dan"
			>
				<circle cx="22" cy="22" r="20" fill="none" stroke={gold} strokeWidth="1" />
				<text
					x="22"
					y="27"
					textAnchor="middle"
					fontFamily="'Cormorant Garamond', Georgia, serif"
					fontStyle="italic"
					fontSize="13"
					fill={gold}
					letterSpacing="0.5"
				>
					S·D
				</text>
			</svg>
		);
	}

	const vb = '0 0 260 56';
	const h = Math.round((56 / 260) * width);

	return (
		<svg
			viewBox={vb}
			width={width}
			height={h}
			xmlns="http://www.w3.org/2000/svg"
			aria-label="Stan na Dan Niš"
		>
			{/* ── Mark: circle monogram ── */}
			<circle cx="28" cy="28" r="24" fill="none" stroke={gold} strokeWidth="1" />
			{/* S top */}
			<text
				x="28"
				y="25"
				textAnchor="middle"
				fontFamily="'Cormorant Garamond', Georgia, serif"
				fontStyle="italic"
				fontSize="12"
				fill={gold}
				letterSpacing="0.3"
			>
				S
			</text>
			{/* centre dot */}
			<circle cx="28" cy="28" r="1.2" fill={gold} />
			{/* D bottom */}
			<text
				x="28"
				y="39"
				textAnchor="middle"
				fontFamily="'Cormorant Garamond', Georgia, serif"
				fontStyle="italic"
				fontSize="12"
				fill={gold}
				letterSpacing="0.3"
			>
				D
			</text>

			{/* ── Divider ── */}
			<line x1="64" y1="12" x2="64" y2="44" stroke={divider} strokeWidth="1" />

			{/* ── Wordmark ── */}
			<text
				x="76"
				y="33"
				fontFamily="'Cormorant Garamond', Georgia, serif"
				fontStyle="italic"
				fontSize="26"
				fontWeight="400"
				fill={cream}
				letterSpacing="0.3"
			>
				Stan na Dan
			</text>

			{/* ── City tag ── */}
			<text
				x="77"
				y="47"
				fontFamily="'JetBrains Mono', 'Courier New', monospace"
				fontSize="8.5"
				letterSpacing="5.5"
				fill={gold}
			>
				NIŠ
			</text>
		</svg>
	);
}
