export type PublicApartmentOption = { id: string; name: string };
export type PublicUnavailableRange = {
	id: string;
	apartmentId: string;
	start: string;
	end: string;
};

function toIsoDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function buildCalendarCells(month: Date) {
	const first = new Date(month.getFullYear(), month.getMonth(), 1);
	const offset = (first.getDay() + 6) % 7;
	const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);

	return Array.from({ length: 42 }, (_, index) => {
		const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);

		return {
			date,
			iso: toIsoDate(date),
			inCurrentMonth: date.getMonth() === month.getMonth()
		};
	});
}

export function dateIsUnavailable(iso: string, ranges: PublicUnavailableRange[]) {
	return ranges.some((range) => iso >= range.start.slice(0, 10) && iso < range.end.slice(0, 10));
}
