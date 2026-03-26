'use client';

import { useMemo, useState } from 'react';
import {
	Alert,
	Button,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography
} from '@mui/material';
import { Apartment, BookingSyncConfig } from '@/lib/stay/types';

type ChannelSyncAdminViewProps = {
	initialApartments: Apartment[];
	initialSync: BookingSyncConfig;
};

function ChannelSyncAdminView({ initialApartments, initialSync }: ChannelSyncAdminViewProps) {
	const [syncConfig, setSyncConfig] = useState(initialSync);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [loading, setLoading] = useState(false);

	const apartmentNames = useMemo(
		() => Object.fromEntries(initialApartments.map((apartment) => [apartment.id, apartment.name])),
		[initialApartments]
	);

	function updateMapping(index: number, value: string) {
		setSyncConfig((current) => ({
			...current,
			mappings: current.mappings.map((mapping, mappingIndex) =>
				mappingIndex === index ? { ...mapping, importUrl: value } : mapping
			)
		}));
	}

	async function saveConfig() {
		setLoading(true);
		setFeedback(null);

		try {
			const response = await fetch('/api/stay/booking/config', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					mode: syncConfig.mode,
					state: syncConfig.mappings.some((mapping) => mapping.importUrl) ? 'configured' : 'needs-setup',
					propertyId: syncConfig.propertyId,
					notes: syncConfig.notes,
					mappings: syncConfig.mappings
				})
			});

			if (!response.ok) {
				throw new Error('Sync konfiguracija nije sacuvana.');
			}

			const next = (await response.json()) as BookingSyncConfig;
			setSyncConfig(next);
			setFeedback({ type: 'success', message: 'Booking.com konfiguracija je sacuvana.' });
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setLoading(false);
		}
	}

	async function runSync() {
		setLoading(true);
		setFeedback(null);

		try {
			const response = await fetch('/api/stay/booking/sync', {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Sync nije pokrenut.');
			}

			const message = (await response.json()) as { message: string };
			const configResponse = await fetch('/api/stay/booking/config');
			const next = (await configResponse.json()) as BookingSyncConfig;
			setSyncConfig(next);
			setFeedback({ type: 'success', message: message.message });
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setLoading(false);
		}
	}

	return (
		<Stack spacing={3} padding={3}>
			<div>
				<Typography variant="h4" fontWeight={700}>
					Booking.com sync
				</Typography>
				<Typography color="text.secondary">
					iCal import/export sloj je spreman odmah, a puni Connectivity API moze da se doda kada dobijes partner pristup.
				</Typography>
			</div>

			{feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}

			<Paper sx={{ borderRadius: 4, p: 3 }}>
				<Stack spacing={3}>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField
							label="Property ID"
							value={syncConfig.propertyId}
							onChange={(event) => setSyncConfig((current) => ({ ...current, propertyId: event.target.value }))}
							fullWidth
						/>
						<TextField
							select
							label="Mode"
							value={syncConfig.mode}
							onChange={(event) =>
								setSyncConfig((current) => ({ ...current, mode: event.target.value as BookingSyncConfig['mode'] }))
							}
							fullWidth
						>
							<MenuItem value="ical">iCal sync</MenuItem>
							<MenuItem value="connectivity-api">Connectivity API</MenuItem>
						</TextField>
					</Stack>
					<TextField
						label="Napomena"
						value={syncConfig.notes}
						onChange={(event) => setSyncConfig((current) => ({ ...current, notes: event.target.value }))}
						fullWidth
						multiline
						minRows={3}
					/>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Apartman</TableCell>
								<TableCell>Import URL sa Booking.com</TableCell>
								<TableCell>Export feed iz aplikacije</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{syncConfig.mappings.map((mapping, index) => (
								<TableRow key={mapping.apartmentId}>
									<TableCell>
										<Typography fontWeight={600}>{apartmentNames[mapping.apartmentId]}</Typography>
										<Typography variant="body2" color="text.secondary">
											{mapping.roomName}
										</Typography>
									</TableCell>
									<TableCell>
										<TextField
											size="small"
											fullWidth
											placeholder="https://admin.booking.com/hotel/hoteladmin/ical.html..."
											value={mapping.importUrl}
											onChange={(event) => updateMapping(index, event.target.value)}
										/>
									</TableCell>
									<TableCell>
										<code>{mapping.exportPath}</code>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<Button variant="contained" onClick={saveConfig} disabled={loading}>
							Sacuvaj konfiguraciju
						</Button>
						<Button variant="outlined" onClick={runSync} disabled={loading}>
							Pokreni sync sada
						</Button>
					</Stack>
				</Stack>
			</Paper>

			<Paper sx={{ borderRadius: 4, p: 3 }}>
				<Typography variant="h6" fontWeight={700} marginBottom={2}>
					Poslednji sync logovi
				</Typography>
				<Stack spacing={1.5}>
					{syncConfig.logs.map((log) => (
						<Alert key={log.id} severity={log.status === 'error' ? 'error' : log.status === 'warning' ? 'warning' : 'success'}>
							{log.message}
						</Alert>
					))}
				</Stack>
			</Paper>
		</Stack>
	);
}

export default ChannelSyncAdminView;
