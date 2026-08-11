import Reveal from './Reveal';

type SceneHeadProps = {
	num: string;
	kicker?: string;
	title: React.ReactNode;
	sub?: string;
	aside?: React.ReactNode;
};

/** Numbered section opener used by every scene on the site. */
function SceneHead({ num, kicker, title, sub, aside }: SceneHeadProps) {
	return (
		<div className="snd-scene-head">
			<Reveal>
				<span className="snd-scene-num">{num}</span>
				{kicker ? (
					<span
						className="snd-eyebrow is-muted"
						style={{ display: 'block', marginTop: 16 }}
					>
						{kicker}
					</span>
				) : null}
			</Reveal>
			<Reveal delay={1}>
				<h2 className="snd-scene-title">{title}</h2>
				{sub ? <p className="snd-scene-sub">{sub}</p> : null}
				{aside}
			</Reveal>
		</div>
	);
}

export default SceneHead;
