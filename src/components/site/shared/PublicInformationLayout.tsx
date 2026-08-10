import type { ReactNode } from 'react';
import styles from './PublicInformationLayout.module.css';

type PublicInformationLayoutProps = {
	intro: string;
	heading: ReactNode;
	description: ReactNode;
	children: ReactNode;
	aside?: ReactNode;
	actions?: ReactNode;
	headingAs?: 'h1' | 'h2';
};

export default function PublicInformationLayout({
	intro,
	heading,
	description,
	children,
	aside,
	actions,
	headingAs = 'h1'
}: PublicInformationLayoutProps) {
	const Heading = headingAs;

	return (
		<section className={styles.section}>
			<div className={styles.frame}>
				<header className={styles.introduction}>
					<p className={styles.intro}>{intro}</p>
					<div className={styles.headingGroup}>
						<Heading className={styles.heading}>{heading}</Heading>
						<p className={styles.description}>{description}</p>
						{actions ? <div className={styles.actions}>{actions}</div> : null}
					</div>
				</header>

				<div className={`${styles.contentGrid} ${aside ? styles.withAside : ''}`}>
					<div className={styles.main}>{children}</div>
					{aside ? <aside className={styles.aside}>{aside}</aside> : null}
				</div>
			</div>
		</section>
	);
}
