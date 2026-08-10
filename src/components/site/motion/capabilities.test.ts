import { afterEach, describe, expect, it, vi } from 'vitest';
import { canUseWebGL, selectMotionMode } from './capabilities';

describe('selectMotionMode', () => {
	it.each([
		{
			name: 'reduced motion',
			input: {
				width: 1440,
				reducedMotion: true,
				saveData: false,
				hardwareConcurrency: 8
			},
			expected: 'static'
		},
		{
			name: 'data saver',
			input: {
				width: 1440,
				reducedMotion: false,
				saveData: true,
				hardwareConcurrency: 8
			},
			expected: 'static'
		},
		{
			name: 'mobile viewport',
			input: {
				width: 767,
				reducedMotion: false,
				saveData: false,
				hardwareConcurrency: 8
			},
			expected: 'native'
		},
		{
			name: 'tablet viewport',
			input: {
				width: 1023,
				reducedMotion: false,
				saveData: false,
				hardwareConcurrency: 8
			},
			expected: 'native'
		},
		{
			name: 'low-powered desktop',
			input: {
				width: 1024,
				reducedMotion: false,
				saveData: false,
				hardwareConcurrency: 2
			},
			expected: 'native'
		},
		{
			name: 'capable desktop',
			input: {
				width: 1024,
				reducedMotion: false,
				saveData: false,
				hardwareConcurrency: 4
			},
			expected: 'cinematic'
		},
		{
			name: 'desktop with an unknown processor count',
			input: {
				width: 1440,
				reducedMotion: false,
				saveData: false,
				hardwareConcurrency: 0
			},
			expected: 'cinematic'
		},
		{
			name: 'desktop with a missing processor count',
			input: {
				width: 1440,
				reducedMotion: false,
				saveData: false,
				hardwareConcurrency: undefined as unknown as number
			},
			expected: 'cinematic'
		}
	])('$name selects $expected', ({ input, expected }) => {
		expect(selectMotionMode(input)).toBe(expected);
	});
});

describe('canUseWebGL', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('does not create a canvas outside cinematic mode', () => {
		const createCanvas = vi.fn();

		expect(canUseWebGL('static', createCanvas)).toBe(false);
		expect(canUseWebGL('native', createCanvas)).toBe(false);
		expect(createCanvas).not.toHaveBeenCalled();
	});

	it('returns false when document is unavailable', () => {
		vi.stubGlobal('document', undefined);

		expect(canUseWebGL('cinematic')).toBe(false);
	});

	it('falls back from webgl2 to webgl', () => {
		const getContext = vi.fn().mockReturnValueOnce(null).mockReturnValueOnce({});

		expect(canUseWebGL('cinematic', () => ({ getContext }))).toBe(true);
		expect(getContext).toHaveBeenNthCalledWith(1, 'webgl2');
		expect(getContext).toHaveBeenNthCalledWith(2, 'webgl');
	});

	it('still tries webgl when probing webgl2 throws', () => {
		const getContext = vi
			.fn()
			.mockImplementationOnce(() => {
				throw new Error('webgl2 failure');
			})
			.mockReturnValueOnce({});

		expect(canUseWebGL('cinematic', () => ({ getContext }))).toBe(true);
		expect(getContext).toHaveBeenNthCalledWith(1, 'webgl2');
		expect(getContext).toHaveBeenNthCalledWith(2, 'webgl');
	});

	it('returns true when webgl2 is available without trying webgl', () => {
		const getContext = vi.fn().mockReturnValue({});

		expect(canUseWebGL('cinematic', () => ({ getContext }))).toBe(true);
		expect(getContext).toHaveBeenCalledOnce();
		expect(getContext).toHaveBeenCalledWith('webgl2');
	});

	it.each([
		['neither context is available', vi.fn().mockReturnValue(null)],
		[
			'context creation throws',
			vi.fn().mockImplementation(() => {
				throw new Error('context failure');
			})
		]
	])('returns false when %s', (_name, getContext) => {
		expect(canUseWebGL('cinematic', () => ({ getContext }))).toBe(false);
	});
});
