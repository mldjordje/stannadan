'use client';

import { useMemo, useState } from 'react';
import {
	Box,
	Button,
	Chip,
	Grid,
	IconButton,
	InputAdornment,
	Paper,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import MailIcon from '@mui/icons-material/MailOutlined';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { EmptyState, PageHeader, StatCard, adminSurface } from '@/components/admin/ui';
import { formatCurrency, formatDate } from '@/lib/stay/format';
import { sourceLabels, toIsoDate } from '@/lib/stay/labels';
import type { GuestRecord } from '@/lib/stay/analytics';

type GuestsAdminViewProps = {
	guests: GuestRecord[];
	apartments: { id: string; name: string }[];
};

type Segment = 'all' | 'repeat' | 'upcoming' | 'direct';

const segmentLabels: Record<Segment, string> = {
	all: 'Svi',
	repeat: 'Ponovljeni',
	upcoming: 'Dolaze',
	direct: 'Direktni'
};

function GuestsAdminView({ guests, apartments }: GuestsAdminViewProps) {
	const [search, setSearch] = useState('');
	const [segment, setSegment] = useState<Segment>('all');
	const today = toIsoDate(new Date());

	const apartmentNames = useMemo(
		() => Object.fromEntries(apartments.map((apartment) => [apartment.id, apartment.name])),
		[apartments]
	);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();

		return guests.filter((guest) => {
			if (segment === 'repeat' && guest.stays < 2) {
				return false;
			}

			if (segment === 'upcoming' && !guest.nextStay) {
				return false;
			}

			if (segment === 'direct' && !guest.sources.includes('direct')) {
				return false;
			}

			if (!term) {
				return true;
			}

			return [guest.name, guest.email, guest.phone].join(' ').toLowerCase().includes(term);
		});
	}, [guests, search, segment]);

	const totals = useMemo(
		() => ({
			guests: guests.length,
			repeat: guests.filter((guest) => guest.stays > 1).length,
			upcoming: guests.filter((guest) => guest.nextStay).length,
			spend: guests.reduce((sum, guest) => sum + guest.spend, 0)
		}),
		[guests]
	);

	function exportCsv() {
		const rows = [
			['Gost', 'Email', 'Telefon', 'Boravaka', 'Noci', 'Potroseno', 'Poslednji boravak', 'Sledeci dolazak'],
			...filtered.map((guest) => [
				guest.name,
				guest.email,
				guest.phone,
				`${guest.stays}`,
				`${guest.nights}`,
				`${Math.round(guest.spend)}`,
				guest.lastStay,
				guest.nextStay || ''
			])
		];
		const bom = String.fromCharCode(0xfeff);
		const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
		const url = URL.createObjectURL(new Blob([`${bom}${csv}`], { type: 'text/csv;charset=utf-8' }));
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `gosti-${today}.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	}

	/** Mail list for a quick campaign, e.g. a returning-guest discount. */
	const mailtoAll = filtered
		.map((guest) => guest.email)
		.filter(Boolean)
		.join(',');

	return (
		<Stack
			spacing={3}
			padding={{ xs: 0, md: 1 }}
		>
			<PageHeader
				eyebrow="Gosti"
				title="Baza gostiju"
				description="Automatski izvedena iz rezervacija: ko se vraca, koliko trosi i ko stize sledeci."
				actions={
					<>
						<Button
							variant="outlined"
							startIcon={<DownloadIcon />}
							onClick={exportCsv}
							disabled={filtered.length === 0}
						>
							Izvezi CSV
						</Button>
						<Button
							variant="contained"
							startIcon={<MailIcon />}
							href={`mailto:?bcc=${mailtoAll}`}
							disabled={!mailtoAll}
						>
							Posalji mejl grupi
						</Button>
					</>
				}
			/>

			<Grid
				container
				spacing={2}
			>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Gostiju u bazi"
						value={totals.guests}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Ponovljeni"
						value={totals.repeat}
						hint={totals.guests ? `${Math.round((totals.repeat / totals.guests) * 100)}% baze` : undefined}
						tone="positive"
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Predstojeci dolasci"
						value={totals.upcoming}
						tone="accent"
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Ukupna potrosnja"
						value={formatCurrency(Math.round(totals.spend))}
						tone="positive"
					/>
				</Grid>
			</Grid>

			<Paper sx={{ ...adminSurface, p: { xs: 1.5, md: 2.5 } }}>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={1.5}
					alignItems={{ md: 'center' }}
					marginBottom={2}
				>
					<TextField
						size="small"
						placeholder="Pretrazi ime, email ili telefon..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						sx={{ flex: 1, minWidth: 240 }}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon fontSize="small" />
									</InputAdornment>
								)
							}
						}}
					/>
					<ToggleButtonGroup
						size="small"
						exclusive
						value={segment}
						onChange={(_, value) => value && setSegment(value)}
					>
						{(Object.keys(segmentLabels) as Segment[]).map((key) => (
							<ToggleButton
								key={key}
								value={key}
							>
								{segmentLabels[key]}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Stack>

				{filtered.length === 0 ? (
					<EmptyState
						title="Nema gostiju za ovaj filter"
						hint="Baza se puni automatski kada dodas rezervaciju."
					/>
				) : (
					<Grid
						container
						spacing={2}
					>
						{filtered.map((guest) => (
							<Grid
								key={guest.key}
								size={{ xs: 12, md: 6, xl: 4 }}
							>
								<Paper
									variant="outlined"
									sx={{ p: 2, borderRadius: 3, height: '100%' }}
								>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="flex-start"
										spacing={1}
									>
										<Box minWidth={0}>
											<Typography
												fontWeight={700}
												noWrap
											>
												{guest.name}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
												noWrap
											>
												{guest.email || guest.phone || 'Bez kontakta'}
											</Typography>
										</Box>
										<Stack direction="row">
											{guest.email ? (
												<Tooltip title="Posalji mejl">
													<IconButton
														size="small"
														href={`mailto:${guest.email}`}
													>
														<MailIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											) : null}
											{guest.phone ? (
												<Tooltip title="Pozovi">
													<IconButton
														size="small"
														href={`tel:${guest.phone}`}
													>
														<PhoneIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											) : null}
										</Stack>
									</Stack>

									<Stack
										direction="row"
										spacing={0.75}
										flexWrap="wrap"
										useFlexGap
										marginTop={1.25}
									>
										{guest.stays > 1 ? (
											<Chip
												size="small"
												color="success"
												label={`${guest.stays} boravaka`}
											/>
										) : (
											<Chip
												size="small"
												label="Prvi boravak"
											/>
										)}
										{guest.nextStay ? (
											<Chip
												size="small"
												color="primary"
												label={`Dolazi ${formatDate(guest.nextStay)}`}
											/>
										) : null}
										{guest.sources.map((source) => (
											<Chip
												key={source}
												size="small"
												variant="outlined"
												label={sourceLabels[source]}
											/>
										))}
									</Stack>

									<Stack
										direction="row"
										justifyContent="space-between"
										marginTop={1.5}
									>
										<Box>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												Potroseno
											</Typography>
											<Typography fontWeight={700}>
												{formatCurrency(Math.round(guest.spend))}
											</Typography>
										</Box>
										<Box textAlign="right">
											<Typography
												variant="caption"
												color="text.secondary"
											>
												Noci · poslednji boravak
											</Typography>
											<Typography
												variant="body2"
												fontWeight={600}
											>
												{guest.nights} · {formatDate(guest.lastStay)}
											</Typography>
										</Box>
									</Stack>

									<Typography
										variant="caption"
										color="text.secondary"
										display="block"
										marginTop={1}
										noWrap
									>
										{guest.apartmentIds.map((id) => apartmentNames[id] || id).join(', ')}
									</Typography>
								</Paper>
							</Grid>
						))}
					</Grid>
				)}
			</Paper>
		</Stack>
	);
}

export default GuestsAdminView;
