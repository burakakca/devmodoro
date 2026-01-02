import { Monitor, Moon, Sun } from "lucide-react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import type { AppTheme, ColorTheme, HourFormat } from "@/types";
import { ToggleRow } from "./ToggleRow";

const APP_THEMES: {
	id: AppTheme;
	label: string;
	icon: typeof Moon;
	description: string;
}[] = [
	{ id: "light", label: "Light", icon: Sun, description: "Clean light theme" },
	{ id: "dark", label: "Dark", icon: Moon, description: "Dark slate theme" },
	{
		id: "system",
		label: "System",
		icon: Monitor,
		description: "Follow system setting",
	},
];

const COLOR_THEMES: { id: ColorTheme; color: string; label: string }[] = [
	{ id: "default", color: "bg-indigo-600", label: "Indigo" },
	{ id: "red", color: "bg-red-600", label: "Red" },
	{ id: "blue", color: "bg-blue-600", label: "Blue" },
	{ id: "green", color: "bg-green-600", label: "Green" },
	{ id: "purple", color: "bg-purple-600", label: "Purple" },
	{ id: "orange", color: "bg-orange-600", label: "Orange" },
	{ id: "cyan", color: "bg-cyan-600", label: "Cyan" },
	{ id: "pink", color: "bg-pink-600", label: "Pink" },
];

export function ThemeSettings() {
	const { settings, updateSettings } = useSettings();
	const { theme } = settings;

	const handleChange = (
		key: keyof typeof theme,
		value: AppTheme | ColorTheme | HourFormat | boolean,
	) => {
		updateSettings({
			theme: { ...theme, [key]: value },
		});
	};

	return (
		<div className="space-y-8">
			{/* App Theme */}
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Theme Mode
				</legend>
				<div className="grid grid-cols-3 gap-3">
					{APP_THEMES.map((at) => {
						const Icon = at.icon;
						const isActive = theme.appTheme === at.id;
						return (
							<button
								key={at.id}
								type="button"
								onClick={() => handleChange("appTheme", at.id)}
								aria-pressed={isActive}
								className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
									isActive
										? "border-primary bg-theme-bg-tertiary"
										: "border-transparent hover:bg-theme-bg-tertiary"
								}`}
							>
								<Icon
									className={`w-6 h-6 ${
										isActive ? "text-primary" : "text-theme-text-secondary"
									}`}
									aria-hidden="true"
								/>
								<span className="text-sm font-medium text-theme-text">
									{at.label}
								</span>
								<span className="text-xs text-theme-text-muted">
									{at.description}
								</span>
							</button>
						);
					})}
				</div>
			</fieldset>

			{/* Color Theme */}
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Accent Color
				</legend>
				<div className="grid grid-cols-4 gap-3">
					{COLOR_THEMES.map((ct) => {
						const isActive = theme.colorTheme === ct.id;
						return (
							<button
								key={ct.id}
								type="button"
								onClick={() => handleChange("colorTheme", ct.id)}
								aria-pressed={isActive}
								aria-label={`Accent color: ${ct.label}`}
								className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
									isActive
										? "border-theme-border bg-theme-bg-tertiary"
										: "border-transparent hover:bg-theme-bg-tertiary"
								}`}
							>
								<div
									className={`w-8 h-8 rounded-full ${ct.color}`}
									aria-hidden="true"
								/>
								<span className="text-xs text-theme-text-secondary">
									{ct.label}
								</span>
							</button>
						);
					})}
				</div>
			</fieldset>

			{/* Hour Format */}
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Hour Format
				</legend>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => handleChange("hourFormat", "12h")}
						aria-pressed={theme.hourFormat === "12h"}
						className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
							theme.hourFormat === "12h"
								? "bg-primary text-primary-foreground"
								: "bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text"
						}`}
					>
						12-hour
					</button>
					<button
						type="button"
						onClick={() => handleChange("hourFormat", "24h")}
						aria-pressed={theme.hourFormat === "24h"}
						className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
							theme.hourFormat === "24h"
								? "bg-primary text-primary-foreground"
								: "bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text"
						}`}
					>
						24-hour
					</button>
				</div>
			</fieldset>

			{/* Other Options */}
			<fieldset className="space-y-4">
				<legend className="sr-only">Appearance options</legend>
				<ToggleRow
					label="Dark Mode when Running"
					description="Dim the screen when timer is running"
					checked={theme.darkModeWhenRunning}
					onChange={(checked) => handleChange("darkModeWhenRunning", checked)}
				/>
				<ToggleRow
					label="Compact Mode"
					description="Use a smaller, more compact interface"
					checked={theme.compactMode}
					onChange={(checked) => handleChange("compactMode", checked)}
				/>
			</fieldset>
		</div>
	);
}
