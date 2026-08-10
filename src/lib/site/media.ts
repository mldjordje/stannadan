export type CinematicMedia = {
	readonly mobile: string;
	readonly desktop: string;
	readonly alt: string;
	readonly width: number;
	readonly height: number;
};

export const cinematicMedia = {
	hero: {
		mobile: '/site-assets/images/cinematic/hero-main-720.webp',
		desktop: '/site-assets/images/cinematic/kitchen-tv-1920.webp',
		alt: 'Toplo osvetljen enterijer apartmana u Nišu',
		width: 1920,
		height: 1440
	},
	kitchen: {
		mobile: '/site-assets/images/cinematic/kitchen-tv-960.webp',
		desktop: '/site-assets/images/cinematic/kitchen-tv-1920.webp',
		alt: 'Kuhinja i dnevni prostor apartmana',
		width: 1920,
		height: 1440
	},
	living: {
		mobile: '/site-assets/images/cinematic/living-room-720.webp',
		desktop: '/site-assets/images/cinematic/living-room-1280.webp',
		alt: 'Dnevni boravak sa dubokim plavim svetlom',
		width: 1280,
		height: 1707
	},
	studio: {
		mobile: '/site-assets/images/cinematic/studio-vertical-720.webp',
		desktop: '/site-assets/images/cinematic/studio-vertical-1600.webp',
		alt: 'Studio apartman sa radnim i spavaćim prostorom',
		width: 1600,
		height: 1200
	}
} as const satisfies Record<string, CinematicMedia>;
