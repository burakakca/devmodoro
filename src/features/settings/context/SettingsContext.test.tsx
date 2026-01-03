import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/db";
import { DEFAULT_SETTINGS } from "../services/settingsService";
import { SettingsProvider, useSettings } from "./SettingsContext";

const wrapper = ({ children }: { children: ReactNode }) => (
	<SettingsProvider>{children}</SettingsProvider>
);

describe("SettingsContext", () => {
	beforeEach(async () => {
		await db.settings.clear();
	});

	afterEach(async () => {
		await db.settings.clear();
	});

	describe("useSettings", () => {
		it("throws error when used outside SettingsProvider", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			expect(() => {
				renderHook(() => useSettings());
			}).toThrow("useSettings must be used within a SettingsProvider");

			consoleSpy.mockRestore();
		});

		it("provides settings object", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.settings).toBeDefined();
			expect(result.current.settings.timer).toBeDefined();
			expect(result.current.settings.task).toBeDefined();
		});

		it("provides updateSettings function", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(typeof result.current.updateSettings).toBe("function");
		});

		it("provides resetSettings function", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(typeof result.current.resetSettings).toBe("function");
		});

		it("returns default settings initially", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.settings.timer.pomodoro).toBe(
				DEFAULT_SETTINGS.timer.pomodoro,
			);
			expect(result.current.settings.theme.appTheme).toBe(
				DEFAULT_SETTINGS.theme.appTheme,
			);
		});
	});

	describe("updateSettings", () => {
		it("updates timer settings", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			await act(async () => {
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				await result.current.updateSettings({ timer: { pomodoro: 30 } as any });
			});

			await waitFor(() => {
				expect(result.current.settings.timer.pomodoro).toBe(30);
			});
		});

		it("updates theme settings", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			await act(async () => {
				await result.current.updateSettings({
					// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
					theme: { colorTheme: "blue" } as any,
				});
			});

			await waitFor(() => {
				expect(result.current.settings.theme.colorTheme).toBe("blue");
			});
		});

		it("preserves other settings when updating", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			const originalTheme = result.current.settings.theme.appTheme;

			await act(async () => {
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				await result.current.updateSettings({ timer: { pomodoro: 45 } as any });
			});

			await waitFor(() => {
				expect(result.current.settings.timer.pomodoro).toBe(45);
			});

			expect(result.current.settings.theme.appTheme).toBe(originalTheme);
		});
	});

	describe("resetSettings", () => {
		it("resets all settings to defaults", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// First modify settings
			await act(async () => {
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial update for deep merge
				await result.current.updateSettings({ timer: { pomodoro: 50 } as any });
			});

			await waitFor(() => {
				expect(result.current.settings.timer.pomodoro).toBe(50);
			});

			// Reset settings
			await act(async () => {
				await result.current.resetSettings();
			});

			await waitFor(() => {
				expect(result.current.settings.timer.pomodoro).toBe(
					DEFAULT_SETTINGS.timer.pomodoro,
				);
			});
		});
	});

	describe("isLoading", () => {
		it("is true initially", () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			// Initially isLoading should be true
			expect(result.current.isLoading).toBe(true);
		});

		it("becomes false after initialization", async () => {
			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});
		});
	});

	describe("deep merge with defaults", () => {
		it("provides all fields even with partial stored settings", async () => {
			// Store partial settings
			await db.settings.put({
				id: "default",
				timer: { pomodoro: 35 },
				// biome-ignore lint/suspicious/noExplicitAny: Testing partial settings for migration
			} as any);

			const { result } = renderHook(() => useSettings(), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Should have the stored value
			expect(result.current.settings.timer.pomodoro).toBe(35);
			// Should have defaults for missing values
			expect(result.current.settings.timer.shortBreak).toBe(
				DEFAULT_SETTINGS.timer.shortBreak,
			);
			expect(result.current.settings.task.autoCheckTasks).toBe(
				DEFAULT_SETTINGS.task.autoCheckTasks,
			);
		});
	});
});
