import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
	let originalMatchMedia: typeof window.matchMedia;
	let mediaQueryMock: {
		matches: boolean;
		addEventListener: ReturnType<typeof vi.fn>;
		removeEventListener: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		// Clear all classes from documentElement
		document.documentElement.className = "";

		// Mock matchMedia
		mediaQueryMock = {
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};

		originalMatchMedia = window.matchMedia;
		window.matchMedia = vi.fn(
			() => mediaQueryMock as unknown as MediaQueryList,
		);
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
		document.documentElement.className = "";
	});

	describe("app theme", () => {
		it("applies dark theme class", () => {
			renderHook(() =>
				useTheme({
					appTheme: "dark",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("dark")).toBe(true);
			expect(document.documentElement.classList.contains("light")).toBe(false);
		});

		it("applies light theme class", () => {
			renderHook(() =>
				useTheme({
					appTheme: "light",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("light")).toBe(true);
			expect(document.documentElement.classList.contains("dark")).toBe(false);
		});

		it("applies system theme based on media query (dark)", () => {
			mediaQueryMock.matches = true;

			renderHook(() =>
				useTheme({
					appTheme: "system",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("dark")).toBe(true);
		});

		it("applies system theme based on media query (light)", () => {
			mediaQueryMock.matches = false;

			renderHook(() =>
				useTheme({
					appTheme: "system",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("light")).toBe(true);
		});

		it("listens for system theme changes", () => {
			renderHook(() =>
				useTheme({
					appTheme: "system",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(mediaQueryMock.addEventListener).toHaveBeenCalledWith(
				"change",
				expect.any(Function),
			);
		});
	});

	describe("color theme", () => {
		it("does not add accent class for default theme", () => {
			renderHook(() =>
				useTheme({
					appTheme: "dark",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			const classes = Array.from(document.documentElement.classList);
			const hasAccent = classes.some((c) => c.startsWith("accent-"));
			expect(hasAccent).toBe(false);
		});

		it("adds accent class for blue theme", () => {
			renderHook(() =>
				useTheme({
					appTheme: "dark",
					colorTheme: "blue",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("accent-blue")).toBe(
				true,
			);
		});

		it("adds accent class for other color themes", () => {
			const colorThemes = [
				"red",
				"green",
				"purple",
				"orange",
				"cyan",
				"pink",
			] as const;

			for (const color of colorThemes) {
				document.documentElement.className = "";

				renderHook(() =>
					useTheme({
						appTheme: "dark",
						colorTheme: color,
						darkModeWhenRunning: false,
						compactMode: false,
						isRunning: false,
					}),
				);

				expect(
					document.documentElement.classList.contains(`accent-${color}`),
				).toBe(true);
			}
		});

		it("removes previous accent class when changing", () => {
			const { rerender } = renderHook(
				({ colorTheme }) =>
					useTheme({
						appTheme: "dark",
						colorTheme,
						darkModeWhenRunning: false,
						compactMode: false,
						isRunning: false,
					}),
				{ initialProps: { colorTheme: "blue" as "blue" | "red" } },
			);

			expect(document.documentElement.classList.contains("accent-blue")).toBe(
				true,
			);

			rerender({ colorTheme: "red" as const });

			expect(document.documentElement.classList.contains("accent-red")).toBe(
				true,
			);
			expect(document.documentElement.classList.contains("accent-blue")).toBe(
				false,
			);
		});
	});

	describe("compact mode", () => {
		it("adds compact class when enabled", () => {
			renderHook(() =>
				useTheme({
					appTheme: "dark",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: true,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("compact")).toBe(true);
		});

		it("does not add compact class when disabled", () => {
			renderHook(() =>
				useTheme({
					appTheme: "dark",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("compact")).toBe(
				false,
			);
		});
	});

	describe("dark mode when running", () => {
		it("adds running-dark class when enabled and running", () => {
			renderHook(() =>
				useTheme({
					appTheme: "light",
					colorTheme: "default",
					darkModeWhenRunning: true,
					compactMode: false,
					isRunning: true,
				}),
			);

			expect(document.documentElement.classList.contains("running-dark")).toBe(
				true,
			);
		});

		it("does not add running-dark class when not running", () => {
			renderHook(() =>
				useTheme({
					appTheme: "light",
					colorTheme: "default",
					darkModeWhenRunning: true,
					compactMode: false,
					isRunning: false,
				}),
			);

			expect(document.documentElement.classList.contains("running-dark")).toBe(
				false,
			);
		});

		it("does not add running-dark class when option disabled", () => {
			renderHook(() =>
				useTheme({
					appTheme: "light",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: true,
				}),
			);

			expect(document.documentElement.classList.contains("running-dark")).toBe(
				false,
			);
		});
	});

	describe("cleanup", () => {
		it("removes classes on unmount", () => {
			const { unmount } = renderHook(() =>
				useTheme({
					appTheme: "dark",
					colorTheme: "blue",
					darkModeWhenRunning: true,
					compactMode: true,
					isRunning: true,
				}),
			);

			expect(document.documentElement.classList.contains("dark")).toBe(true);
			expect(document.documentElement.classList.contains("accent-blue")).toBe(
				true,
			);
			expect(document.documentElement.classList.contains("compact")).toBe(true);
			expect(document.documentElement.classList.contains("running-dark")).toBe(
				true,
			);

			unmount();

			expect(document.documentElement.classList.contains("dark")).toBe(false);
			expect(document.documentElement.classList.contains("accent-blue")).toBe(
				false,
			);
			expect(document.documentElement.classList.contains("compact")).toBe(
				false,
			);
			expect(document.documentElement.classList.contains("running-dark")).toBe(
				false,
			);
		});

		it("removes media query listener on unmount", () => {
			const { unmount } = renderHook(() =>
				useTheme({
					appTheme: "system",
					colorTheme: "default",
					darkModeWhenRunning: false,
					compactMode: false,
					isRunning: false,
				}),
			);

			unmount();

			expect(mediaQueryMock.removeEventListener).toHaveBeenCalledWith(
				"change",
				expect.any(Function),
			);
		});
	});
});
