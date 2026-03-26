import { z } from 'zod';

export const apartmentSchema = z.object({
	name: z.string().min(2),
	slug: z.string().min(2),
	teaser: z.string().min(10),
	description: z.string().min(20),
	coverImage: z.string().min(1),
	gallery: z.array(z.string().min(1)).min(1),
	guests: z.coerce.number().int().min(1),
	beds: z.coerce.number().int().min(1),
	baths: z.coerce.number().int().min(1),
	size: z.coerce.number().int().min(10),
	pricePerNight: z.coerce.number().min(1),
	cleaningFee: z.coerce.number().min(0),
	rating: z.coerce.number().min(0).max(5),
	reviewCount: z.coerce.number().int().min(0),
	featured: z.coerce.boolean(),
	locationNote: z.string().min(2),
	amenities: z.array(z.string().min(1)).min(1),
	rules: z.array(z.string().min(1)).min(1)
});

export const reservationSchema = z.object({
	apartmentId: z.string().min(1),
	guestName: z.string().min(2),
	guestEmail: z.string().email(),
	guestPhone: z.string().min(5),
	checkIn: z.string().min(10),
	checkOut: z.string().min(10),
	guests: z.coerce.number().int().min(1),
	totalPrice: z.coerce.number().optional(),
	source: z.enum(['direct', 'booking.com', 'manual']),
	status: z.enum(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled']),
	notes: z.string().optional().default('')
});

export const calendarBlockSchema = z.object({
	apartmentId: z.string().min(1),
	title: z.string().min(2),
	start: z.string().min(10),
	end: z.string().min(10),
	type: z.enum(['cleaning', 'maintenance', 'owner-stay']),
	notes: z.string().optional().default('')
});

export const bookingSyncSchema = z.object({
	mode: z.enum(['ical', 'connectivity-api']),
	state: z.enum(['needs-setup', 'configured', 'attention']),
	propertyId: z.string().min(2),
	notes: z.string().min(2),
	mappings: z.array(
		z.object({
			apartmentId: z.string().min(1),
			roomName: z.string().min(2),
			importUrl: z.string(),
			exportPath: z.string().min(1)
		})
	)
});
