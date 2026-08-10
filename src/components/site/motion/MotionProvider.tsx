'use client';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { canUseWebGL, selectMotionMode, type MotionMode } from './capabilities';

export type MotionState = {
	mode: MotionMode;
	webGL: boolean;
	ready: boolean;
};

export type MotionProviderProps = PropsWithChildren<{
	className?: string;
}>;

type NavigatorWithConnection = Navigator & {
	connection?: {
		saveData?: boolean;
	};
};

const INITIAL_MOTION_STATE: MotionState = {
	mode: 'static',
	webGL: false,
	ready: false
};

const MotionContext = createContext<MotionState>(INITIAL_MOTION_STATE);

// Context consumers live with their provider so the public runtime has one import surface.
// eslint-disable-next-line react-refresh/only-export-components
export function useMotion(): MotionState {
	return useContext(MotionContext);
}

export function MotionProvider({ children, className }: MotionProviderProps) {
	const [motion, setMotion] = useState<MotionState>(INITIAL_MOTION_STATE);

	useEffect(() => {
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const desktopQuery = window.matchMedia('(min-width: 1024px)');

		const updateCapabilities = () => {
			const browserNavigator = navigator as NavigatorWithConnection;
			const mode = selectMotionMode({
				width: window.innerWidth,
				reducedMotion: reducedMotionQuery.matches,
				saveData: browserNavigator.connection?.saveData === true,
				hardwareConcurrency: browserNavigator.hardwareConcurrency
			});

			setMotion({ mode, webGL: canUseWebGL(mode), ready: true });
		};

		updateCapabilities();
		reducedMotionQuery.addEventListener('change', updateCapabilities);
		desktopQuery.addEventListener('change', updateCapabilities);

		return () => {
			reducedMotionQuery.removeEventListener('change', updateCapabilities);
			desktopQuery.removeEventListener('change', updateCapabilities);
		};
	}, []);

	useEffect(() => {
		if (motion.mode !== 'cinematic') {
			return undefined;
		}

		let active = true;
		let frameId: number | undefined;
		let lenisInstance: InstanceType<(typeof import('lenis'))['default']> | undefined;

		void import('lenis')
			.then(({ default: Lenis }) => {
				if (!active) {
					return;
				}

				lenisInstance = new Lenis();

				const animate = (time: number) => {
					if (!active || !lenisInstance) {
						return;
					}

					lenisInstance.raf(time);
					frameId = requestAnimationFrame(animate);
				};

				frameId = requestAnimationFrame(animate);
			})
			.catch(() => undefined);

		return () => {
			active = false;

			if (frameId !== undefined) {
				cancelAnimationFrame(frameId);
			}

			lenisInstance?.destroy();
		};
	}, [motion.mode]);

	return (
		<MotionContext.Provider value={motion}>
			<div
				className={className}
				data-motion-mode={motion.mode}
				data-motion-ready={motion.ready}
			>
				{children}
			</div>
		</MotionContext.Provider>
	);
}
