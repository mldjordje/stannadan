import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const navigationConfig: FuseNavItemType[] = [
	{
		id: 'admin',
		title: 'Stan na Dan Nis',
		subtitle: 'Operativni panel za apartmane',
		type: 'group',
		icon: 'lucide:building-2',
		children: [
			{
				id: 'admin.dashboard',
				title: 'Dashboard',
				type: 'item',
				icon: 'lucide:layout-dashboard',
				url: '/admin'
			},
			{
				id: 'admin.apartments',
				title: 'Apartmani',
				type: 'item',
				icon: 'lucide:bed-double',
				url: '/admin/apartments'
			},
			{
				id: 'admin.reservations',
				title: 'Rezervacije',
				type: 'item',
				icon: 'lucide:receipt-text',
				url: '/admin/reservations'
			},
			{
				id: 'admin.calendar',
				title: 'Kalendar',
				type: 'item',
				icon: 'lucide:calendar-days',
				url: '/admin/calendar'
			},
			{
				id: 'admin.sync',
				title: 'Booking Sync',
				type: 'item',
				icon: 'lucide:refresh-cw',
				url: '/admin/channel-sync'
			}
		]
	}
];

export default navigationConfig;
