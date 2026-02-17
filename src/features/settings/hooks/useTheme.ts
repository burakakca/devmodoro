import { useEffect } from "react";
import type { AppTheme, ColorTheme } from "@/types";

interface UseThemeOptions {
	appTheme: AppTheme;
	colorTheme: ColorTheme;
	darkModeWhenRunning: boolean;
	compactMode: boolean;
	isRunning: boolean;
}

/**
 * Hook to apply theme and accent classes to the document element.
 * CSS variables are defined in src/index.css based on these classes.
 */
export function useTheme({
	appTheme = "dark",
	colorTheme = "default",
	darkModeWhenRunning,
	compactMode,
	isRunning,
}: UseThemeOptions) {
	useEffect(() => {
		const root = document.documentElement;
		root.classList.add("theme-transition");

		// 1. Handle App Themes (dark, light, system)
		root.classList.remove("dark", "light");

		if (appTheme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(appTheme);
		}

		// 2. Handle Accent Colors
		// Remove all previous accent classes
		for (const className of Array.from(root.classList)) {
			if (className.startsWith("accent-")) {
				root.classList.remove(className);
			}
		}
		// Add new accent class
		if (colorTheme !== "default") {
			root.classList.add(`accent-${colorTheme}`);
		}

		// 3. Apply/remove compact mode class
		if (compactMode) {
			root.classList.add("compact");
		} else {
			root.classList.remove("compact");
		}

		// 4. Apply/remove dark mode when running
		if (darkModeWhenRunning && isRunning) {
			root.classList.add("running-dark");
		} else {
			root.classList.remove("running-dark");
		}

		// Listen for system theme changes if set to system
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = () => {
			if (appTheme === "system") {
				root.classList.remove("dark", "light");
				root.classList.add(mediaQuery.matches ? "dark" : "light");
			}
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
			root.classList.remove("compact", "running-dark", "dark", "light");
			for (const className of Array.from(root.classList)) {
				if (className.startsWith("accent-")) {
					root.classList.remove(className);
				}
			}
		};
	}, [appTheme, colorTheme, darkModeWhenRunning, compactMode, isRunning]);
}
