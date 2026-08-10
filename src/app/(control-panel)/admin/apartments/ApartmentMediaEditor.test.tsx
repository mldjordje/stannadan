import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ApartmentMediaEditor from './ApartmentMediaEditor';

const cover = 'https://example.com/cover.webp';
const first = 'https://example.com/first.webp';
const second = 'https://example.com/second.webp';

describe('ApartmentMediaEditor', () => {
	it('sets a gallery image as cover and preserves the remaining order', () => {
		const onChange = vi.fn();
		render(
			<ApartmentMediaEditor
				coverImage={cover}
				gallery={[first, second]}
				uploading={false}
				onUpload={vi.fn()}
				onChange={onChange}
			/>
		);
		fireEvent.click(
			screen.getAllByRole('button', {
				name: 'Postavi kao naslovnu fotografiju'
			})[1]
		);
		expect(onChange).toHaveBeenCalledWith({
			coverImage: first,
			gallery: [cover, second]
		});
	});

	it('reorders and removes gallery images with labelled controls', () => {
		const onChange = vi.fn();
		render(
			<ApartmentMediaEditor
				coverImage={cover}
				gallery={[first, second]}
				uploading={false}
				onUpload={vi.fn()}
				onChange={onChange}
			/>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Pomeri fotografiju ranije' })[2]);
		expect(onChange).toHaveBeenCalledWith({
			coverImage: cover,
			gallery: [second, first]
		});
		fireEvent.click(screen.getAllByRole('button', { name: 'Ukloni fotografiju' })[1]);
		expect(onChange).toHaveBeenCalledWith({
			coverImage: cover,
			gallery: [second]
		});
	});
});
