import { useRef } from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MotionProvider } from './MotionProvider';
import { useCinematicScene, type CinematicSceneFactory } from './useCinematicScene';

const {
	cancelAnimationFrameMock,
	createdTriggerKill,
	gsapContext,
	gsapContextRevert,
	gsapModuleLoaded,
	gsapRegisterPlugin,
	lenisConstructor,
	lenisDestroy,
	lenisRaf,
	requestAnimationFrameMock,
	scrollTriggerGetAll
} = vi.hoisted(() => ({
	cancelAnimationFrameMock: vi.fn(),
	createdTriggerKill: vi.fn(),
	gsapContext: vi.fn(),
	gsapContextRevert: vi.fn(),
	gsapModuleLoaded: vi.fn(),
	gsapRegisterPlugin: vi.fn(),
	lenisConstructor: vi.fn(),
	lenisDestroy: vi.fn(),
	lenisRaf: vi.fn(),
	requestAnimationFrameMock: vi.fn(() => 1),
	scrollTriggerGetAll: vi.fn()
}));

vi.mock('lenis', () => ({
	default: class LenisMock {
		constructor() {
			lenisConstructor();
		}

		raf = lenisRaf;
		destroy = lenisDestroy;
	}
}));

vi.mock('gsap', () => {
	gsapModuleLoaded();
	const gsap = { context: gsapContext, registerPlugin: gsapRegisterPlugin };

	return { default: gsap, gsap };
});

vi.mock('gsap/ScrollTrigger', () => {
	const ScrollTrigger = { getAll: scrollTriggerGetAll };

	return { default: ScrollTrigger, ScrollTrigger };
});

const originalMatchMedia = window.matchMedia;

function configureBrowser({
	width,
	reducedMotion = false,
	saveData = false,
	hardwareConcurrency = 8
}: {
	width: number;
	reducedMotion?: boolean;
	saveData?: boolean;
	hardwareConcurrency?: number;
}) {
	Object.defineProperty(window, 'innerWidth', {
		configurable: true,
		value: width
	});
	Object.defineProperty(navigator, 'hardwareConcurrency', {
		configurable: true,
		value: hardwareConcurrency
	});
	Object.defineProperty(navigator, 'connection', {
		configurable: true,
		value: { saveData }
	});

	window.matchMedia = vi.fn((query: string) => {
		const matches = query === '(prefers-reduced-motion: reduce)' ? reducedMotion : width >= 1024;

		return {
			matches,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(() => true)
		} as MediaQueryList;
	});

	vi.stubGlobal('requestAnimationFrame', requestAnimationFrameMock);
	vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
	requestAnimationFrameMock.mockReturnValue(1);
}

afterEach(() => {
	delete (navigator as Navigator & { connection?: unknown }).connection;
	delete (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency;
	window.matchMedia = originalMatchMedia;
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	vi.clearAllMocks();
});

describe('MotionProvider', () => {
	it('always renders its children and exposes the initial safe state', () => {
		configureBrowser({ width: 768 });
		const serverMarkup = renderToString(
			<MotionProvider>
				<span>Server-rendered content</span>
			</MotionProvider>
		);
		const { container } = render(
			<MotionProvider>
				<span>Server-rendered content</span>
			</MotionProvider>
		);

		expect(serverMarkup).toContain('data-motion-mode="static"');
		expect(serverMarkup).toContain('data-motion-ready="false"');
		expect(serverMarkup).toContain('Server-rendered content');
		expect(screen.getByText('Server-rendered content')).toBeVisible();
		expect(container.firstElementChild).toHaveAttribute('data-motion-mode');
		expect(container.firstElementChild).toHaveAttribute('data-motion-ready');
	});

	it('keeps reduced-motion users static without initializing Lenis', async () => {
		configureBrowser({ width: 1440, reducedMotion: true });
		const { container } = render(<MotionProvider>Content</MotionProvider>);

		await waitFor(() => expect(container.firstElementChild).toHaveAttribute('data-motion-ready', 'true'));
		expect(container.firstElementChild).toHaveAttribute('data-motion-mode', 'static');
		expect(lenisConstructor).not.toHaveBeenCalled();
	});

	it('selects cinematic motion and initializes Lenis on a capable desktop', async () => {
		configureBrowser({ width: 1440, hardwareConcurrency: 8 });
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as RenderingContext);
		const { container } = render(<MotionProvider>Content</MotionProvider>);

		await waitFor(() => expect(container.firstElementChild).toHaveAttribute('data-motion-mode', 'cinematic'));
		await waitFor(() => expect(lenisConstructor).toHaveBeenCalledOnce());
	});

	it('uses native motion on mobile without initializing Lenis', async () => {
		configureBrowser({ width: 768, hardwareConcurrency: 8 });
		const { container } = render(<MotionProvider>Content</MotionProvider>);

		await waitFor(() => expect(container.firstElementChild).toHaveAttribute('data-motion-mode', 'native'));
		expect(lenisConstructor).not.toHaveBeenCalled();
	});
});

function Scene({ createTimeline }: { createTimeline: CinematicSceneFactory }) {
	const ref = useRef<HTMLDivElement>(null);

	useCinematicScene(ref, createTimeline);

	return <div ref={ref}>Scene</div>;
}

describe('useCinematicScene', () => {
	it('does not load GSAP for static motion', async () => {
		configureBrowser({ width: 1440, reducedMotion: true });
		const createTimeline = vi.fn();
		const { container } = render(
			<MotionProvider>
				<Scene createTimeline={createTimeline} />
			</MotionProvider>
		);

		await waitFor(() => expect(container.firstElementChild).toHaveAttribute('data-motion-ready', 'true'));
		expect(gsapModuleLoaded).not.toHaveBeenCalled();
		expect(createTimeline).not.toHaveBeenCalled();
	});

	it('scopes a native scene and cleans up only the triggers it created', async () => {
		configureBrowser({ width: 768 });
		const createdTrigger = { kill: createdTriggerKill };
		const createTimeline = vi.fn();
		gsapContext.mockImplementation((callback: () => void) => {
			callback();

			return { revert: gsapContextRevert };
		});
		scrollTriggerGetAll.mockReturnValueOnce([]).mockReturnValueOnce([createdTrigger]);
		const { unmount } = render(
			<MotionProvider>
				<Scene createTimeline={createTimeline} />
			</MotionProvider>
		);

		await waitFor(() => expect(createTimeline).toHaveBeenCalledOnce());
		unmount();

		expect(gsapContextRevert).toHaveBeenCalledOnce();
		expect(createdTriggerKill).toHaveBeenCalledOnce();
	});
});
