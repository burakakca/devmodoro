import { useSettings } from "../../contexts/SettingsContext";
import type { ColorTheme, HourFormat } from "../../types";

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
		value: ColorTheme | HourFormat | boolean,
	) => {
		updateSettings({
			theme: { ...theme, [key]: value },
		});
	};

	return (
		<div className="space-y-8">
			{/* Color Theme */}
			<div>
				<h3 className="text-lg font-medium text-white mb-4">Color Theme</h3>
				<div className="grid grid-cols-4 gap-3">
					{COLOR_THEMES.map((ct) => (
						<button
							key={ct.id}
							type="button"
							onClick={() => handleChange("colorTheme", ct.id)}
							className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
								theme.colorTheme === ct.id
									? "border-white bg-slate-800"
									: "border-transparent hover:bg-slate-800"
							}`}
						>
							<div className={`w-8 h-8 rounded-full ${ct.color}`} />
							<span className="text-xs text-slate-400">{ct.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Hour Format */}
			<div>
				<h3 className="text-lg font-medium text-white mb-4">Hour Format</h3>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => handleChange("hourFormat", "12h")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							theme.hourFormat === "12h"
								? "bg-indigo-600 text-white"
								: "bg-slate-800 text-slate-400 hover:text-white"
						}`}
					>
						12-hour
					</button>
					<button
						type="button"
						onClick={() => handleChange("hourFormat", "24h")}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							theme.hourFormat === "24h"
								? "bg-indigo-600 text-white"
								: "bg-slate-800 text-slate-400 hover:text-white"
						}`}
					>
						24-hour
					</button>
				</div>
			</div>

			{/* Other Options */}
			<div className="space-y-4">
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
			</div>
		</div>
	);
}

function ToggleRow({
	label,
	description,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<p className="text-white font-medium">{label}</p>
				<p className="text-sm text-slate-400">{description}</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative w-11 h-6 rounded-full transition-colors ${
					checked ? "bg-indigo-600" : "bg-slate-700"
				}`}
			>
				<span
					className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
						checked ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}
