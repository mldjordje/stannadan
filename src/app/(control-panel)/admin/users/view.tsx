'use client';

import { useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	ListItemText,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Tooltip,
	Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import { Apartment, StayUser } from '@/lib/stay/types';

type UsersAdminViewProps = {
	currentEmail: string;
	initialApartments: Apartment[];
	initialUsers: StayUser[];
	superAdminEmails: string[];
};

type UserFormState = {
	id?: string;
	email: string;
	displayName: string;
	role: StayUser['role'];
	apartmentIds: string[];
	status: StayUser['status'];
	notes: string;
};

const emptyForm: UserFormState = {
	email: '',
	displayName: '',
	role: 'owner',
	apartmentIds: [],
	status: 'active',
	notes: ''
};

function toForm(user: StayUser): UserFormState {
	return {
		id: user.id,
		email: user.email,
		displayName: user.displayName,
		role: user.role,
		apartmentIds: user.apartmentIds,
		status: user.status,
		notes: user.notes || ''
	};
}

function UsersAdminView({ currentEmail, initialApartments, initialUsers, superAdminEmails }: UsersAdminViewProps) {
	const [users, setUsers] = useState(initialUsers);
	const [form, setForm] = useState<UserFormState>(emptyForm);
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const lockedEmails = useMemo(
		() => new Set(superAdminEmails.map((email) => email.toLowerCase())),
		[superAdminEmails]
	);
	const apartmentNameMap = useMemo(
		() => Object.fromEntries(initialApartments.map((apartment) => [apartment.id, apartment.name])),
		[initialApartments]
	);

	function updateField<Key extends keyof UserFormState>(key: Key, value: UserFormState[Key]) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	function openCreate() {
		setForm({ ...emptyForm });
		setOpen(true);
	}

	function openEdit(user: StayUser) {
		setForm(toForm(user));
		setOpen(true);
	}

	async function saveUser() {
		setSaving(true);
		setFeedback(null);

		try {
			const response = await fetch(form.id ? `/api/stay/users/${form.id}` : '/api/stay/users', {
				method: form.id ? 'PATCH' : 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email: form.email,
					displayName: form.displayName,
					role: form.role,
					apartmentIds: form.role === 'admin' ? [] : form.apartmentIds,
					status: form.status,
					notes: form.notes
				})
			});

			const body = await response.json();

			if (!response.ok) {
				throw new Error(typeof body?.error === 'string' ? body.error : 'Korisnik nije sacuvan.');
			}

			const user = body as StayUser;

			setUsers((current) =>
				form.id ? current.map((item) => (item.id === user.id ? user : item)) : [...current, user]
			);
			setFeedback({
				type: 'success',
				message: 'Korisnik je sacuvan. Prijava ide preko Google naloga sa tom email adresom.'
			});
			setOpen(false);
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setSaving(false);
		}
	}

	async function deleteUser(user: StayUser) {
		const confirmed = window.confirm(`Ukloni pristup za ${user.email}?`);

		if (!confirmed) {
			return;
		}

		const response = await fetch(`/api/stay/users/${user.id}`, { method: 'DELETE' });
		const body = await response.json().catch(() => null);

		if (!response.ok) {
			setFeedback({
				type: 'error',
				message: typeof body?.error === 'string' ? body.error : 'Brisanje nije uspelo.'
			});
			return;
		}

		setUsers((current) => current.filter((item) => item.id !== user.id));
		setFeedback({ type: 'success', message: 'Pristup je uklonjen.' });
	}

	return (
		<Stack
			spacing={3}
			padding={3}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				spacing={2}
			>
				<div>
					<Typography
						variant="h4"
						fontWeight={700}
					>
						Korisnici panela
					</Typography>
					<Typography color="text.secondary">
						Dodeli pristup saradnicima. Vlasnik vidi i uredjuje samo svoje apartmane, admin vidi sve.
					</Typography>
				</div>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={openCreate}
				>
					Novi korisnik
				</Button>
			</Stack>

			{feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}

			<Alert severity="info">
				Nema lozinki. Korisnik se prijavljuje Google nalogom na <strong>/sign-in</strong> sa tacno ovom email
				adresom, a panel mu odmah dodeljuje ovde podesenu ulogu.
			</Alert>

			<Paper sx={{ overflowX: 'auto', borderRadius: 4 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Korisnik</TableCell>
							<TableCell>Uloga</TableCell>
							<TableCell>Apartmani</TableCell>
							<TableCell>Status</TableCell>
							<TableCell align="right">Akcije</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5}>
									<Typography
										color="text.secondary"
										py={2}
									>
										Jos nema dodatih korisnika. Vlasnicki nalozi aplikacije uvek imaju pun pristup.
									</Typography>
								</TableCell>
							</TableRow>
						) : null}
						{users.map((user) => {
							const locked = lockedEmails.has(user.email);

							return (
								<TableRow
									key={user.id}
									hover
								>
									<TableCell>
										<Stack
											direction="row"
											spacing={1}
											alignItems="center"
										>
											<div>
												<Typography fontWeight={600}>{user.displayName}</Typography>
												<Typography
													variant="body2"
													color="text.secondary"
												>
													{user.email}
												</Typography>
											</div>
											{locked ? (
												<Tooltip title="Vlasnicki nalog aplikacije, ne moze se menjati">
													<LockIcon
														fontSize="small"
														color="disabled"
													/>
												</Tooltip>
											) : null}
										</Stack>
									</TableCell>
									<TableCell>
										<Chip
											size="small"
											color={user.role === 'admin' ? 'primary' : 'default'}
											label={user.role === 'admin' ? 'Admin (sve)' : 'Vlasnik apartmana'}
										/>
									</TableCell>
									<TableCell>
										{user.role === 'admin' ? (
											<Typography variant="body2">Svi apartmani</Typography>
										) : (
											<Stack
												direction="row"
												flexWrap="wrap"
												gap={0.5}
											>
												{user.apartmentIds.map((apartmentId) => (
													<Chip
														key={apartmentId}
														size="small"
														variant="outlined"
														label={apartmentNameMap[apartmentId] || apartmentId}
													/>
												))}
											</Stack>
										)}
									</TableCell>
									<TableCell>
										<Chip
											size="small"
											color={user.status === 'active' ? 'success' : 'warning'}
											label={user.status === 'active' ? 'Aktivan' : 'Iskljucen'}
										/>
									</TableCell>
									<TableCell align="right">
										<IconButton
											onClick={() => openEdit(user)}
											disabled={locked}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											color="error"
											onClick={() => deleteUser(user)}
											disabled={locked || user.email === currentEmail}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Paper>

			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{form.id ? 'Izmeni korisnika' : 'Novi korisnik'}</DialogTitle>
				<DialogContent>
					<Grid
						container
						spacing={2}
						sx={{ mt: 0.5 }}
					>
						<Grid size={12}>
							<TextField
								label="Google email"
								type="email"
								value={form.email}
								onChange={(event) => updateField('email', event.target.value)}
								helperText="Mora biti isti nalog kojim se korisnik prijavljuje na sajt."
								fullWidth
							/>
						</Grid>
						<Grid size={12}>
							<TextField
								label="Ime i prezime"
								value={form.displayName}
								onChange={(event) => updateField('displayName', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								select
								label="Uloga"
								value={form.role}
								onChange={(event) => updateField('role', event.target.value as StayUser['role'])}
								fullWidth
							>
								<MenuItem value="owner">Vlasnik apartmana</MenuItem>
								<MenuItem value="admin">Admin (pun pristup)</MenuItem>
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								select
								label="Status"
								value={form.status}
								onChange={(event) => updateField('status', event.target.value as StayUser['status'])}
								fullWidth
							>
								<MenuItem value="active">Aktivan</MenuItem>
								<MenuItem value="disabled">Iskljucen</MenuItem>
							</TextField>
						</Grid>
						{form.role === 'owner' ? (
							<Grid size={12}>
								<TextField
									select
									label="Dodeljeni apartmani"
									value={form.apartmentIds}
									onChange={(event) =>
										updateField(
											'apartmentIds',
											typeof event.target.value === 'string'
												? event.target.value.split(',')
												: (event.target.value as unknown as string[])
										)
									}
									slotProps={{
										select: {
											multiple: true,
											renderValue: (selected) => (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{(selected as string[]).map((apartmentId) => (
														<Chip
															key={apartmentId}
															size="small"
															label={apartmentNameMap[apartmentId] || apartmentId}
														/>
													))}
												</Box>
											)
										}
									}}
									helperText="Vlasnik vidi rezervacije, kalendar i izmene samo za ove apartmane."
									fullWidth
								>
									{initialApartments.map((apartment) => (
										<MenuItem
											key={apartment.id}
											value={apartment.id}
										>
											<Checkbox checked={form.apartmentIds.includes(apartment.id)} />
											<ListItemText primary={apartment.name} />
										</MenuItem>
									))}
								</TextField>
							</Grid>
						) : null}
						<Grid size={12}>
							<TextField
								label="Napomena"
								value={form.notes}
								onChange={(event) => updateField('notes', event.target.value)}
								fullWidth
								multiline
								minRows={2}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Odustani</Button>
					<Button
						onClick={saveUser}
						variant="contained"
						disabled={saving}
					>
						{saving ? 'Cuvanje...' : 'Sacuvaj'}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}

export default UsersAdminView;
