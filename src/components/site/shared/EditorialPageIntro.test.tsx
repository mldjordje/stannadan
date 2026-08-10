import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EditorialPageIntro from './EditorialPageIntro';

describe('EditorialPageIntro', () => {
	it('renders its editorial copy and optional image', () => {
		render(
			<EditorialPageIntro
				kicker="Our place"
				title="A quieter way to stay"
				description="Rooms shaped by the city and the people who live here."
				image={{
					src: '/site-assets/images/editorial-stay.jpg',
					alt: 'Sunlight falling across a quiet apartment',
					width: 1200,
					height: 800,
					priority: true
				}}
			/>
		);

		expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
		expect(screen.getByText('Our place')).toBeVisible();
		expect(screen.getByRole('heading', { level: 1, name: 'A quieter way to stay' })).toBeVisible();
		expect(screen.getByText('Rooms shaped by the city and the people who live here.')).toBeVisible();
		expect(screen.getByRole('img', { name: 'Sunlight falling across a quiet apartment' })).toBeInTheDocument();
	});

	it('omits image markup when no image is provided', () => {
		render(
			<EditorialPageIntro
				kicker="Journal"
				title="Notes from Belgrade"
				description="An evolving collection of local observations."
			/>
		);

		expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
		expect(screen.getByText('Journal')).toBeVisible();
		expect(screen.getByRole('heading', { level: 1, name: 'Notes from Belgrade' })).toBeVisible();
		expect(screen.getByText('An evolving collection of local observations.')).toBeVisible();
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});
});
