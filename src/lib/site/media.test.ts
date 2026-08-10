import { expect, test } from 'vitest';

import { cinematicMedia } from './media';

test('declares complete responsive metadata for every cinematic media item', () => {
	for (const media of Object.values(cinematicMedia)) {
		expect(media.mobile).not.toBe('');
		expect(media.desktop).not.toBe('');
		expect(media.alt).not.toBe('');
		expect(media.width).toBeTypeOf('number');
		expect(media.width).toBeGreaterThan(0);
		expect(media.height).toBeTypeOf('number');
		expect(media.height).toBeGreaterThan(0);
	}
});

test('uses an intentionally authored mobile crop for the opening hero', () => {
	expect(cinematicMedia.hero.mobile).not.toBe(cinematicMedia.hero.desktop);
});
