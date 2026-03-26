export type UserRole = 'admin' | 'customer';

export type BookingSource = 'direct' | 'booking.com' | 'manual';

export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export type BlockType = 'cleaning' | 'maintenance' | 'owner-stay';

export type BookingSyncMode = 'ical' | 'connectivity-api';

export type BookingSyncState = 'needs-setup' | 'configured' | 'attention';

export type StayAmenity =
	| 'Self check-in'
	| 'Fast Wi-Fi'
	| 'Parking'
	| 'Pet friendly'
	| 'Air conditioning'
	| 'Kitchen'
	| 'Washer'
	| 'Workspace'
	| 'Smart TV'
	| 'Balcony'
	| 'Breakfast option';

export type NeighborhoodSpot = {
	label: string;
	distance: string;
};

export type PropertyProfile = {
	name: string;
	tagline: string;
	city: string;
	country: string;
	address: string;
	phone: string;
	email: string;
	googleMapsUrl: string;
	heroImage: string;
	description: string;
	highlights: string[];
	neighborhood: NeighborhoodSpot[];
};

export type Apartment = {
	id: string;
	slug: string;
	name: string;
	teaser: string;
	description: string;
	coverImage: string;
	gallery: string[];
	guests: number;
	beds: number;
	baths: number;
	size: number;
	pricePerNight: number;
	cleaningFee: number;
	rating: number;
	reviewCount: number;
	featured: boolean;
	locationNote: string;
	amenities: StayAmenity[];
	rules: string[];
};

export type Reservation = {
	id: string;
	apartmentId: string;
	guestName: string;
	guestEmail: string;
	guestPhone: string;
	checkIn: string;
	checkOut: string;
	guests: number;
	totalPrice: number;
	source: BookingSource;
	status: ReservationStatus;
	notes?: string;
	createdAt: string;
};

export type CalendarBlock = {
	id: string;
	apartmentId: string;
	title: string;
	start: string;
	end: string;
	type: BlockType;
	notes?: string;
};

export type BookingSyncMapping = {
	apartmentId: string;
	roomName: string;
	importUrl: string;
	exportPath: string;
};

export type SyncLogEntry = {
	id: string;
	status: 'success' | 'warning' | 'error';
	message: string;
	createdAt: string;
};

export type BookingSyncConfig = {
	mode: BookingSyncMode;
	state: BookingSyncState;
	propertyId: string;
	docsUrl: string;
	notes: string;
	lastSyncAt: string | null;
	mappings: BookingSyncMapping[];
	logs: SyncLogEntry[];
};

export type StayData = {
	property: PropertyProfile;
	apartments: Apartment[];
	reservations: Reservation[];
	calendarBlocks: CalendarBlock[];
	bookingSync: BookingSyncConfig;
};

export type CalendarEventRecord = {
	id: string;
	apartmentId: string;
	title: string;
	start: string;
	end: string;
	status: ReservationStatus | BlockType;
	source: BookingSource | 'calendar-block';
	guestName?: string;
};
