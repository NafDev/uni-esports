import { hashCode } from '$lib/util';
import { atom } from 'nanostores';

type NotificationInput = {
	type: 'primary' | 'danger' | 'warning' | 'success';
	message: string;
	heading?: string;
	timeout?: number;
};

type Notification = NotificationInput & {
	id: number;
	removeNotification: () => void;
};

export const notificationStore = atom<Notification[]>([]);

export function pushNotification(notification: NotificationInput) {
	if (!notification.timeout) {
		notification.timeout = 10000;
	}

	const newNotif: Notification = {
		...notification,
		id: hashCode(notification.type + notification.message + notification.timeout),
		removeNotification: null
	};

	newNotif.removeNotification = () => {
		const currentStore = notificationStore.get();
		const newStore = currentStore.filter((notif) => notif.id !== newNotif.id);

		if (currentStore.length !== newStore.length) {
			notificationStore.set(newStore);
			notificationStore.notify(newNotif.id);
		}
	};

	// Initialise a new store, filtering previous notifications which are identical to the new one
	const newStore = notificationStore.get().filter((notif) => notif.id !== newNotif.id);
	newStore.push(newNotif);

	notificationStore.set(newStore);
	notificationStore.notify(newNotif.id);

	setTimeout(newNotif.removeNotification, newNotif.timeout);
}
