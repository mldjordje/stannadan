import type { BlockType, BookingSource, ReservationStatus } from './types';

export const statusColors: Record<ReservationStatus, string> = {
	pending: '#f59e0b',
	confirmed: '#10b981',
	'checked-in': '#2563eb',
	'checked-out': '#94a3b8',
	cancelled: '#ef4444'
};

export const statusLabels: Record<ReservationStatus, string> = {
	pending: 'Ceka potvrdu',
	confirmed: 'Potvrdjeno',
	'checked-in': 'Gost u objektu',
	'checked-out': 'Odjavljen',
	cancelled: 'Otkazano'
};

export const blockColors: Record<BlockType, string> = {
	cleaning: '#64748b',
	maintenance: '#f97316',
	'owner-stay': '#8b5cf6'
};

export const blockLabels: Record<BlockType, string> = {
	cleaning: 'Ciscenje',
	maintenance: 'Odrzavanje',
	'owner-stay': 'Vlasnik'
};

export const sourceLabels: Record<BookingSource, string> = {
	direct: 'Direktno',
	'booking.com': 'Booking.com',
	manual: 'Rucno'
};

/** The next status an operator normally moves a reservation to, used for one-click actions. */
export const nextStatus: Partial<Record<ReservationStatus, ReservationStatus>> = {
	pending: 'confirmed',
	confirmed: 'checked-in',
	'checked-in': 'checked-out'
};

export const nextStatusLabels: Partial<Record<ReservationStatus, string>> = {
	pending: 'Potvrdi',
	confirmed: 'Prijavi gosta',
	'checked-in': 'Odjavi gosta'
};

export function toIsoDate(value: Date) {
	return `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, '0')}-${`${value.getDate()}`.padStart(2, '0')}`;
}

export function fromIsoDate(isoDate: string) {
	const [year, month, day] = isoDate.split('-').map(Number);

	return new Date(year, month - 1, day);
}

export function addDays(isoDate: string, days: number) {
	const date = fromIsoDate(isoDate);
	date.setDate(date.getDate() + days);

	return toIsoDate(date);
}

export function diffDays(from: string, to: string) {
	return Math.round((fromIsoDate(to).getTime() - fromIsoDate(from).getTime()) / 86400000);
}

/** A stay occupies the night that starts on `day` when start <= day < end. */
export function coversNight(start: string, end: string, day: string) {
	return start <= day && day < end;
}
