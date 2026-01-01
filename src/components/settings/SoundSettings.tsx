import { useSettings } from "../../contexts/SettingsContext";

export function SoundSettings() {
	const { settings, updateSettings } = useSettings();
	const { sound } = settings;

	const handleChange = (key: keyof typeof sound, value: number | boolean) => {
		updateSettings({
			sound: { ...sound, [key]: value },
		});
	};

	const handleAmbientChange = (
		key: keyof typeof sound.ambientMix,
		value: number,
	) => {
		updateSettings({
			sound: {
				...sound,
				ambientMix: { ...sound.ambientMix, [key]: value },
			},
		});
	};

	return (
		<div className="space-y-8">
			{/* Alarm Sound */}
			<div>
				<h3 className="text-lg font-medium text-white mb-4">Alarm Sound</h3>
				<div className="space-y-4">
					<div>
						<div className="flex items-center justify-between mb-2">
							<label htmlFor="alarm-volume" className="text-sm text-slate-400">
								Volume
							</label>
							<span className="text-sm text-white">{sound.alarmVolume}%</span>
						</div>
						<input
							type="range"
							id="alarm-volume"
							min={0}
							max={100}
							value={sound.alarmVolume}
							onChange={(e) =>
								handleChange("alarmVolume", Number(e.target.value))
							}
							className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
						/>
					</div>
					<div className="flex items-center gap-3">
						<label htmlFor="alarm-repeat" className="text-sm text-slate-400">
							Repeat
						</label>
						<input
							type="number"
							id="alarm-repeat"
							min={1}
							max={10}
							value={sound.alarmRepeat}
							onChange={(e) =>
								handleChange("alarmRepeat", Number(e.target.value))
							}
							className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<span className="text-sm text-slate-400">times</span>
					</div>
				</div>
			</div>

			{/* Ticking Sound */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-medium text-white">Ticking Sound</h3>
					<button
						type="button"
						role="switch"
						aria-checked={sound.tickingEnabled}
						onClick={() =>
							handleChange("tickingEnabled", !sound.tickingEnabled)
						}
						className={`relative w-11 h-6 rounded-full transition-colors ${
							sound.tickingEnabled ? "bg-indigo-600" : "bg-slate-700"
						}`}
					>
						<span
							className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
								sound.tickingEnabled ? "translate-x-5" : "translate-x-0"
							}`}
						/>
					</button>
				</div>
				{sound.tickingEnabled && (
					<div>
						<div className="flex items-center justify-between mb-2">
							<label
								htmlFor="ticking-volume"
								className="text-sm text-slate-400"
							>
								Volume
							</label>
							<span className="text-sm text-white">{sound.tickingVolume}%</span>
						</div>
						<input
							type="range"
							id="ticking-volume"
							min={0}
							max={100}
							value={sound.tickingVolume}
							onChange={(e) =>
								handleChange("tickingVolume", Number(e.target.value))
							}
							className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
						/>
					</div>
				)}
			</div>

			{/* Ambient Sounds */}
			<div>
				<h3 className="text-lg font-medium text-white mb-4">Ambient Sounds</h3>
				<div className="space-y-4">
					<AmbientSlider
						id="ambient-rain"
						label="Rain"
						value={sound.ambientMix.rain}
						onChange={(value) => handleAmbientChange("rain", value)}
					/>
					<AmbientSlider
						id="ambient-fire"
						label="Fireplace"
						value={sound.ambientMix.fire}
						onChange={(value) => handleAmbientChange("fire", value)}
					/>
					<AmbientSlider
						id="ambient-coffee"
						label="Coffee Shop"
						value={sound.ambientMix.coffee}
						onChange={(value) => handleAmbientChange("coffee", value)}
					/>
				</div>
			</div>
		</div>
	);
}

function AmbientSlider({
	id,
	label,
	value,
	onChange,
}: {
	id: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<div>
			<div className="flex items-center justify-between mb-2">
				<label htmlFor={id} className="text-sm text-slate-400">
					{label}
				</label>
				<span className="text-sm text-white">{value}%</span>
			</div>
			<input
				type="range"
				id={id}
				min={0}
				max={100}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
			/>
		</div>
	);
}
