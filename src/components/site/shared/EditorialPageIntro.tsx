import Image from 'next/image';
import styles from './EditorialPageIntro.module.css';

type EditorialPageIntroImage = {
	src: string;
	alt: string;
	width: number;
	height: number;
	priority?: boolean;
};

type EditorialPageIntroProps = {
	kicker: string;
	title: string;
	description: string;
	image?: EditorialPageIntroImage;
};

function EditorialPageIntro({ kicker, title, description, image }: EditorialPageIntroProps) {
	return (
		<section className={styles.section}>
			<div className={`${styles.intro} ${image ? styles.withImage : styles.textOnly}`}>
				<div className={styles.copy}>
					<p className={styles.kicker}>{kicker}</p>
					<h1 className={styles.title}>{title}</h1>
					<p className={styles.description}>{description}</p>
				</div>

				{image ? (
					<div className={styles.media}>
						<Image
							className={styles.image}
							src={image.src}
							alt={image.alt}
							width={image.width}
							height={image.height}
							priority={image.priority}
							sizes="(min-width: 64rem) 58vw, 100vw"
						/>
					</div>
				) : null}
			</div>
		</section>
	);
}

export default EditorialPageIntro;
