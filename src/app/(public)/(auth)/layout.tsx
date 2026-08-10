import { Instrument_Serif } from 'next/font/google';
import './auth-public.css';

const instrumentSerif = Instrument_Serif({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-instrument',
	display: 'swap'
});

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <div className={`${instrumentSerif.variable} auth-public`}>{children}</div>;
}
