'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import StarIcon from '@mui/icons-material/StarOutline';
import UploadIcon from '@mui/icons-material/CloudUploadOutlined';
import { Button, Chip, IconButton, Paper, Stack, Typography } from '@mui/material';

export type ApartmentMediaValue = {
	coverImage: string;
	gallery: string[];
};

type ApartmentMediaEditorProps = ApartmentMediaValue & {
	uploading: boolean;
	onUpload: (files: FileList | null) => void;
	onChange: (value: ApartmentMediaValue) => void;
};

export default function ApartmentMediaEditor({
	coverImage,
	gallery,
	uploading,
	onUpload,
	onChange
}: ApartmentMediaEditorProps) {
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
		<Stack spacing={2}>
			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				justifyContent="space-between"
				gap={1.5}
			>
				<div>
					<Typography fontWeight={700}>Fotografije apartmana</Typography>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Izaberi naslovnu sliku, promeni redosled ili ukloni fotografiju pre čuvanja.
					</Typography>
				</div>
				<Button
					component="label"
					variant="outlined"
					startIcon={<UploadIcon />}
					disabled={uploading}
				>
					{uploading ? 'Otpremanje…' : 'Dodaj fotografije'}
					<input
						hidden
						multiple
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						onChange={(event) => {
							onUpload(event.target.files);
							event.target.value = '';
						}}
					/>
				</Button>
			</Stack>

			{media.length ? (
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
						gap: 16
					}}
					aria-live="polite"
				>
					{media.map((url) => {
						const isCover = url === coverImage;
						const galleryIndex = gallery.indexOf(url);
						return (
							<Paper
								key={url}
								variant="outlined"
								sx={{ overflow: 'hidden', borderRadius: 2 }}
							>
								<div
									style={{
										position: 'relative',
										aspectRatio: '4 / 3',
										background: '#e9e9e9'
									}}
								>
									<img
										src={url}
										alt="Pregled fotografije apartmana"
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover'
										}}
									/>
									{isCover ? (
										<Chip
											label="Naslovna"
											size="small"
											color="primary"
											sx={{ position: 'absolute', top: 8, left: 8 }}
										/>
									) : null}
								</div>
								<Stack
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									padding={0.75}
								>
									<div>
										<IconButton
											size="small"
											disabled={isCover || galleryIndex <= 0}
											onClick={() => move(url, -1)}
											aria-label="Pomeri fotografiju ranije"
										>
											<ArrowBackIcon fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											disabled={
												isCover || galleryIndex < 0 || galleryIndex === gallery.length - 1
											}
											onClick={() => move(url, 1)}
											aria-label="Pomeri fotografiju kasnije"
										>
											<ArrowForwardIcon fontSize="small" />
										</IconButton>
									</div>
									<div>
										<IconButton
											size="small"
											disabled={isCover}
											onClick={() => setCover(url)}
											aria-label="Postavi kao naslovnu fotografiju"
										>
											<StarIcon fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											disabled={media.length === 1}
											onClick={() => remove(url)}
											aria-label="Ukloni fotografiju"
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</div>
								</Stack>
							</Paper>
						);
					})}
				</div>
			) : (
				<Paper
					variant="outlined"
					sx={{ borderStyle: 'dashed', padding: 3, textAlign: 'center' }}
				>
					<Typography color="text.secondary">Dodaj prvu fotografiju apartmana.</Typography>
				</Paper>
			)}
		</Stack>
	);
}
