'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { addDays, blockColors, blockLabels, diffDays, fromIsoDate, statusColors, toIsoDate } from '@/lib/stay/labels';
import type { Apartment, CalendarBlock, Reservation } from '@/lib/stay/types';

export type TimelineSelection = { apartmentId: string; start: string; end: string };

type StayTimelineProps = {
	apartments: Apartment[];
	reservations: Reservation[];
	blocks: CalendarBlock[];
	rangeStart: string;
	dayCount: number;
	columnWidth?: number;
	onSelectRange: (selection: TimelineSelection) => void;
	onOpenReservation: (reservation: Reservation) => void;
	onOpenBlock: (block: CalendarBlock) => void;
	onOpenDay?: (day: string) => void;
};

const rowHeight = 56;
const labelWidth = 190;

function weekdayLabel(isoDate: string) {
	return new Intl.DateTimeFormat('sr-RS', { weekday: 'short' }).format(fromIsoDate(isoDate)).replace('.', '');
}

function monthLabel(isoDate: string) {
	return new Intl.DateTimeFormat('sr-RS', { month: 'long', year: 'numeric' }).format(fromIsoDate(isoDate));
}

/**
 * Hotel-style availability grid: apartments are rows, nights are columns.
 * Bars are positioned on the night axis, so a check-out day is free again for the next guest.
 */
function StayTimeline({
	apartments,
	reservations,
	blocks,
	rangeStart,
	dayCount,
	columnWidth = 46,
	onSelectRange,
	onOpenReservation,
	onOpenBlock,
	onOpenDay
}: StayTimelineProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [drag, setDrag] = useState<{ apartmentId: string; anchor: number; current: number } | null>(null);
	const today = toIsoDate(new Date());

	const days = useMemo(
		() => Array.from({ length: dayCount }, (_, index) => addDays(rangeStart, index)),
		[dayCount, rangeStart]
	);

	const monthSpans = useMemo(() => {
		const spans: { key: string; label: string; span: number }[] = [];

		days.forEach((day) => {
			const key = day.slice(0, 7);
			const last = spans[spans.length - 1];

			if (last && last.key === key) {
				last.span += 1;
				return;
			}

			spans.push({ key, label: monthLabel(day), span: 1 });
		});

		return spans;
	}, [days]);

	// Scroll today into view whenever the visible window changes.
	useEffect(() => {
		const index = days.indexOf(today);

		if (index > 2 && scrollRef.current) {
			scrollRef.current.scrollLeft = Math.max(0, (index - 2) * columnWidth);
		}
	}, [columnWidth, days, today]);

	useEffect(() => {
		if (!drag) {
			return undefined;
		}

		function finish() {
			setDrag((current) => {
				if (current) {
					const from = Math.min(current.anchor, current.current);
					const to = Math.max(current.anchor, current.current);
					onSelectRange({
						apartmentId: current.apartmentId,
						start: days[from],
						end: addDays(days[to], 1)
					});
				}

				return null;
			});
		}

		window.addEventListener('pointerup', finish);

		return () => window.removeEventListener('pointerup', finish);
	}, [days, drag, onSelectRange]);

	const gridWidth = dayCount * columnWidth;

	function barGeometry(start: string, end: string) {
		const startIndex = Math.max(0, diffDays(rangeStart, start));
		const endIndex = Math.min(dayCount, diffDays(rangeStart, end));

		if (endIndex <= 0 || startIndex >= dayCount) {
			return null;
		}

		return {
			left: startIndex * columnWidth + 3,
			width: Math.max(columnWidth - 6, (endIndex - startIndex) * columnWidth - 6),
			clippedStart: diffDays(rangeStart, start) < 0,
			clippedEnd: diffDays(rangeStart, end) > dayCount
		};
	}

	return (
		<Box
			ref={scrollRef}
			sx={{
				overflowX: 'auto',
				overflowY: 'hidden',
				border: '1px solid',
				borderColor: 'divider',
				borderRadius: 3,
				userSelect: 'none',
				touchAction: 'pan-y'
			}}
		>
			<Box sx={{ minWidth: labelWidth + gridWidth }}>
				{/* Month band */}
				<Box
					sx={{ display: 'flex', position: 'sticky', top: 0, zIndex: 3, backgroundColor: 'background.paper' }}
				>
					<Box
						sx={{
							position: 'sticky',
							left: 0,
							zIndex: 4,
							width: labelWidth,
							flexShrink: 0,
							backgroundColor: 'background.paper',
							borderRight: '1px solid',
							borderColor: 'divider',
							px: 2,
							py: 1
						}}
					>
						<Typography
							variant="caption"
							fontWeight={700}
							color="text.secondary"
						>
							APARTMAN
						</Typography>
					</Box>
					{monthSpans.map((month) => (
						<Box
							key={month.key}
							sx={{
								width: month.span * columnWidth,
								flexShrink: 0,
								borderRight: '1px solid',
								borderColor: 'divider',
								px: 1,
								py: 1
							}}
						>
							<Typography
								variant="caption"
								fontWeight={700}
								textTransform="capitalize"
								noWrap
							>
								{month.label}
							</Typography>
						</Box>
					))}
				</Box>

				{/* Day header */}
				<Box sx={{ display: 'flex', borderTop: '1px solid', borderColor: 'divider' }}>
					<Box
						sx={{
							position: 'sticky',
							left: 0,
							zIndex: 2,
							width: labelWidth,
							flexShrink: 0,
							backgroundColor: 'background.paper',
							borderRight: '1px solid',
							borderColor: 'divider'
						}}
					/>
					{days.map((day) => {
						const weekend = [0, 6].includes(fromIsoDate(day).getDay());
						const isToday = day === today;

						return (
							<Box
								key={day}
								onClick={() => onOpenDay?.(day)}
								sx={{
									width: columnWidth,
									flexShrink: 0,
									textAlign: 'center',
									py: 0.75,
									cursor: onOpenDay ? 'pointer' : 'default',
									backgroundColor: isToday
										? 'rgba(49, 92, 240, 0.12)'
										: weekend
											? 'action.hover'
											: 'transparent',
									borderRight: '1px solid',
									borderColor: 'divider',
									'&:hover': { backgroundColor: 'rgba(49, 92, 240, 0.08)' }
								}}
							>
								<Typography
									variant="caption"
									display="block"
									color="text.secondary"
									fontSize={10}
									textTransform="uppercase"
								>
									{weekdayLabel(day)}
								</Typography>
								<Typography
									variant="caption"
									fontWeight={isToday ? 800 : 600}
									color={isToday ? 'primary.main' : 'text.primary'}
								>
									{Number(day.slice(8, 10))}
								</Typography>
							</Box>
						);
					})}
				</Box>

				{/* Rows */}
				{apartments.map((apartment) => {
					const rowReservations = reservations.filter((item) => item.apartmentId === apartment.id);
					const rowBlocks = blocks.filter((item) => item.apartmentId === apartment.id);
					const dragActive = drag?.apartmentId === apartment.id;
					const dragFrom = dragActive ? Math.min(drag.anchor, drag.current) : 0;
					const dragTo = dragActive ? Math.max(drag.anchor, drag.current) : -1;

					return (
						<Box
							key={apartment.id}
							sx={{ display: 'flex', borderTop: '1px solid', borderColor: 'divider' }}
						>
							<Box
								sx={{
									position: 'sticky',
									left: 0,
									zIndex: 2,
									width: labelWidth,
									flexShrink: 0,
									height: rowHeight,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									backgroundColor: 'background.paper',
									borderRight: '1px solid',
									borderColor: 'divider',
									px: 2
								}}
							>
								<Typography
									variant="body2"
									fontWeight={700}
									noWrap
								>
									{apartment.name}
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{apartment.guests} gostiju
								</Typography>
							</Box>

							<Box sx={{ position: 'relative', width: gridWidth, height: rowHeight, flexShrink: 0 }}>
								{/* Cell layer: hover, drag-to-create */}
								<Box sx={{ display: 'flex', height: '100%' }}>
									{days.map((day, index) => {
										const weekend = [0, 6].includes(fromIsoDate(day).getDay());
										const inDrag = dragActive && index >= dragFrom && index <= dragTo;

										return (
											<Box
												key={day}
												onPointerDown={(event) => {
													event.preventDefault();
													setDrag({
														apartmentId: apartment.id,
														anchor: index,
														current: index
													});
												}}
												onPointerEnter={() =>
													setDrag((current) =>
														current && current.apartmentId === apartment.id
															? { ...current, current: index }
															: current
													)
												}
												sx={{
													width: columnWidth,
													flexShrink: 0,
													cursor: 'crosshair',
													borderRight: '1px solid',
													borderColor: 'divider',
													backgroundColor: inDrag
														? 'rgba(49, 92, 240, 0.22)'
														: day === today
															? 'rgba(49, 92, 240, 0.07)'
															: weekend
																? 'action.hover'
																: 'transparent',
													'&:hover': {
														backgroundColor: inDrag
															? 'rgba(49, 92, 240, 0.22)'
															: 'rgba(49, 92, 240, 0.1)'
													}
												}}
											/>
										);
									})}
								</Box>

								{/* Bars */}
								{rowBlocks.map((block) => {
									const geometry = barGeometry(block.start, block.end);

									if (!geometry) {
										return null;
									}

									return (
										<Box
											key={block.id}
											role="button"
											tabIndex={0}
											title={`${blockLabels[block.type]} · ${block.title}`}
											onPointerDown={(event) => event.stopPropagation()}
											onClick={() => onOpenBlock(block)}
											onKeyDown={(event) => event.key === 'Enter' && onOpenBlock(block)}
											sx={{
												position: 'absolute',
												top: 6,
												height: 20,
												left: geometry.left,
												width: geometry.width,
												borderRadius: 1,
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												px: 0.75,
												color: '#fff',
												fontSize: 10,
												fontWeight: 700,
												backgroundColor: blockColors[block.type],
												backgroundImage:
													'repeating-linear-gradient(45deg, rgb(255 255 255 / 22%) 0 4px, transparent 4px 8px)',
												overflow: 'hidden',
												whiteSpace: 'nowrap'
											}}
										>
											{blockLabels[block.type]}
										</Box>
									);
								})}

								{rowReservations.map((reservation) => {
									const geometry = barGeometry(reservation.checkIn, reservation.checkOut);

									if (!geometry) {
										return null;
									}

									return (
										<Box
											key={reservation.id}
											role="button"
											tabIndex={0}
											title={`${reservation.guestName} · ${reservation.checkIn} → ${reservation.checkOut}`}
											onPointerDown={(event) => event.stopPropagation()}
											onClick={() => onOpenReservation(reservation)}
											onKeyDown={(event) =>
												event.key === 'Enter' && onOpenReservation(reservation)
											}
											sx={{
												position: 'absolute',
												bottom: 6,
												height: 22,
												left: geometry.left,
												width: geometry.width,
												borderRadius: geometry.clippedStart ? '0 8px 8px 0' : '8px',
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												px: 0.75,
												color: '#fff',
												fontSize: 11,
												fontWeight: 700,
												backgroundColor: statusColors[reservation.status],
												opacity: reservation.status === 'cancelled' ? 0.55 : 1,
												overflow: 'hidden',
												whiteSpace: 'nowrap',
												transition: 'transform 120ms ease',
												'&:hover': { transform: 'translateY(-1px)' }
											}}
										>
											{reservation.guestName}
										</Box>
									);
								})}
							</Box>
						</Box>
					);
				})}

				{apartments.length === 0 ? (
					<Stack
						alignItems="center"
						sx={{ py: 4 }}
					>
						<Typography color="text.secondary">Nema apartmana za prikaz.</Typography>
					</Stack>
				) : null}
			</Box>
		</Box>
	);
}

export default StayTimeline;
