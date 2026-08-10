import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const cinematicDirectory = path.join(repositoryRoot, 'public', 'site-assets', 'images', 'cinematic');
const expectedFiles = [
	'hero-main-720.webp',
	'hero-main-1280.webp',
	'kitchen-tv-960.webp',
	'kitchen-tv-1920.webp',
	'living-room-720.webp',
	'living-room-1280.webp',
	'studio-vertical-720.webp',
	'studio-vertical-1600.webp'
];

const firstSceneMobileCandidates = ['hero-main-720.webp'];
const heroMobileLimit = 800 * 1024;
const kitchenDesktopLimit = 1.5 * 1024 * 1024;
const firstSceneMobileLimit = 800 * 1024;

const sizes = new Map();
const missingFiles = [];

for (const filename of expectedFiles) {
	try {
		const details = await stat(path.join(cinematicDirectory, filename));
		sizes.set(filename, details.size);
		console.log(`${filename}: ${details.size} bytes`);
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
			missingFiles.push(filename);
			continue;
		}

		throw error;
	}
}

if (missingFiles.length > 0) {
	throw new Error(`Missing generated cinematic media: ${missingFiles.join(', ')}. Run npm run media:prepare.`);
}

const firstSceneMobileBytes = firstSceneMobileCandidates.reduce(
	(total, filename) => total + sizes.get(filename),
	0
);
const violations = [];

if (sizes.get('hero-main-720.webp') > heroMobileLimit) {
	violations.push(`hero-main-720.webp exceeds ${heroMobileLimit} bytes`);
}

if (sizes.get('kitchen-tv-1920.webp') > kitchenDesktopLimit) {
	violations.push(`kitchen-tv-1920.webp exceeds ${kitchenDesktopLimit} bytes`);
}

if (firstSceneMobileBytes > firstSceneMobileLimit) {
	violations.push(
		`first-scene mobile candidates (${firstSceneMobileCandidates.join(', ')}) exceed ${firstSceneMobileLimit} bytes`
	);
}

if (violations.length > 0) {
	throw new Error(`Cinematic media budget exceeded: ${violations.join('; ')}`);
}

console.log(
	`Cinematic media budget passed: ${expectedFiles.length} files; first-scene mobile ${firstSceneMobileBytes} bytes.`
);
