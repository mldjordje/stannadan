'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const adminTheme = createTheme({
	cssVariables: true,
	palette: {
		mode: 'light',
		primary: { main: '#315cf0' },
		background: { default: '#f2f0eb', paper: '#ffffff' },
		text: { primary: '#111312', secondary: '#676a64' }
	},
	shape: { borderRadius: 0 },
	typography: {
		fontFamily: 'var(--site-font-ui), Arial, sans-serif',
		button: { textTransform: 'none', fontWeight: 700 }
	}
});

export default function App({ children }: { children?: React.ReactNode }) {
	return (
		<AppRouterCacheProvider options={{ key: 'mui', enableCssLayer: true }}>
			<ThemeProvider theme={adminTheme}>{children}</ThemeProvider>
		</AppRouterCacheProvider>
	);
}
