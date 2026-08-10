'use client';

import { useEffect, useRef, type DependencyList, type RefObject } from 'react';
import { useMotion } from './MotionProvider';
import type { MotionMode } from './capabilities';

export type CinematicGsap = (typeof import('gsap'))['gsap'];
export type CinematicScrollTrigger = (typeof import('gsap/ScrollTrigger'))['ScrollTrigger'];

export type CinematicSceneContext<T extends HTMLElement = HTMLElement> = {
	gsap: CinematicGsap;
	ScrollTrigger: CinematicScrollTrigger;
	element: T;
	mode: Exclude<MotionMode, 'static'>;
};

export type CinematicSceneFactory<T extends HTMLElement = HTMLElement> = (context: CinematicSceneContext<T>) => void;

const registeredScrollTriggers = new WeakSet<object>();

export function useCinematicScene<T extends HTMLElement>(
	ref: RefObject<T | null>,
	createTimeline: CinematicSceneFactory<T>,
	dependencies: DependencyList = []
): void {
	const { mode } = useMotion();
	const createTimelineRef = useRef(createTimeline);

	createTimelineRef.current = createTimeline;

	useEffect(() => {
		if (mode === 'static') {
			return undefined;
		}

		const element = ref.current;

		if (!element) {
			return undefined;
		}

		let active = true;
		let cleanupScene: (() => void) | undefined;

		void Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
			.then(([gsapModule, scrollTriggerModule]) => {
				if (!active) {
					return;
				}

				const gsap = gsapModule.gsap ?? gsapModule.default;
				const ScrollTrigger = scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default;
				const plugin = ScrollTrigger as unknown as object;

				if (!registeredScrollTriggers.has(plugin)) {
					gsap.registerPlugin(ScrollTrigger);
					registeredScrollTriggers.add(plugin);
				}

				const existingTriggers = new Set(ScrollTrigger.getAll());
				let createdTriggers: ReturnType<CinematicScrollTrigger['getAll']> = [];
				const context = gsap.context(() => {
					createTimelineRef.current({ gsap, ScrollTrigger, element, mode });
					createdTriggers = ScrollTrigger.getAll().filter((trigger) => !existingTriggers.has(trigger));
				}, element);

				cleanupScene = () => {
					context.revert();
					createdTriggers.forEach((trigger) => trigger.kill());
				};
			})
			.catch(() => undefined);

		return () => {
			active = false;
			cleanupScene?.();
		};
		// The caller-provided dependency list intentionally controls scene reconstruction.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, ref, ...dependencies]);
}
