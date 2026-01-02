import {
	CloudRain,
	Coffee,
	Flame,
	Volume2,
	VolumeOff,
	Waves,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { AmbientTrack } from "@/features/audio/services/audioService";
import { useSettings } from "@/features/settings/context/SettingsContext";

interface Preset {
	name: string;
	rain: number;
	fire: number;
	coffee: number;
}

const PRESETS: Preset[] = [
	{ name: "Focus", rain: 30, fire: 0, coffee: 20 },
	{ name: "Relaxed", rain: 50, fire: 40, coffee: 0 },
	{ name: "Silent", rain: 0, fire: 0, coffee: 0 },
];

const TRACK_CONFIG: {
	id: AmbientTrack;
	label: string;
	icon: typeof CloudRain;
	color: string;
}[] = [
	{ id: "rain", label: "Rain", icon: CloudRain, color: "bg-rain" },
	{ id: "fire", label: "Fireplace", icon: Flame, color: "bg-fire" },
	{ id: "coffee", label: "Coffee Shop", icon: Coffee, color: "bg-coffee" },
];

export function SoundMixer() {
	const { settings, updateSettings } = useSettings();
	const { sound } = settings;
	const [isMuted, setIsMuted] = useState(false);
	const [previewVolumes, setPreviewVolumes] = useState<Record<
		AmbientTrack,
		number
	> | null>(null);

	// Use preview volumes if muted, otherwise use actual settings
	const displayVolumes = isMuted
		? { rain: 0, fire: 0, coffee: 0 }
		: (previewVolumes ?? sound.ambientMix);

	const handleVolumeChange = useCallback(
		(track: AmbientTrack, value: number) => {
			if (isMuted) {
				// If muted, unmute first
				setIsMuted(false);
			}

			updateSettings({
				sound: {
					...sound,
					ambientMix: { ...sound.ambientMix, [track]: value },
				},
			});
		},
		[sound, updateSettings, isMuted],
	);

	const handleMuteToggle = useCallback(() => {
		if (!isMuted) {
			// Store current volumes before muting
			setPreviewVolumes({ ...sound.ambientMix });
			// Set all volumes to 0
			updateSettings({
				sound: {
					...sound,
					ambientMix: { rain: 0, fire: 0, coffee: 0 },
				},
			});
		} else {
			// Restore previous volumes
			if (previewVolumes) {
				updateSettings({
					sound: {
						...sound,
						ambientMix: previewVolumes,
					},
				});
			}
			setPreviewVolumes(null);
		}
		setIsMuted(!isMuted);
	}, [isMuted, sound, updateSettings, previewVolumes]);

	const handlePresetClick = useCallback(
		(preset: Preset) => {
			setIsMuted(false);
			setPreviewVolumes(null);
			updateSettings({
				sound: {
					...sound,
					ambientMix: {
						rain: preset.rain,
						fire: preset.fire,
						coffee: preset.coffee,
					},
				},
			});
		},
		[sound, updateSettings],
	);

	const totalVolume =
		sound.ambientMix.rain + sound.ambientMix.fire + sound.ambientMix.coffee;
	const isActive = totalVolume > 0 && !isMuted;

	return (
		<section
			className="bg-theme-bg-secondary/80 backdrop-blur-sm rounded-2xl p-4 border border-theme-border w-full max-w-md mx-auto"
			aria-labelledby="sound-mixer-heading"
		>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Waves className="w-5 h-5 text-primary" aria-hidden="true" />
					<h3
						id="sound-mixer-heading"
						className="text-sm font-medium text-theme-text"
					>
						Ambient Sounds
					</h3>
					{isActive && (
						<span
							className="w-2 h-2 rounded-full bg-success animate-pulse"
							title="Sounds are active"
						/>
					)}
				</div>
				<button
					type="button"
					onClick={handleMuteToggle}
					className="p-2 bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
					aria-label={
						isMuted ? "Unmute all ambient sounds" : "Mute all ambient sounds"
					}
				>
					{isMuted ? (
						<VolumeOff className="w-4 h-4" aria-hidden="true" />
					) : (
						<Volume2 className="w-4 h-4" aria-hidden="true" />
					)}
				</button>
			</div>

			{/* Track Sliders */}
			<fieldset className="space-y-3 mb-4">
				<legend className="sr-only">Individual sound volumes</legend>
				{TRACK_CONFIG.map(({ id, label, icon: Icon, color }) => (
					<div key={id} className="flex items-center gap-3">
						<div
							className={`p-1.5 rounded-lg ${
								displayVolumes[id] > 0 ? color : "bg-theme-bg-tertiary"
							} transition-colors`}
							aria-hidden="true"
						>
							<Icon
								className={`w-4 h-4 ${
									displayVolumes[id] > 0
										? "text-primary-foreground"
										: "text-theme-text-muted"
								}`}
							/>
						</div>
						<div className="flex-1">
							<div className="flex items-center justify-between mb-1">
								<label
									htmlFor={`volume-${id}`}
									className="text-xs text-theme-text-secondary"
								>
									{label}
								</label>
								<span
									className="text-xs text-theme-text-muted tabular-nums"
									aria-hidden="true"
								>
									{displayVolumes[id]}%
								</span>
							</div>
							<div className="relative">
								<input
									type="range"
									id={`volume-${id}`}
									min={0}
									max={100}
									value={displayVolumes[id]}
									onChange={(e) =>
										handleVolumeChange(id, Number(e.target.value))
									}
									disabled={isMuted}
									className="w-full h-1.5 bg-theme-bg-tertiary rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
								/>
								{/* Volume bar fill */}
								<div
									className={`absolute top-1/2 left-0 h-1.5 rounded-full pointer-events-none -translate-y-1/2 transition-all ${color}`}
									style={{ width: `${displayVolumes[id]}%`, opacity: 0.6 }}
									aria-hidden="true"
								/>
							</div>
						</div>
					</div>
				))}
			</fieldset>

			{/* Presets */}
			<fieldset className="flex gap-2">
				<legend className="sr-only">Sound presets</legend>
				{PRESETS.map((preset) => {
					const isCurrentPreset =
						!isMuted &&
						sound.ambientMix.rain === preset.rain &&
						sound.ambientMix.fire === preset.fire &&
						sound.ambientMix.coffee === preset.coffee;

					return (
						<button
							key={preset.name}
							type="button"
							onClick={() => handlePresetClick(preset)}
							aria-pressed={isCurrentPreset}
							className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
								isCurrentPreset
									? "bg-primary text-primary-foreground"
									: "bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text"
							}`}
						>
							{preset.name}
						</button>
					);
				})}
			</fieldset>
		</section>
	);
}
