import { db } from "@/db/db";
import type { Settings } from "@/types";

const SETTINGS_ID = "default";

export const DEFAULT_SETTINGS: Settings = {
	id: SETTINGS_ID,
	timer: {
		pomodoro: 25,
		shortBreak: 5,
		longBreak: 15,
		autoStartBreaks: false,
		autoStartPomodoros: false,
		longBreakInterval: 4,
	},
	task: {
		autoCheckTasks: true,
		checkToBottom: true,
	},
	sound: {
		alarmVolume: 50,
		alarmRepeat: 1,
		tickingVolume: 50,
		tickingEnabled: true,
		ambientMix: {
			rain: 0,
			fire: 0,
			coffee: 0,
		},
	},
	theme: {
		appTheme: "dark",
		colorTheme: "default",
		hourFormat: "24h",
		darkModeWhenRunning: false,
		compactMode: false,
	},
	notification: {
		reminderMinutes: 0,
		browserNotifications: false,
	},
	integration: {
		webhookUrl: "",
		webhookEnabled: false,
		github: {
			token: "",
			username: "",
			isConnected: false,
		},
		autoPostToGitHub: false,
	},
	state: {
		completedPomos: 0,
	},
};

/**
 * Deep merge helper for nested objects
 */
function deepMerge(target: Settings, source: Partial<Settings>): Settings {
	return {
		id: target.id,
		timer: { ...target.timer, ...source.timer },
		task: { ...target.task, ...source.task },
		sound: {
			...target.sound,
			...source.sound,
			ambientMix: {
				...target.sound.ambientMix,
				...source.sound?.ambientMix,
			},
		},
		theme: { ...target.theme, ...source.theme },
		notification: { ...target.notification, ...source.notification },
		integration: {
			...target.integration,
			...source.integration,
			github: {
				...target.integration.github,
				...source.integration?.github,
			},
		},
		state: { ...target.state, ...source.state },
	};
}

/**
 * Get current settings, creating defaults if none exist
 */
export async function getSettings(): Promise<Settings> {
	const settings = await db.settings.get(SETTINGS_ID);

	if (!settings) {
		// Initialize with defaults
		await db.settings.add(DEFAULT_SETTINGS);
		return DEFAULT_SETTINGS;
	}

	// Merge with defaults to ensure all fields exist (handles schema upgrades)
	return deepMerge(DEFAULT_SETTINGS, settings);
}

/**
 * Update settings with partial values (deep merge)
 */
export async function updateSettings(
	updates: Partial<Omit<Settings, "id">>,
): Promise<void> {
	const current = await getSettings();
	const merged = deepMerge(current, updates);

	await db.settings.put(merged);
}

/**
 * Update a specific settings section
 */
export async function updateTimerSettings(
	updates: Partial<Settings["timer"]>,
): Promise<void> {
	await updateSettings({ timer: updates as Settings["timer"] });
}

export async function updateTaskSettings(
	updates: Partial<Settings["task"]>,
): Promise<void> {
	await updateSettings({ task: updates as Settings["task"] });
}

export async function updateSoundSettings(
	updates: Partial<Settings["sound"]>,
): Promise<void> {
	await updateSettings({ sound: updates as Settings["sound"] });
}

export async function updateThemeSettings(
	updates: Partial<Settings["theme"]>,
): Promise<void> {
	await updateSettings({ theme: updates as Settings["theme"] });
}

export async function updateNotificationSettings(
	updates: Partial<Settings["notification"]>,
): Promise<void> {
	await updateSettings({ notification: updates as Settings["notification"] });
}

export async function updateIntegrationSettings(
	updates: Partial<Settings["integration"]>,
): Promise<void> {
	await updateSettings({ integration: updates as Settings["integration"] });
}

export async function updateStateSettings(
	updates: Partial<Settings["state"]>,
): Promise<void> {
	await updateSettings({ state: updates as Settings["state"] });
}

/**
 * Reset all settings to defaults
 */
export async function resetSettings(): Promise<void> {
	await db.settings.put(DEFAULT_SETTINGS);
}
