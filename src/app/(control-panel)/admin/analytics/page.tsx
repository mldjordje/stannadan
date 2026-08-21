import { redirect } from 'next/navigation';
import { Box, Grid, Stack, Typography } from '@mui/material';
import EuroIcon from '@mui/icons-material/EuroOutlined';
import HotelIcon from '@mui/icons-material/HotelOutlined';
import PercentIcon from '@mui/icons-material/PercentOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import { ApartmentRevenueChart, PaceChart, RevenueTrendChart, SourceMixChart } from '@/components/admin/AdminCharts';
import { PageHeader, SectionCard, StatCard } from '@/components/admin/ui';
import {
	buildGuestDirectory,
	daysBetween,
	metricsForDays,
	monthDays,
	monthKeys,
	occupiedApartmentIds,
	revenueBySource
} from '@/lib/stay/analytics';
import { formatCurrency } from '@/lib/stay/format';
import { addDays, sourceLabels, toIsoDate } from '@/lib/stay/labels';
import { getAdminContext, scopeStayData } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';
import type { BookingSource } from '@/lib/stay/types';

function monthShortLabel(monthKey: string) {
	const [year, month] = monthKey.split('-').map(Number);

	return new Intl.DateTimeFormat('sr-RS', { month: 'short', year: '2-digit' }).format(new Date(year, month - 1, 1));
}

export default async function AdminAnalyticsPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	const data = scopeStayData(await readStayData(), context);
	const today = toIsoDate(new Date());
	const currentMonth = today.slice(0, 7);

	const months = monthKeys(currentMonth, 12);
	const monthly = months.map((monthKey) => {
		const days = monthDays(monthKey);
		const metrics = metricsForDays(days, data.reservations, data.apartments);

		return { monthKey, label: monthShortLabel(monthKey), ...metrics };
	});

	const thisMonth = monthly[monthly.length - 1];
	const previousMonth = monthly[monthly.length - 2];
	const trailing12 = monthly.reduce(
		(totals, month) => ({
			revenue: totals.revenue + month.revenue,
			soldNights: totals.soldNights + month.soldNights,
			availableNights: totals.availableNights + month.availableNights
		}),
		{ revenue: 0, soldNights: 0, availableNights: 0 }
	);

	function delta(current: number, previous: number) {
		if (!previous) {
			return null;
		}

		return Math.round(((current - previous) / previous) * 100);
	}

	const revenueDelta = delta(thisMonth.revenue, previousMonth?.revenue ?? 0);

	// Occupancy for the coming 90 nights, i.e. how well the future is filling up.
	const paceDays = daysBetween(today, 90);
	const pace = paceDays.map((day) => {
		const busy = occupiedApartmentIds(day, data.reservations, data.calendarBlocks);

		return data.apartments.length ? Math.round((busy.size / data.apartments.length) * 100) : 0;
	});
	const forward30 = metricsForDays(daysBetween(today, 30), data.reservations, data.apartments);

	const sourceTotals = revenueBySource(data.reservations);
	const sourceEntries = (Object.keys(sourceTotals) as BookingSource[]).filter((key) => sourceTotals[key] > 0);

	const apartmentRevenue = data.apartments
		.map((apartment) => {
			const metrics = metricsForDays(
				daysBetween(addDays(today, -365), 365),
				data.reservations.filter((reservation) => reservation.apartmentId === apartment.id),
				[apartment]
			);

			return { name: apartment.name, revenue: Math.round(metrics.revenue), occupancy: metrics.occupancy };
		})
		.sort((first, second) => second.revenue - first.revenue);

	const guests = buildGuestDirectory(data.reservations);
	const repeatGuests = guests.filter((guest) => guest.stays > 1).length;
	const repeatShare = guests.length ? Math.round((repeatGuests / guests.length) * 100) : 0;

	return (
		<Stack
			spacing={3}
			padding={{ xs: 0, md: 1 }}
		>
			<PageHeader
				eyebrow="Analitika"
				title="Prihod i popunjenost"
				description="Dvanaest meseci unazad, devedeset noci unapred. ADR je prosecna cena prodate noci, RevPAR prihod po raspolozivoj noci."
			/>

			<Grid
				container
				spacing={2}
			>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Prihod ovog meseca"
						value={formatCurrency(Math.round(thisMonth.revenue))}
						hint={
							revenueDelta === null
								? 'Nema poredjenja sa proslim mesecom'
								: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta}% u odnosu na prosli mesec`
						}
						tone={revenueDelta !== null && revenueDelta < 0 ? 'critical' : 'positive'}
						icon={<EuroIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Popunjenost meseca"
						value={`${Math.round(thisMonth.occupancy * 100)}%`}
						hint={`${thisMonth.soldNights} od ${thisMonth.availableNights} noci`}
						tone="accent"
						icon={<PercentIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="ADR"
						value={formatCurrency(Math.round(thisMonth.adr))}
						hint={`RevPAR ${formatCurrency(Math.round(thisMonth.revpar))}`}
						tone="neutral"
						icon={<HotelIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="12 meseci"
						value={formatCurrency(Math.round(trailing12.revenue))}
						hint={`Popunjenost ${Math.round(
							trailing12.availableNights ? (trailing12.soldNights / trailing12.availableNights) * 100 : 0
						)}% · ponovljeni gosti ${repeatShare}%`}
						tone="positive"
						icon={<TrendingUpIcon />}
					/>
				</Grid>
			</Grid>

			<SectionCard
				title="Prihod i popunjenost po mesecu"
				subtitle="Kolone su prihod, linija je popunjenost."
			>
				<RevenueTrendChart
					categories={monthly.map((month) => month.label)}
					revenue={monthly.map((month) => Math.round(month.revenue))}
					occupancy={monthly.map((month) => Math.round(month.occupancy * 100))}
				/>
			</SectionCard>

			<Grid
				container
				spacing={3}
			>
				<Grid size={{ xs: 12, lg: 7 }}>
					<SectionCard
						title="Popunjenost narednih 90 noci"
						subtitle={`Naredih 30 noci: ${Math.round(forward30.occupancy * 100)}% popunjeno, ocekivani prihod ${formatCurrency(
							Math.round(forward30.revenue)
						)}.`}
					>
						<PaceChart
							categories={paceDays.map((day) => `${Number(day.slice(8, 10))}.${Number(day.slice(5, 7))}`)}
							values={pace}
						/>
					</SectionCard>
				</Grid>
				<Grid size={{ xs: 12, lg: 5 }}>
					<SectionCard
						title="Izvori rezervacija"
						subtitle="Udeo u ukupnom prihodu."
					>
						{sourceEntries.length === 0 ? (
							<Typography color="text.secondary">Jos nema prihoda za prikaz.</Typography>
						) : (
							<SourceMixChart
								labels={sourceEntries.map((source) => sourceLabels[source])}
								values={sourceEntries.map((source) => Math.round(sourceTotals[source]))}
							/>
						)}
					</SectionCard>
				</Grid>
			</Grid>

			<Grid
				container
				spacing={3}
			>
				<Grid size={{ xs: 12, lg: 7 }}>
					<SectionCard
						title="Prihod po apartmanu"
						subtitle="Poslednjih 12 meseci."
					>
						{apartmentRevenue.length === 0 ? (
							<Typography color="text.secondary">Nema apartmana.</Typography>
						) : (
							<ApartmentRevenueChart
								categories={apartmentRevenue.map((entry) => entry.name)}
								values={apartmentRevenue.map((entry) => entry.revenue)}
							/>
						)}
					</SectionCard>
				</Grid>
				<Grid size={{ xs: 12, lg: 5 }}>
					<SectionCard
						title="Najvredniji gosti"
						subtitle="Po ukupnoj potrosnji."
					>
						<Stack spacing={1.75}>
							{guests.slice(0, 8).map((guest, index) => (
								<Stack
									key={guest.key}
									direction="row"
									justifyContent="space-between"
									alignItems="center"
									spacing={1}
								>
									<Stack
										direction="row"
										spacing={1.5}
										alignItems="center"
										minWidth={0}
									>
										<Box
											sx={{
												display: 'grid',
												placeItems: 'center',
												width: 26,
												height: 26,
												borderRadius: '50%',
												fontSize: 11,
												fontWeight: 700,
												backgroundColor: 'action.hover'
											}}
										>
											{index + 1}
										</Box>
										<Box minWidth={0}>
											<Typography
												variant="body2"
												fontWeight={700}
												noWrap
											>
												{guest.name}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{guest.stays} boravaka · {guest.nights} noci
											</Typography>
										</Box>
									</Stack>
									<Typography
										variant="body2"
										fontWeight={700}
									>
										{formatCurrency(Math.round(guest.spend))}
									</Typography>
								</Stack>
							))}
							{guests.length === 0 ? (
								<Typography color="text.secondary">Jos nema gostiju u bazi.</Typography>
							) : null}
						</Stack>
					</SectionCard>
				</Grid>
			</Grid>
		</Stack>
	);
}
