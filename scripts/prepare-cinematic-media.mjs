import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import sharp from 'sharp';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const sourceDirectory = path.join(repositoryRoot, 'public', 'site-assets', 'images', 'custom');
const destinationDirectory = path.join(repositoryRoot, 'public', 'site-assets', 'images', 'cinematic');

const mediaJobs = [
	{ source: 'hero-main.jpeg', output: 'hero-main-720.webp', width: 720 },
	{ source: 'hero-main.jpeg', output: 'hero-main-1280.webp', width: 1280 },
	{ source: 'kitchen-tv.jpeg', output: 'kitchen-tv-960.webp', width: 960 },
	{ source: 'kitchen-tv.jpeg', output: 'kitchen-tv-1920.webp', width: 1920 },
	{ source: 'living-room.jpeg', output: 'living-room-720.webp', width: 720 },
	{ source: 'living-room.jpeg', output: 'living-room-1280.webp', width: 1280 },
	{ source: 'studio-vertical.jpeg', output: 'studio-vertical-720.webp', width: 720 },
	{ source: 'studio-vertical.jpeg', output: 'studio-vertical-1600.webp', width: 1600 }
];

await mkdir(destinationDirectory, { recursive: true });

for (const mediaJob of mediaJobs) {
	const sourcePath = path.join(sourceDirectory, mediaJob.source);
	const outputPath = path.join(destinationDirectory, mediaJob.output);

	try {
		await sharp(sourcePath)
			.rotate()
			.resize({ width: mediaJob.width, withoutEnlargement: true })
			.webp({ quality: 78, effort: 5 })
			.toFile(outputPath);
		console.log(`Prepared ${mediaJob.output}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to prepare ${mediaJob.source} -> ${mediaJob.output}: ${message}`, {
			cause: error
		});
	}
}
