'use client';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

/** Shared visual language for every admin screen: one card, one header, one pill. */

export const adminSurface = {
	borderRadius: 3,
	border: '1px solid',
	borderColor: 'divider',
	backgroundImage: 'none',
	boxShadow: '0 1px 2px rgb(17 19 18 / 4%), 0 12px 32px -24px rgb(17 19 18 / 35%)'
} as const;

export function SectionCard({
	title,
	subtitle,
	action,
	children,
	padding = 3,
	sx
}: {
	title?: ReactNode;
	subtitle?: ReactNode;
	action?: ReactNode;
	children: ReactNode;
	padding?: number;
	sx?: Record<string, unknown>;
}) {
	return (
		<Paper sx={{ ...adminSurface, p: padding, height: '100%', ...sx }}>
			{title || action ? (
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					justifyContent="space-between"
					alignItems={{ sm: 'center' }}
					spacing={1.5}
					marginBottom={2.5}
				>
					<div>
						{title ? (
							<Typography
								variant="subtitle1"
								fontWeight={700}
							>
								{title}
							</Typography>
						) : null}
						{subtitle ? (
							<Typography
								variant="body2"
								color="text.secondary"
							>
								{subtitle}
							</Typography>
						) : null}
					</div>
					{action}
				</Stack>
			) : null}
			{children}
		</Paper>
	);
}

export function PageHeader({
	eyebrow,
	title,
	description,
	actions
}: {
	eyebrow?: string;
	title: string;
	description?: string;
	actions?: ReactNode;
}) {
	return (
		<Stack
			direction={{ xs: 'column', md: 'row' }}
			justifyContent="space-between"
			alignItems={{ md: 'flex-end' }}
			spacing={2}
		>
			<div>
				{eyebrow ? (
					<Typography
						variant="overline"
						color="text.secondary"
						fontWeight={700}
						letterSpacing="0.14em"
					>
						{eyebrow}
					</Typography>
				) : null}
				<Typography
					variant="h4"
					fontWeight={700}
					lineHeight={1.15}
				>
					{title}
				</Typography>
				{description ? (
					<Typography
						mt={0.75}
						maxWidth={720}
						color="text.secondary"
					>
						{description}
					</Typography>
				) : null}
			</div>
			{actions ? (
				<Stack
					direction="row"
					spacing={1.5}
					flexWrap="wrap"
					useFlexGap
				>
					{actions}
				</Stack>
			) : null}
		</Stack>
	);
}

export function StatCard({
	label,
	value,
	hint,
	tone = 'neutral',
	icon
}: {
	label: string;
	value: ReactNode;
	hint?: ReactNode;
	tone?: 'neutral' | 'positive' | 'warning' | 'critical' | 'accent';
	icon?: ReactNode;
}) {
	const tones = {
		neutral: { fg: 'text.primary', bg: 'action.hover' },
		positive: { fg: '#047857', bg: 'rgba(16, 185, 129, 0.14)' },
		warning: { fg: '#b45309', bg: 'rgba(245, 158, 11, 0.16)' },
		critical: { fg: '#b91c1c', bg: 'rgba(239, 68, 68, 0.14)' },
		accent: { fg: '#1d4ed8', bg: 'rgba(49, 92, 240, 0.14)' }
	}[tone];

	return (
		<Paper sx={{ ...adminSurface, p: 2.5, height: '100%' }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				spacing={1}
			>
				<Typography
					variant="body2"
					color="text.secondary"
					fontWeight={600}
				>
					{label}
				</Typography>
				{icon ? (
					<Box
						sx={{
							display: 'grid',
							placeItems: 'center',
							width: 34,
							height: 34,
							borderRadius: 2,
							color: tones.fg,
							backgroundColor: tones.bg,
							'& svg': { fontSize: 19 }
						}}
					>
						{icon}
					</Box>
				) : null}
			</Stack>
			<Typography
				variant="h4"
				fontWeight={700}
				mt={1.25}
				lineHeight={1.1}
			>
				{value}
			</Typography>
			{hint ? (
				<Typography
					variant="caption"
					color="text.secondary"
					display="block"
					mt={0.75}
				>
					{hint}
				</Typography>
			) : null}
		</Paper>
	);
}

const pillTones: Record<string, { fg: string; bg: string }> = {
	pending: { fg: '#b45309', bg: 'rgba(245, 158, 11, 0.16)' },
	confirmed: { fg: '#047857', bg: 'rgba(16, 185, 129, 0.16)' },
	'checked-in': { fg: '#1d4ed8', bg: 'rgba(37, 99, 235, 0.14)' },
	'checked-out': { fg: '#4b5563', bg: 'rgba(107, 114, 128, 0.16)' },
	cancelled: { fg: '#b91c1c', bg: 'rgba(239, 68, 68, 0.14)' },
	cleaning: { fg: '#475569', bg: 'rgba(100, 116, 139, 0.16)' },
	maintenance: { fg: '#c2410c', bg: 'rgba(249, 115, 22, 0.16)' },
	'owner-stay': { fg: '#6d28d9', bg: 'rgba(139, 92, 246, 0.16)' }
};

export function StatusPill({ status, label, onClick }: { status: string; label: string; onClick?: () => void }) {
	const tone = pillTones[status] ?? { fg: '#4b5563', bg: 'rgba(107, 114, 128, 0.16)' };

	return (
		<Chip
			size="small"
			label={label}
			onClick={onClick}
			sx={{
				height: 24,
				fontWeight: 700,
				fontSize: 11,
				letterSpacing: '0.02em',
				color: tone.fg,
				backgroundColor: tone.bg,
				border: 'none'
			}}
		/>
	);
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
	return (
		<Stack
			alignItems="center"
			spacing={1}
			sx={{ py: 5, textAlign: 'center' }}
		>
			<Typography fontWeight={600}>{title}</Typography>
			{hint ? (
				<Typography
					variant="body2"
					color="text.secondary"
				>
					{hint}
				</Typography>
			) : null}
			{action}
		</Stack>
	);
}
