import { useSettings } from "../../contexts/SettingsContext";

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
			<div>
				<h3 className="text-lg font-medium text-white mb-4">Time (minutes)</h3>
				<div className="grid grid-cols-3 gap-4">
					<div>
						<label
							htmlFor="pomodoro"
							className="block text-sm text-slate-400 mb-2"
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
							className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="shortBreak"
							className="block text-sm text-slate-400 mb-2"
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
							className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label
							htmlFor="longBreak"
							className="block text-sm text-slate-400 mb-2"
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
							className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
				</div>
			</div>

			<div className="space-y-4">
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
			</div>

			<div>
				<label
					htmlFor="longBreakInterval"
					className="block text-sm text-slate-400 mb-2"
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
						className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<span className="text-sm text-slate-400">
						pomodoros before long break
					</span>
				</div>
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
