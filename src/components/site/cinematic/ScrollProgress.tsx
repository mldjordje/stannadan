'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './ScrollProgress.module.css';

const sceneLabels = ['Dolazak', 'Prelaz', 'Apartmani', 'Detalji', 'Lokacija', 'Utisci', 'Rezervacija'];

export function ScrollProgress() {
	const [activeScene, setActiveScene] = useState(0);
	const activeSceneRef = useRef(0);

	useEffect(() => {
		const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-cinematic-scene]'));

		if (scenes.length === 0) {
			return undefined;
		}

		let frameId: number | undefined;
		const update = () => {
			frameId = undefined;
			const marker = window.innerHeight * 0.48;
			let nextScene = 0;
			const heroRect = scenes[0].getBoundingClientRect();

			if (heroRect.top <= marker && heroRect.bottom > marker) {
				const heroTravel = Math.max(1, heroRect.height - window.innerHeight);
				const heroProgress = Math.min(1, Math.max(0, -heroRect.top / heroTravel));

				nextScene = heroProgress >= 0.45 ? 1 : 0;
			} else {
				scenes.slice(1).forEach((scene, index) => {
					if (scene.getBoundingClientRect().top <= marker) {
						nextScene = index + 2;
					}
				});
			}

			if (nextScene !== activeSceneRef.current) {
				activeSceneRef.current = nextScene;
				setActiveScene(nextScene);
			}
		};

		const requestUpdate = () => {
			if (frameId === undefined) {
				frameId = window.requestAnimationFrame(update);
			}
		};

		window.addEventListener('scroll', requestUpdate, { passive: true });
		window.addEventListener('resize', requestUpdate);
		update();

		return () => {
			window.removeEventListener('scroll', requestUpdate);
			window.removeEventListener('resize', requestUpdate);

			if (frameId !== undefined) {
				window.cancelAnimationFrame(frameId);
			}
		};
	}, []);

	return (
		<>
			<div
				className={styles.rail}
				aria-hidden="true"
			>
				{sceneLabels.map((label, index) => (
					<span
						key={label}
						className={index === activeScene ? styles.active : undefined}
					/>
				))}
			</div>
			<p
				className={styles.srStatus}
				aria-live="polite"
				aria-atomic="true"
			>
				Scena {activeScene + 1} od {sceneLabels.length}: {sceneLabels[activeScene]}
			</p>
		</>
	);
}
