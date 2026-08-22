'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Box,
	Button,
	Chip,
	Divider,
	Grid,
	Stack,
	Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreOutlined';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import ApartmentIcon from '@mui/icons-material/ApartmentOutlined';
import GuestsIcon from '@mui/icons-material/GroupsOutlined';
import AnalyticsIcon from '@mui/icons-material/InsightsOutlined';
import SyncIcon from '@mui/icons-material/SyncAltOutlined';
import { PageHeader, SectionCard, adminSurface } from '@/components/admin/ui';

type Mapping = {
	apartmentId: string;
	roomName: string;
	exportPath: string;
	hasImportUrl: boolean;
};

type TutorialViewProps = {
	isAdmin: boolean;
	apartments: { id: string; name: string }[];
	mappings: Mapping[];
};

const screens = [
	{
		href: '/admin',
		label: 'Pregled',
		Icon: DashboardIcon,
		text: 'Prva strana. Pokazuje ko danas dolazi, ko odlazi i koliko rezervacija ceka potvrdu.'
	},
	{
		href: '/admin/calendar',
		label: 'Kalendar',
		Icon: CalendarIcon,
		text: 'Svi apartmani po danima i satima. Ovde blokiras termine za ciscenje, popravku ili svoj boravak.'
	},
	{
		href: '/admin/reservations',
		label: 'Rezervacije',
		Icon: ReceiptIcon,
		text: 'Spisak svih rezervacija. Ovde potvrdjujes, otkazujes i menjas datume ili cenu.'
	},
	{
		href: '/admin/apartments',
		label: 'Apartmani i cene',
		Icon: ApartmentIcon,
		text: 'Naziv, opis, slike i cena po nocenju. Sve sto gost vidi na sajtu menja se odavde.'
	},
	{
		href: '/admin/guests',
		label: 'Gosti',
		Icon: GuestsIcon,
		text: 'Imenik gostiju sa brojem dolazaka i kontaktom. Korisno za stalne goste i direktne ponude.'
	},
	{
		href: '/admin/analytics',
		label: 'Analitika',
		Icon: AnalyticsIcon,
		text: 'Prihod, popunjenost i odakle stizu rezervacije (sajt, Booking, telefon).'
	}
];

const dailyRoutine = [
	'Ujutru otvori Pregled i vidi ko danas dolazi i ko odlazi.',
	'Ako u meniju stoji broj pored "Rezervacije", to su zahtevi koji cekaju tvoju potvrdu. Otvori ih i potvrdi ili odbij.',
	'Kad apartman nije za izdavanje (ciscenje, popravka, tvoj boravak), otvori Kalendar i blokiraj te dane.',
	'Cenu menjas na strani Apartmani i cene. Nova cena vazi za nove rezervacije.'
];

const faq = [
	{
		question: 'Zasto se rezervacija sa Bookinga ne vidi odmah?',
		answer: 'iCal veza nije trenutna. Booking osvezava svoj fajl na svakih par sati, a mi povlacimo na svaki sat. Ako ti treba odmah, klikni "Pokreni sync sada" na strani Booking sync.'
	},
	{
		question: 'Prenose li se cene i podaci o gostu sa Bookinga?',
		answer: 'Ne. iCal prenosi samo zauzete datume. Ime, cena i kontakt gosta ostaju na Bookingu. Puni prenos podataka trazi Booking Connectivity API partnerski pristup.'
	},
	{
		question: 'Greskom sam potvrdio rezervaciju, sta sad?',
		answer: 'Otvori Rezervacije, nadji je i promeni status na "Otkazana". Datumi se odmah oslobadjaju u kalendaru.'
	},
	{
		question: 'Kako da apartman ne bude dostupan par dana?',
		answer: 'Kalendar, pa izaberi dane na tom apartmanu i napravi blokadu (ciscenje, popravka ili sopstveni boravak). Ti dani se vise ne mogu rezervisati na sajtu.'
	}
];

function CodeLine({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {
			// Clipboard can be blocked; the text stays selectable by hand.
		}
	}

	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			alignItems={{ sm: 'center' }}
			spacing={1}
			sx={{
				borderRadius: 2,
				border: '1px solid',
				borderColor: 'divider',
				backgroundColor: 'action.hover',
				pl: 1.5,
				pr: 0.5,
				py: 0.75
			}}
		>
			<Box
				component="code"
				sx={{ flex: 1, fontSize: 13, overflowWrap: 'anywhere' }}
			>
				{value}
			</Box>
			<Button
				size="small"
				startIcon={<CopyIcon fontSize="small" />}
				onClick={copy}
				sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
			>
				{copied ? 'Kopirano' : 'Kopiraj'}
			</Button>
		</Stack>
	);
}

function Step({ number, title, children }: { number: number; title: string; children?: React.ReactNode }) {
	return (
		<Stack
			direction="row"
			spacing={2}
			alignItems="flex-start"
		>
			<Box
				sx={{
					display: 'grid',
					placeItems: 'center',
					flex: '0 0 auto',
					width: 28,
					height: 28,
					borderRadius: '50%',
					fontWeight: 700,
					fontSize: 13,
					color: '#1d4ed8',
					backgroundColor: 'rgba(49, 92, 240, 0.14)'
				}}
			>
				{number}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography fontWeight={600}>{title}</Typography>
				{children ? (
					<Stack
						spacing={1.25}
						mt={0.75}
					>
						{children}
					</Stack>
				) : null}
			</Box>
		</Stack>
	);
}

function TutorialView({ isAdmin, apartments, mappings }: TutorialViewProps) {
	const [origin, setOrigin] = useState('');

	// The export links must show the real address of this installation.
	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const apartmentNames = Object.fromEntries(apartments.map((apartment) => [apartment.id, apartment.name]));

	return (
		<Stack
			spacing={3}
			padding={3}
		>
			<PageHeader
				eyebrow="Uputstvo"
				title="Kako se koristi admin panel"
				description="Sve na jednom mestu: sta radi koja strana, sta radis svaki dan i kako da spojis kalendar sa Booking.com nalogom."
			/>

			<SectionCard
				title="Sta je koja strana"
				subtitle="Meni je sa leve strane. Na telefonu ga otvaras dugmetom sa tri crte gore levo."
			>
				<Grid
					container
					spacing={2}
				>
					{screens.map((screen) => (
						<Grid
							key={screen.href}
							size={{ xs: 12, md: 6 }}
						>
							<Stack
								component={Link}
								href={screen.href}
								direction="row"
								spacing={1.5}
								sx={{
									...adminSurface,
									boxShadow: 'none',
									p: 2,
									height: '100%',
									textDecoration: 'none',
									color: 'inherit',
									'&:hover': { borderColor: 'text.primary' }
								}}
							>
								<Box
									sx={{
										display: 'grid',
										placeItems: 'center',
										flex: '0 0 auto',
										width: 34,
										height: 34,
										borderRadius: 2,
										color: '#1d4ed8',
										backgroundColor: 'rgba(49, 92, 240, 0.14)'
									}}
								>
									<screen.Icon fontSize="small" />
								</Box>
								<div>
									<Typography fontWeight={700}>{screen.label}</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										{screen.text}
									</Typography>
								</div>
							</Stack>
						</Grid>
					))}
				</Grid>
			</SectionCard>

			<SectionCard
				title="Dnevni posao u cetiri koraka"
				subtitle="Ako ne znas odakle da pocnes, radi ovim redom."
			>
				<Stack spacing={2}>
					{dailyRoutine.map((line, index) => (
						<Step
							key={line}
							number={index + 1}
							title={line}
						/>
					))}
				</Stack>
				<Divider sx={{ my: 2.5 }} />
				<Typography
					variant="body2"
					color="text.secondary"
				>
					Savet: pritisni <strong>Ctrl + K</strong> (na telefonu lupa gore desno) da brzo nadjes rezervaciju,
					gosta ili stranu, bez klikanja kroz meni.
				</Typography>
			</SectionCard>

			<SectionCard
				title="Povezivanje sa Booking.com"
				subtitle="Cilj: kad neko rezervise preko Bookinga, ti datumi se sami zauzmu i ovde, i obrnuto."
			>
				{!isAdmin ? (
					<Alert
						severity="info"
						sx={{ mb: 2 }}
					>
						Ovo podesava glavni administrator. Tebi je dovoljno da znas da su zauzeti datumi sa Bookinga vec
						u kalendaru.
					</Alert>
				) : null}

				<Alert
					severity="info"
					sx={{ mb: 2.5 }}
				>
					Veza radi preko dva linka po apartmanu. <strong>Import</strong> je link koji uzimas sa Bookinga i
					lepis ovde. <strong>Export</strong> je link iz ove aplikacije koji lepis na Booking. Treba oba, da
					bi se zauzeca prenosila u oba smera.
				</Alert>

				<Stack spacing={2.5}>
					<Step
						number={1}
						title="Uzmi link sa Booking.com (import)"
					>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							Prijavi se na <strong>admin.booking.com</strong>, izaberi objekat, otvori{' '}
							<strong>Rates &amp; Availability</strong> (Cene i raspolozivost), pa{' '}
							<strong>Sync calendars</strong> (Sinhronizacija kalendara) i kod sobe klikni{' '}
							<strong>Export calendar</strong>. Dobijes link koji se zavrsava na .ics. Kopiraj ga.
						</Typography>
					</Step>

					<Step
						number={2}
						title="Nalepi taj link u aplikaciju"
					>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							Otvori stranu <strong>Booking sync</strong>, nadji red sa tim apartmanom i nalepi link u
							kolonu <strong>Import URL sa Booking.com</strong>. Zatim klikni{' '}
							<strong>Sacuvaj konfiguraciju</strong>.
						</Typography>
						<Button
							component={Link}
							href="/admin/channel-sync"
							variant="outlined"
							size="small"
							startIcon={<SyncIcon fontSize="small" />}
							sx={{ alignSelf: 'flex-start' }}
						>
							Otvori Booking sync
						</Button>
					</Step>

					<Step
						number={3}
						title="Vrati se na Booking i nalepi nas link (export)"
					>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							Na istoj Booking strani <strong>Sync calendars</strong> klikni{' '}
							<strong>Import calendar</strong>, daj mu ime (npr. Sajt) i nalepi link tog apartmana:
						</Typography>
						<Stack spacing={1.5}>
							{mappings.map((mapping) => (
								<Stack
									key={mapping.apartmentId}
									spacing={0.75}
								>
									<Stack
										direction="row"
										spacing={1}
										alignItems="center"
										flexWrap="wrap"
										useFlexGap
									>
										<Typography
											variant="body2"
											fontWeight={700}
										>
											{apartmentNames[mapping.apartmentId] ?? mapping.roomName}
										</Typography>
										<Chip
											size="small"
											label={mapping.hasImportUrl ? 'Import podesen' : 'Import nije podesen'}
											sx={{
												height: 22,
												fontSize: 11,
												fontWeight: 700,
												color: mapping.hasImportUrl ? '#047857' : '#b45309',
												backgroundColor: mapping.hasImportUrl
													? 'rgba(16, 185, 129, 0.16)'
													: 'rgba(245, 158, 11, 0.16)'
											}}
										/>
									</Stack>
									<CodeLine value={`${origin}${mapping.exportPath}`} />
								</Stack>
							))}
						</Stack>
					</Step>

					<Step
						number={4}
						title="Proveri da radi"
					>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							Na strani <strong>Booking sync</strong> klikni <strong>Pokreni sync sada</strong>. Dole u
							delu <strong>Poslednji sync logovi</strong> mora da pise zeleno. Posle toga se sync sam
							pokrece na svakih sat vremena i ne moras nista da radis.
						</Typography>
					</Step>
				</Stack>
			</SectionCard>

			<SectionCard
				title="Cesta pitanja"
				padding={2}
			>
				{faq.map((item) => (
					<Accordion
						key={item.question}
						disableGutters
						elevation={0}
						sx={{ backgroundColor: 'transparent', '&::before': { display: 'none' } }}
					>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography fontWeight={600}>{item.question}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography
								variant="body2"
								color="text.secondary"
							>
								{item.answer}
							</Typography>
						</AccordionDetails>
					</Accordion>
				))}
			</SectionCard>
		</Stack>
	);
}

export default TutorialView;
