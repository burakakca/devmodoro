import { useEffect } from "react";
import type { ColorTheme } from "../types";

const THEME_COLORS: Record<
	ColorTheme,
	{ primary: string; primaryHover: string; primaryLight: string }
> = {
	default: {
		primary: "99 102 241", // indigo-600
		primaryHover: "129 140 248", // indigo-400
		primaryLight: "99 102 241", // indigo-600 with opacity
	},
	red: {
		primary: "220 38 38", // red-600
		primaryHover: "248 113 113", // red-400
		primaryLight: "220 38 38",
	},
	blue: {
		primary: "37 99 235", // blue-600
		primaryHover: "96 165 250", // blue-400
		primaryLight: "37 99 235",
	},
	green: {
		primary: "22 163 74", // green-600
		primaryHover: "74 222 128", // green-400
		primaryLight: "22 163 74",
	},
	purple: {
		primary: "147 51 234", // purple-600
		primaryHover: "192 132 252", // purple-400
		primaryLight: "147 51 234",
	},
	orange: {
		primary: "234 88 12", // orange-600
		primaryHover: "251 146 60", // orange-400
		primaryLight: "234 88 12",
	},
	cyan: {
		primary: "8 145 178", // cyan-600
		primaryHover: "34 211 238", // cyan-400
		primaryLight: "8 145 178",
	},
	pink: {
		primary: "219 39 119", // pink-600
		primaryHover: "244 114 182", // pink-400
		primaryLight: "219 39 119",
	},
};

interface UseThemeOptions {
	colorTheme: ColorTheme;
	darkModeWhenRunning: boolean;
	compactMode: boolean;
	isRunning: boolean;
}

export function useTheme({
	colorTheme,
	darkModeWhenRunning,
	compactMode,
	isRunning,
}: UseThemeOptions) {
	useEffect(() => {
		const root = document.documentElement;
		const colors = THEME_COLORS[colorTheme];

		// Set CSS custom properties for theme colors
		root.style.setProperty("--color-primary", colors.primary);
		root.style.setProperty("--color-primary-hover", colors.primaryHover);
		root.style.setProperty("--color-primary-light", colors.primaryLight);

		// Apply/remove compact mode class
		if (compactMode) {
			root.classList.add("compact");
		} else {
			root.classList.remove("compact");
		}

		// Apply/remove dark mode when running
		if (darkModeWhenRunning && isRunning) {
			root.classList.add("running-dark");
		} else {
			root.classList.remove("running-dark");
		}

		return () => {
			root.classList.remove("compact", "running-dark");
		};
	}, [colorTheme, darkModeWhenRunning, compactMode, isRunning]);
}
