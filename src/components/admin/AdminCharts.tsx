'use client';

import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material';
import type { ApexOptions } from 'apexcharts';

// ApexCharts touches `window` on import, so it may only load in the browser.
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const palette = ['#315cf0', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

function baseOptions(mode: 'light' | 'dark'): ApexOptions {
	return {
		chart: {
			toolbar: { show: false },
			zoom: { enabled: false },
			fontFamily: 'inherit',
			background: 'transparent',
			animations: { enabled: true }
		},
		theme: { mode },
		colors: palette,
		grid: { borderColor: mode === 'dark' ? '#2a2e2a' : '#e6e3db', strokeDashArray: 4 },
		dataLabels: { enabled: false },
		legend: { position: 'bottom', fontWeight: 600 },
		tooltip: { theme: mode }
	};
}

export function RevenueTrendChart({
	categories,
	revenue,
	occupancy
}: {
	categories: string[];
	revenue: number[];
	occupancy: number[];
}) {
	const theme = useTheme();
	const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';

	const options: ApexOptions = {
		...baseOptions(mode),
		chart: { ...baseOptions(mode).chart, type: 'line', stacked: false },
		stroke: { width: [0, 3], curve: 'smooth' },
		plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
		xaxis: { categories },
		yaxis: [
			{
				title: { text: 'Prihod (EUR)' },
				labels: { formatter: (value: number) => `${Math.round(value)}` }
			},
			{
				opposite: true,
				max: 100,
				min: 0,
				title: { text: 'Popunjenost (%)' },
				labels: { formatter: (value: number) => `${Math.round(value)}%` }
			}
		]
	};

	return (
		<ReactApexChart
			options={options}
			series={[
				{ name: 'Prihod', type: 'column', data: revenue },
				{ name: 'Popunjenost', type: 'line', data: occupancy }
			]}
			type="line"
			height={320}
		/>
	);
}

export function SourceMixChart({ labels, values }: { labels: string[]; values: number[] }) {
	const theme = useTheme();
	const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';

	const options: ApexOptions = {
		...baseOptions(mode),
		labels,
		stroke: { width: 0 },
		plotOptions: { pie: { donut: { size: '68%' } } }
	};

	return (
		<ReactApexChart
			options={options}
			series={values}
			type="donut"
			height={300}
		/>
	);
}

export function ApartmentRevenueChart({ categories, values }: { categories: string[]; values: number[] }) {
	const theme = useTheme();
	const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';

	const options: ApexOptions = {
		...baseOptions(mode),
		chart: { ...baseOptions(mode).chart, type: 'bar' },
		plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '55%', distributed: true } },
		legend: { show: false },
		xaxis: { categories }
	};

	return (
		<ReactApexChart
			options={options}
			series={[{ name: 'Prihod', data: values }]}
			type="bar"
			height={Math.max(220, categories.length * 56)}
		/>
	);
}

export function PaceChart({ categories, values }: { categories: string[]; values: number[] }) {
	const theme = useTheme();
	const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';

	const options: ApexOptions = {
		...baseOptions(mode),
		chart: { ...baseOptions(mode).chart, type: 'area' },
		stroke: { width: 2, curve: 'smooth' },
		fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
		xaxis: { categories, tickAmount: 8 },
		yaxis: { max: 100, min: 0, labels: { formatter: (value: number) => `${Math.round(value)}%` } }
	};

	return (
		<ReactApexChart
			options={options}
			series={[{ name: 'Popunjenost', data: values }]}
			type="area"
			height={280}
		/>
	);
}
