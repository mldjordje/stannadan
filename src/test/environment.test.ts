import { expect, test } from 'vitest';

import { setMediaQuery } from './setup';

test('provides deterministic browser observer and media-query APIs', () => {
	expect(window.matchMedia).toBeTypeOf('function');
	expect(ResizeObserver).toBeTypeOf('function');
	expect(IntersectionObserver).toBeTypeOf('function');
});

test('allows a later media-query consumer to use a chosen match', () => {
	expect(setMediaQuery(true)).toMatchObject({ matches: true });
	expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true);
});

test('resets media-query matches after each test', () => {
	expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false);
});
