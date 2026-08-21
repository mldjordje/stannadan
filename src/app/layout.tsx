import clsx from 'clsx';
import 'src/styles/splash-screen.css';
import 'src/styles/index.css';
import '../../public/assets/fonts/material-design-icons/MaterialIconsOutlined.css';
import '../../public/assets/fonts/Geist/geist.css';
import '../../public/assets/fonts/meteocons/style.css';
import '../../public/assets/styles/prism.css';
import { SessionProvider } from 'next-auth/react';
import type { Metadata } from 'next';
import { auth } from '@auth/authJs';
import App from './App';

import { siteUrl } from '@/lib/site';

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: 'Stan na Dan Niš | Apartmani u Nišu',
	description: 'Pažljivo uređeni apartmani za udoban boravak u Nišu, uz direktan kontakt sa domaćinom.',
	robots: 'follow, index',
	alternates: { canonical: '/' },
	icons: { icon: '/site-assets/images/logo/favicon.png' },
	openGraph: {
		title: 'Stan na Dan Niš | Apartmani u Nišu',
		description: 'Pažljivo uređeni apartmani za udoban boravak u Nišu, uz direktan kontakt sa domaćinom.',
		images: ['/card.png'],
		type: 'website'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Stan na Dan Niš | Apartmani u Nišu',
		description: 'Pažljivo uređeni apartmani za udoban boravak u Nišu, uz direktan kontakt sa domaćinom.',
		images: ['/card.png']
	}
};

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	return (
		<html lang="sr-Latn">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, shrink-to-fit=no"
				/>
				<meta
					name="theme-color"
					content="#000000"
				/>
				<base href="/" />
				{/*
					manifest.json provides metadata used when your web app is added to the
					homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
				*/}
				<link
					rel="manifest"
					href="/manifest.json"
				/>
				<link
					rel="shortcut icon"
					href="/favicon.ico"
				/>
				<noscript id="emotion-insertion-point" />
			</head>
			<body
				id="root"
				className={clsx('loading')}
			>
				<SessionProvider
					basePath="/auth"
					session={session}
				>
					<App>{children}</App>
				</SessionProvider>
			</body>
		</html>
	);
}
