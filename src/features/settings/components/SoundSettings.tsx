import { useSettings } from "@/features/settings/context/SettingsContext";

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
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Alarm Sound
				</legend>
				<div className="space-y-4">
					<div>
						<div className="flex items-center justify-between mb-2">
							<label
								htmlFor="alarm-volume"
								className="text-sm text-theme-text-secondary"
							>
								Volume
							</label>
							<span className="text-sm text-theme-text" aria-hidden="true">
								{sound.alarmVolume}%
							</span>
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
							className="w-full h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
					<div className="flex items-center gap-3">
						<label
							htmlFor="alarm-repeat"
							className="text-sm text-theme-text-secondary"
						>
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
							className="w-16 px-2 py-1 bg-theme-bg-secondary border border-theme-border rounded text-theme-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<span className="text-sm text-theme-text-secondary">times</span>
					</div>
				</div>
			</fieldset>

			{/* Ticking Sound */}
			<fieldset>
				<div className="flex items-center justify-between mb-4">
					<legend className="text-lg font-medium text-theme-text">
						Ticking Sound
					</legend>
					<button
						type="button"
						role="switch"
						id="ticking-switch"
						aria-checked={sound.tickingEnabled}
						onClick={() =>
							handleChange("tickingEnabled", !sound.tickingEnabled)
						}
						className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
							sound.tickingEnabled ? "bg-primary" : "bg-theme-bg-tertiary"
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
								className="text-sm text-theme-text-secondary"
							>
								Volume
							</label>
							<span className="text-sm text-theme-text" aria-hidden="true">
								{sound.tickingVolume}%
							</span>
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
							className="w-full h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary"
						/>
					</div>
				)}
			</fieldset>

			{/* Ambient Sounds */}
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Ambient Sounds
				</legend>
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
			</fieldset>
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
				<label htmlFor={id} className="text-sm text-theme-text-secondary">
					{label}
				</label>
				<span className="text-sm text-theme-text" aria-hidden="true">
					{value}%
				</span>
			</div>
			<input
				type="range"
				id={id}
				min={0}
				max={100}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full h-2 bg-theme-bg-tertiary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary"
			/>
		</div>
	);
}
