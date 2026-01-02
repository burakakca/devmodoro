import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	type AmbientTrack,
	audioManager,
	type SoundMixState,
} from "@/features/audio/services/audioService";
import { useSettings } from "@/features/settings/context/SettingsContext";

interface AudioContextValue {
	/** Whether audio is loaded and ready */
	isReady: boolean;
	/** Current mix state */
	mixState: SoundMixState;
	/** Play the alarm sound with optional repeat count */
	playAlarm: (repeatCount?: number) => void;
	/** Start the ticking sound (respects tickingEnabled setting) */
	startTicking: () => void;
	/** Stop the ticking sound */
	stopTicking: () => void;
	/** Stop all sounds */
	stopAll: () => void;
	/** Set volume for an ambient track (0-100) */
	setAmbientVolume: (track: AmbientTrack, volume: number) => void;
	/** Fade an ambient track to target volume */
	fadeAmbient: (
		track: AmbientTrack,
		targetVolume: number,
		duration?: number,
	) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
	const { settings } = useSettings();
	const [isReady, setIsReady] = useState(false);
	const [mixState, setMixState] = useState<SoundMixState>(() =>
		audioManager.getMixState(),
	);

	// Load sounds on mount
	useEffect(() => {
		audioManager
			.loadSounds()
			.then(() => {
				setIsReady(true);
				setMixState(audioManager.getMixState());
			})
			.catch((error) => {
				console.error("Failed to load audio:", error);
			});

		// Resume audio on user interaction
		const resumeAudio = () => {
			audioManager.resumeContexts();
		};

		document.addEventListener("click", resumeAudio);
		document.addEventListener("keydown", resumeAudio);
		document.addEventListener("touchstart", resumeAudio);

		// Cleanup on unmount
		return () => {
			audioManager.stopAll();
			document.removeEventListener("click", resumeAudio);
			document.removeEventListener("keydown", resumeAudio);
			document.removeEventListener("touchstart", resumeAudio);
		};
	}, []);

	// Sync with settings changes
	useEffect(() => {
		if (!isReady) return;

		audioManager.applySettings(settings.sound);
		setMixState(audioManager.getMixState());
	}, [isReady, settings.sound]);

	const playAlarm = useCallback(
		(repeatCount?: number) => {
			if (!isReady) return;
			audioManager.playAlarm(repeatCount ?? settings.sound.alarmRepeat);
		},
		[isReady, settings.sound.alarmRepeat],
	);

	const startTicking = useCallback(() => {
		if (!isReady) return;
		audioManager.startTicking();
	}, [isReady]);

	const stopTicking = useCallback(() => {
		audioManager.stopTicking();
	}, []);

	const stopAll = useCallback(() => {
		audioManager.stopAll();
	}, []);

	const setAmbientVolume = useCallback(
		(track: AmbientTrack, volume: number) => {
			if (!isReady) return;
			audioManager.setVolume(track, volume);
			setMixState(audioManager.getMixState());
		},
		[isReady],
	);

	const fadeAmbient = useCallback(
		(track: AmbientTrack, targetVolume: number, duration = 1000) => {
			if (!isReady) return;
			audioManager.fade(track, targetVolume, duration);
			// Update mix state after fade completes
			setTimeout(() => {
				setMixState(audioManager.getMixState());
			}, duration);
		},
		[isReady],
	);

	return (
		<AudioContext.Provider
			value={{
				isReady,
				mixState,
				playAlarm,
				startTicking,
				stopTicking,
				stopAll,
				setAmbientVolume,
				fadeAmbient,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export function useAudio() {
	const context = useContext(AudioContext);
	if (!context) {
		throw new Error("useAudio must be used within an AudioProvider");
	}
	return context;
}
