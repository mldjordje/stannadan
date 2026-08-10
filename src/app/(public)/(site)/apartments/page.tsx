import { EditorialApartmentIndex } from '@/components/site/cinematic/EditorialApartmentIndex';
import EditorialPageIntro from '@/components/site/shared/EditorialPageIntro';
import { readStayData } from '@/lib/stay/store';

export default async function ApartmentsPage() {
	const data = await readStayData();

	return (
		<>
			<EditorialPageIntro
				kicker="Apartmani u Nišu"
				title="Izaberite svoj ritam grada."
				description="Tri pažljivo uređena prostora za miran san, sporije jutro i grad koji vam je nadohvat koraka."
			/>
			<EditorialApartmentIndex apartments={data.apartments} />
		</>
	);
}
