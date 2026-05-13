import { readStayData } from '@/lib/stay/store';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
	const data = await readStayData();
	return <HomePageClient property={data.property} apartments={data.apartments} />;
}
