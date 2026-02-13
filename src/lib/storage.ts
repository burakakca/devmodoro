/**
 * Requests persistent storage from the browser.
 * This helps prevent the browser from automatically deleting the IndexedDB database
 * when disk space is low or after a certain period of inactivity.
 *
 * @returns A promise that resolves to true if persistence is granted, false otherwise.
 */
export async function requestPersistence(): Promise<boolean> {
	if (!navigator.storage || !navigator.storage.persist) {
		return false;
	}

	const isPersisted = await navigator.storage.persisted();
	if (isPersisted) {
		return true;
	}

	return await navigator.storage.persist();
}

/**
 * Checks the current storage quota and usage.
 * Useful for debugging and informing the user about storage status.
 */
export async function getStorageInfo() {
	if (!navigator.storage || !navigator.storage.estimate) {
		return null;
	}

	return await navigator.storage.estimate();
}
