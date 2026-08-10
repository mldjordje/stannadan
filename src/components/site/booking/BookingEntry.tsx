import clsx from 'clsx';
import Link from 'next/link';
import styles from './BookingEntry.module.css';

type BookingEntryProps = {
	href: string;
	label: string;
	variant: 'edge' | 'menu' | 'mobile-bar';
	className?: string;
};

const variantClasses: Record<BookingEntryProps['variant'], string> = {
	edge: styles.edge,
	menu: styles.menu,
	'mobile-bar': styles.mobileBar
};

export function BookingEntry({ href, label, variant, className }: BookingEntryProps) {
	return (
		<Link
			href={href}
			className={clsx(styles.entry, variantClasses[variant], className)}
			data-booking-entry={variant}
		>
			<span>{label}</span>
			<svg
				className={styles.arrow}
				viewBox="0 0 24 24"
				aria-hidden="true"
				focusable="false"
			>
				<path d="M5 12h14M13 6l6 6-6 6" />
			</svg>
		</Link>
	);
}
