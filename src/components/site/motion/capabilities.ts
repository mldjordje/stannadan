export type MotionMode = 'static' | 'native' | 'cinematic';

export type MotionCapabilityInput = {
	width: number;
	reducedMotion: boolean;
	saveData: boolean;
	hardwareConcurrency: number;
};

export type WebGLCanvas = {
	getContext(contextId: 'webgl2' | 'webgl'): unknown;
};

export type WebGLCanvasFactory = () => WebGLCanvas;

const DESKTOP_BREAKPOINT = 1024;
const MINIMUM_CINEMATIC_PROCESSORS = 4;
const DEFAULT_PROCESSOR_COUNT = 4;

export function selectMotionMode(input: MotionCapabilityInput): MotionMode {
	if (input.reducedMotion || input.saveData) {
		return 'static';
	}

	if (input.width < DESKTOP_BREAKPOINT) {
		return 'native';
	}

	const processorCount =
		Number.isFinite(input.hardwareConcurrency) && input.hardwareConcurrency > 0
			? input.hardwareConcurrency
			: DEFAULT_PROCESSOR_COUNT;

	return processorCount < MINIMUM_CINEMATIC_PROCESSORS ? 'native' : 'cinematic';
}

export function canUseWebGL(mode: MotionMode, createCanvas?: WebGLCanvasFactory): boolean {
	if (mode !== 'cinematic') {
		return false;
	}

	if (!createCanvas && typeof document === 'undefined') {
		return false;
	}

	let canvas: WebGLCanvas;

	try {
		canvas = createCanvas ? createCanvas() : document.createElement('canvas');
	} catch {
		return false;
	}

	try {
		if (canvas.getContext('webgl2')) {
			return true;
		}
	} catch {
		// Some browsers throw for unsupported context types; WebGL 1 may still work.
	}

	try {
		return Boolean(canvas.getContext('webgl'));
	} catch {
		return false;
	}
}
