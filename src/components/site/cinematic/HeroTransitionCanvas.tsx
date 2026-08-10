'use client';

import { useEffect, useRef } from 'react';
import { useMotion } from '@/components/site/motion/MotionProvider';
import styles from './HeroSequence.module.css';

type HeroTransitionCanvasProps = {
	from: string;
	to: string;
};

export function HeroTransitionCanvas({ from, to }: HeroTransitionCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { mode, webGL } = useMotion();

	useEffect(() => {
		if (mode !== 'cinematic' || !webGL || !canvasRef.current) {
			return undefined;
		}

		const canvas = canvasRef.current;
		const sceneSection = canvas.closest<HTMLElement>('[data-hero-sequence]');

		if (!sceneSection) {
			return undefined;
		}

		let active = true;
		let frameId: number | undefined;
		let disposeThree: (() => void) | undefined;

		void import('three')
			.then(async (THREE) => {
				if (!active) {
					return;
				}

				const renderer = new THREE.WebGLRenderer({
					canvas,
					alpha: true,
					antialias: false
				});
				const textureLoader = new THREE.TextureLoader();
				const [fromTexture, toTexture] = await Promise.all([
					textureLoader.loadAsync(from),
					textureLoader.loadAsync(to)
				]);

				if (!active) {
					fromTexture.dispose();
					toTexture.dispose();
					renderer.dispose();
					return;
				}

				fromTexture.colorSpace = THREE.SRGBColorSpace;
				toTexture.colorSpace = THREE.SRGBColorSpace;
				const scene = new THREE.Scene();
				const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
				const geometry = new THREE.PlaneGeometry(2, 2);
				const material = new THREE.ShaderMaterial({
					transparent: true,
					uniforms: {
						fromTexture: { value: fromTexture },
						toTexture: { value: toTexture },
						progress: { value: 0 }
					},
					vertexShader: `
						varying vec2 vUv;
						void main() {
							vUv = uv;
							gl_Position = vec4(position, 1.0);
						}
					`,
					fragmentShader: `
						uniform sampler2D fromTexture;
						uniform sampler2D toTexture;
						uniform float progress;
						varying vec2 vUv;
						float noise(vec2 point) {
							return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
						}
						void main() {
							float grain = noise(floor(vUv * 96.0)) * 0.08;
							float edge = smoothstep(progress - 0.22, progress + 0.22, vUv.x + grain);
							vec2 drift = vec2((progress - 0.5) * 0.035, 0.0);
							vec4 first = texture2D(fromTexture, vUv + drift * (1.0 - edge));
							vec4 second = texture2D(toTexture, vUv - drift * edge);
							gl_FragColor = mix(second, first, edge);
						}
					`
				});
				const mesh = new THREE.Mesh(geometry, material);

				scene.add(mesh);

				const render = () => {
					frameId = undefined;
					const rect = sceneSection.getBoundingClientRect();
					const travel = Math.max(1, rect.height - window.innerHeight);
					const progress = Math.min(1, Math.max(0, -rect.top / travel));

					material.uniforms.progress.value = Math.min(1, Math.max(0, (progress - 0.38) / 0.48));
					renderer.render(scene, camera);
				};

				const requestRender = () => {
					if (frameId === undefined) {
						frameId = window.requestAnimationFrame(render);
					}
				};

				const resize = () => {
					renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
					renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
					requestRender();
				};

				window.addEventListener('scroll', requestRender, { passive: true });
				window.addEventListener('resize', resize);
				resize();
				disposeThree = () => {
					window.removeEventListener('scroll', requestRender);
					window.removeEventListener('resize', resize);

					if (frameId !== undefined) {
						window.cancelAnimationFrame(frameId);
					}

					geometry.dispose();
					material.dispose();
					fromTexture.dispose();
					toTexture.dispose();
					renderer.dispose();
				};
			})
			.catch(() => undefined);

		return () => {
			active = false;
			disposeThree?.();
		};
	}, [from, mode, to, webGL]);

	return (
		<canvas
			ref={canvasRef}
			className={styles.transitionCanvas}
			aria-hidden="true"
		/>
	);
}
