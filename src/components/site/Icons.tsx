import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...props }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	);
}

export function IconKey(props: IconProps) {
	return (
		<Base {...props}>
			<circle
				cx="8"
				cy="8"
				r="4"
			/>
			<path d="M11 11l9 9M17 17l2-2M14 14l2-2" />
		</Base>
	);
}

export function IconWifi(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" />
			<circle
				cx="12"
				cy="19"
				r="1"
			/>
		</Base>
	);
}

export function IconCar(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M3 14l1.6-5A2 2 0 0 1 6.5 8h11a2 2 0 0 1 1.9 1L21 14v4h-2.5M3 18v-4M3 18h2.5M18.5 18h-13" />
			<circle
				cx="7"
				cy="18"
				r="1.6"
			/>
			<circle
				cx="17"
				cy="18"
				r="1.6"
			/>
		</Base>
	);
}

export function IconThermo(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M12 3a2 2 0 0 1 2 2v8.2a4 4 0 1 1-4 0V5a2 2 0 0 1 2-2z" />
			<path d="M12 9v6" />
		</Base>
	);
}

export function IconKitchen(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M18 3c-1.5 1.5-2 3-2 5s.6 3 2 3.5V21" />
		</Base>
	);
}

export function IconWasher(props: IconProps) {
	return (
		<Base {...props}>
			<rect
				x="4"
				y="3"
				width="16"
				height="18"
				rx="2"
			/>
			<circle
				cx="12"
				cy="14"
				r="4"
			/>
			<path d="M7 7h2" />
		</Base>
	);
}

export function IconDesk(props: IconProps) {
	return (
		<Base {...props}>
			<rect
				x="4"
				y="5"
				width="16"
				height="10"
				rx="1"
			/>
			<path d="M9 19h6M12 15v4" />
		</Base>
	);
}

export function IconTv(props: IconProps) {
	return (
		<Base {...props}>
			<rect
				x="2.5"
				y="6"
				width="19"
				height="12"
				rx="1.5"
			/>
			<path d="M8 3l4 3 4-3" />
		</Base>
	);
}

export function IconBalcony(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M4 12h16M6 12V4h12v8M4 12v8M20 12v8M9 12v8M15 12v8M4 20h16" />
		</Base>
	);
}

export function IconCoffee(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8zM17 9h1.5a2.5 2.5 0 0 1 0 5H17M6 3v2M10 3v2M14 3v2" />
		</Base>
	);
}

export function IconPaw(props: IconProps) {
	return (
		<Base {...props}>
			<circle
				cx="7"
				cy="9"
				r="1.8"
			/>
			<circle
				cx="12"
				cy="7"
				r="1.8"
			/>
			<circle
				cx="17"
				cy="9"
				r="1.8"
			/>
			<path d="M12 12c3 0 5 2 5 4.2S15 20 12 20s-5-1.6-5-3.8S9 12 12 12z" />
		</Base>
	);
}

export function IconStar(props: IconProps) {
	return (
		<Base
			fill="currentColor"
			stroke="none"
			{...props}
		>
			<path d="M12 3.5l2.4 5.1 5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 9.3l5.6-.7z" />
		</Base>
	);
}

export function IconArrow(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M4 12h15M14 7l5 5-5 5" />
		</Base>
	);
}

export function IconClose(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M5 5l14 14M19 5L5 19" />
		</Base>
	);
}

export function IconChevron(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M15 5l-7 7 7 7" />
		</Base>
	);
}

export function IconPin(props: IconProps) {
	return (
		<Base {...props}>
			<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
			<circle
				cx="12"
				cy="10"
				r="2.5"
			/>
		</Base>
	);
}

export function IconCalendar(props: IconProps) {
	return (
		<Base {...props}>
			<rect
				x="3.5"
				y="5"
				width="17"
				height="16"
				rx="1.5"
			/>
			<path d="M3.5 10h17M8 3v4M16 3v4" />
		</Base>
	);
}

const amenityIcons: Record<string, (props: IconProps) => React.ReactElement> = {
	'Self check-in': IconKey,
	'Fast Wi-Fi': IconWifi,
	Parking: IconCar,
	'Pet friendly': IconPaw,
	'Air conditioning': IconThermo,
	Kitchen: IconKitchen,
	Washer: IconWasher,
	Workspace: IconDesk,
	'Smart TV': IconTv,
	Balcony: IconBalcony,
	'Breakfast option': IconCoffee
};

export function AmenityIcon({ name, size = 26 }: { name: string; size?: number }) {
	const Component = amenityIcons[name] ?? IconStar;

	return <Component size={size} />;
}
