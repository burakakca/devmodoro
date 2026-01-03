import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/db";
import {
	DEFAULT_SETTINGS,
	getSettings,
	resetSettings,
	updateIntegrationSettings,
	updateNotificationSettings,
	updateSettings,
	updateSoundSettings,
	updateStateSettings,
	updateTaskSettings,
	updateThemeSettings,
	updateTimerSettings,
} from "./settingsService";

describe("settingsService", () => {
	beforeEach(async () => {
		await db.settings.clear();
	});

	describe("DEFAULT_SETTINGS", () => {
		it("has correct default timer settings", () => {
			expect(DEFAULT_SETTINGS.timer).toEqual({
				pomodoro: 25,
				shortBreak: 5,
				longBreak: 15,
				autoStartBreaks: false,
				autoStartPomodoros: false,
				longBreakInterval: 4,
			});
		});

		it("has correct default task settings", () => {
			expect(DEFAULT_SETTINGS.task).toEqual({
				autoCheckTasks: true,
				checkToBottom: true,
			});
		});

		it("has correct default sound settings", () => {
			expect(DEFAULT_SETTINGS.sound).toEqual({
				alarmVolume: 50,
				alarmRepeat: 1,
				tickingVolume: 50,
				tickingEnabled: true,
				ambientMix: {
					rain: 0,
					fire: 0,
					coffee: 0,
				},
			});
		});

		it("has correct default theme settings", () => {
			expect(DEFAULT_SETTINGS.theme).toEqual({
				appTheme: "dark",
				colorTheme: "default",
				hourFormat: "24h",
				darkModeWhenRunning: false,
				compactMode: false,
			});
		});

		it("has correct default notification settings", () => {
			expect(DEFAULT_SETTINGS.notification).toEqual({
				reminderMinutes: 0,
				browserNotifications: false,
			});
		});

		it("has correct default integration settings", () => {
			expect(DEFAULT_SETTINGS.integration).toEqual({
				webhookUrl: "",
				webhookEnabled: false,
				github: {
					token: "",
					username: "",
					isConnected: false,
				},
				autoPostToGitHub: false,
			});
		});

		it("has correct default state settings", () => {
			expect(DEFAULT_SETTINGS.state).toEqual({
				completedPomos: 0,
			});
		});
	});

	describe("getSettings", () => {
		it("returns default settings when none exist", async () => {
			const settings = await getSettings();
			expect(settings).toEqual(DEFAULT_SETTINGS);
		});

		it("creates default settings in database when none exist", async () => {
			await getSettings();
			const stored = await db.settings.get("default");
			expect(stored).toBeDefined();
		});

		it("merges stored settings with defaults (schema upgrade)", async () => {
			// Simulate an old settings record missing some fields
			await db.settings.add({
				id: "default",
				timer: { pomodoro: 30 },
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial settings for migration
			} as any);

			const settings = await getSettings();
			// Should have the stored value
			expect(settings.timer.pomodoro).toBe(30);
			// Should have defaults for missing values
			expect(settings.timer.shortBreak).toBe(5);
			expect(settings.task.autoCheckTasks).toBe(true);
		});
	});

	describe("updateSettings", () => {
		it("updates timer settings", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
			await updateSettings({ timer: { pomodoro: 50 } as any });

			const settings = await getSettings();
			expect(settings.timer.pomodoro).toBe(50);
			// Other timer settings should remain default
			expect(settings.timer.shortBreak).toBe(5);
		});

		it("updates nested sound settings", async () => {
			await updateSettings({
				sound: {
					alarmVolume: 75,
					ambientMix: { rain: 50 },
					// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				} as any,
			});

			const settings = await getSettings();
			expect(settings.sound.alarmVolume).toBe(75);
			expect(settings.sound.ambientMix.rain).toBe(50);
			expect(settings.sound.ambientMix.fire).toBe(0);
		});

		it("updates nested github settings", async () => {
			await updateSettings({
				integration: {
					github: {
						token: "ghp_test",
						username: "testuser",
						isConnected: true,
					},
					// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				} as any,
			});

			const settings = await getSettings();
			expect(settings.integration.github.token).toBe("ghp_test");
			expect(settings.integration.github.isConnected).toBe(true);
		});

		it("preserves existing settings when updating", async () => {
			// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
			await updateSettings({ timer: { pomodoro: 30 } as any });
			// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
			await updateSettings({ task: { autoCheckTasks: false } as any });

			const settings = await getSettings();
			expect(settings.timer.pomodoro).toBe(30);
			expect(settings.task.autoCheckTasks).toBe(false);
		});
	});

	describe("updateTimerSettings", () => {
		it("updates timer-specific settings", async () => {
			await updateTimerSettings({ pomodoro: 45, shortBreak: 10 });

			const settings = await getSettings();
			expect(settings.timer.pomodoro).toBe(45);
			expect(settings.timer.shortBreak).toBe(10);
		});
	});

	describe("updateTaskSettings", () => {
		it("updates task-specific settings", async () => {
			await updateTaskSettings({ autoCheckTasks: false });

			const settings = await getSettings();
			expect(settings.task.autoCheckTasks).toBe(false);
		});
	});

	describe("updateSoundSettings", () => {
		it("updates sound-specific settings", async () => {
			await updateSoundSettings({
				alarmVolume: 80,
				tickingEnabled: false,
			});

			const settings = await getSettings();
			expect(settings.sound.alarmVolume).toBe(80);
			expect(settings.sound.tickingEnabled).toBe(false);
		});
	});

	describe("updateThemeSettings", () => {
		it("updates theme-specific settings", async () => {
			await updateThemeSettings({
				appTheme: "light",
				colorTheme: "blue",
			});

			const settings = await getSettings();
			expect(settings.theme.appTheme).toBe("light");
			expect(settings.theme.colorTheme).toBe("blue");
		});
	});

	describe("updateNotificationSettings", () => {
		it("updates notification-specific settings", async () => {
			await updateNotificationSettings({
				browserNotifications: true,
				reminderMinutes: 5,
			});

			const settings = await getSettings();
			expect(settings.notification.browserNotifications).toBe(true);
			expect(settings.notification.reminderMinutes).toBe(5);
		});
	});

	describe("updateIntegrationSettings", () => {
		it("updates integration-specific settings", async () => {
			await updateIntegrationSettings({
				webhookEnabled: true,
				webhookUrl: "https://example.com/webhook",
			});

			const settings = await getSettings();
			expect(settings.integration.webhookEnabled).toBe(true);
			expect(settings.integration.webhookUrl).toBe(
				"https://example.com/webhook",
			);
		});
	});

	describe("updateStateSettings", () => {
		it("updates state-specific settings", async () => {
			await updateStateSettings({ completedPomos: 10 });

			const settings = await getSettings();
			expect(settings.state.completedPomos).toBe(10);
		});
	});

	describe("resetSettings", () => {
		it("resets all settings to defaults", async () => {
			// First modify settings
			await updateSettings({
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				timer: { pomodoro: 50 } as any,
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				task: { autoCheckTasks: false } as any,
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				sound: { alarmVolume: 100 } as any,
			});

			// Reset
			await resetSettings();

			const settings = await getSettings();
			expect(settings).toEqual(DEFAULT_SETTINGS);
		});
	});
});
