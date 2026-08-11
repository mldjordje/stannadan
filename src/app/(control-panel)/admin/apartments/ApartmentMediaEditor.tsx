'use client';

import styles from './ApartmentMediaEditor.module.css';

export type ApartmentMediaValue = { coverImage: string; gallery: string[] };
type Props = ApartmentMediaValue & {
	uploading: boolean;
	onUpload: (files: FileList | null) => void;
	onChange: (value: ApartmentMediaValue) => void;
};

export default function ApartmentMediaEditor({ coverImage, gallery, uploading, onUpload, onChange }: Props) {
	const media = [...new Set([coverImage, ...gallery].filter(Boolean))];

	function setCover(url: string) {
		onChange({
			coverImage: url,
			gallery: media.filter((item) => item !== url)
		});
	}

	function remove(url: string) {
		const remaining = media.filter((item) => item !== url);
		const nextCover = url === coverImage ? (remaining[0] ?? '') : coverImage;
		onChange({
			coverImage: nextCover,
			gallery: remaining.filter((item) => item !== nextCover)
		});
	}

	function move(url: string, offset: number) {
		const ordered = media.filter((item) => item !== coverImage);
		const index = ordered.indexOf(url);
		const destination = index + offset;

		if (index < 0 || destination < 0 || destination >= ordered.length) return;

		const next = [...ordered];
		[next[index], next[destination]] = [next[destination], next[index]];
		onChange({ coverImage, gallery: next });
	}

	return (
		<div className={styles.editor}>
			<div className={styles.top}>
				<p>Naslovna slika je prva na javnoj stranici. Redosled ostalih prati galeriju.</p>
				<label className={styles.upload}>
					{uploading ? 'Otpremanje…' : '+ Dodaj fotografije'}
					<input
						hidden
						multiple
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						disabled={uploading}
						onChange={(event) => {
							onUpload(event.target.files);
							event.target.value = '';
						}}
					/>
				</label>
			</div>
			{media.length ? (
				<div
					className={styles.grid}
					aria-live="polite"
				>
					{media.map((url) => {
						const isCover = url === coverImage;
						const index = gallery.indexOf(url);
						return (
							<article
								key={url}
								className={styles.item}
							>
								<div className={styles.preview}>
									<img
										src={url}
										alt="Pregled fotografije apartmana"
									/>
									{isCover ? <span>Naslovna</span> : null}
								</div>
								<div className={styles.controls}>
									<button
										type="button"
										disabled={isCover || index <= 0}
										onClick={() => move(url, -1)}
										aria-label="Pomeri fotografiju ranije"
									>
										←
									</button>
									<button
										type="button"
										disabled={isCover || index < 0 || index === gallery.length - 1}
										onClick={() => move(url, 1)}
										aria-label="Pomeri fotografiju kasnije"
									>
										→
									</button>
									<button
										type="button"
										disabled={isCover}
										onClick={() => setCover(url)}
										aria-label="Postavi kao naslovnu fotografiju"
									>
										Naslovna
									</button>
									<button
										type="button"
										disabled={media.length === 1}
										onClick={() => remove(url)}
										aria-label="Ukloni fotografiju"
									>
										Ukloni
									</button>
								</div>
							</article>
						);
					})}
				</div>
			) : (
				<p className={styles.empty}>Dodajte prvu fotografiju apartmana.</p>
			)}
		</div>
	);
}
