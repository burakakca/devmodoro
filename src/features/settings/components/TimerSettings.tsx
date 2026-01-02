import { useSettings } from "@/features/settings/context/SettingsContext";
import { ToggleRow } from "./ToggleRow";

export function TimerSettings() {
	const { settings, updateSettings } = useSettings();
	const { timer } = settings;

	const handleChange = (key: keyof typeof timer, value: number | boolean) => {
		updateSettings({
			timer: { ...timer, [key]: value },
		});
	};

	return (
		<div className="space-y-6">
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Time (minutes)
				</legend>
				<div className="grid grid-cols-3 gap-4">
					<div>
						<label
							htmlFor="pomodoro"
							className="block text-sm text-theme-text-secondary mb-2"
						>
							Pomodoro
						</label>
						<input
							type="number"
							id="pomodoro"
							value={timer.pomodoro}
							onChange={(e) => handleChange("pomodoro", Number(e.target.value))}
							min={1}
							max={60}
							className="w-full px-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
					<div>
						<label
							htmlFor="shortBreak"
							className="block text-sm text-theme-text-secondary mb-2"
						>
							Short Break
						</label>
						<input
							type="number"
							id="shortBreak"
							value={timer.shortBreak}
							onChange={(e) =>
								handleChange("shortBreak", Number(e.target.value))
							}
							min={1}
							max={30}
							className="w-full px-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
					<div>
						<label
							htmlFor="longBreak"
							className="block text-sm text-theme-text-secondary mb-2"
						>
							Long Break
						</label>
						<input
							type="number"
							id="longBreak"
							value={timer.longBreak}
							onChange={(e) =>
								handleChange("longBreak", Number(e.target.value))
							}
							min={1}
							max={60}
							className="w-full px-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				</div>
			</fieldset>

			<fieldset className="space-y-4">
				<legend className="sr-only">Automation options</legend>
				<ToggleRow
					label="Auto Start Breaks"
					description="Automatically start break when pomodoro ends"
					checked={timer.autoStartBreaks}
					onChange={(checked) => handleChange("autoStartBreaks", checked)}
				/>
				<ToggleRow
					label="Auto Start Pomodoros"
					description="Automatically start pomodoro when break ends"
					checked={timer.autoStartPomodoros}
					onChange={(checked) => handleChange("autoStartPomodoros", checked)}
				/>
			</fieldset>

			<div>
				<label
					htmlFor="longBreakInterval"
					className="block text-sm text-theme-text-secondary mb-2"
				>
					Long Break Interval
				</label>
				<div className="flex items-center gap-3">
					<input
						type="number"
						id="longBreakInterval"
						value={timer.longBreakInterval}
						onChange={(e) =>
							handleChange("longBreakInterval", Number(e.target.value))
						}
						min={1}
						max={10}
						className="w-20 px-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<span className="text-sm text-theme-text-secondary">
						pomodoros before long break
					</span>
				</div>
			</div>
		</div>
	);
}
