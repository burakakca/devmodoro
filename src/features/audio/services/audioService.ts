import { Howl, Howler } from "howler";
import type { SoundSettings } from "@/types";

/**
 * Track identifiers for ambient sounds
 */
export type AmbientTrack = "rain" | "fire" | "coffee";

/**
 * Track identifiers for sound effects (excluding tick which is synthetic)
 */
export type SoundEffect = "alarm" | "focus" | "countdownTick";

/**
 * All available audio tracks (file-based)
 */
export type AudioTrack = AmbientTrack | SoundEffect;

/**
 * Current state of the sound mix
 */
export interface SoundMixState {
	masterVolume: number;
	ambient: Record<AmbientTrack, number>;
	alarm: number;
	focus: number;
	tick: number;
	tickingEnabled: boolean;
}

/**
 * Audio asset paths
 * Audio files are in public/audio/
 */
const AUDIO_PATHS: Record<AudioTrack, string> = {
	rain: "/audio/rain.mp3",
	fire: "/audio/fire.mp3",
	coffee: "/audio/coffee.mp3",
	alarm: "/audio/alarm.wav",
	focus: "/audio/focus.mp3",
	countdownTick: "/audio/countdown-tick.mp3",
};

/**
 * AudioManager - Singleton class for managing all audio playback using Howler.js
 *
 * Features:
 * - Ambient sound mixing (rain, fire, coffee shop)
 * - Sound effects (alarm, synthetic ticking)
 * - Volume control per track and master volume
 * - Looping support for ambient sounds
 * - Preloading for instant playback
 */
class AudioManager {
	private sounds: Map<AudioTrack, Howl> = new Map();
	private volumes: Map<AudioTrack | "tick", number> = new Map();
	private masterVolume = 1;
	private isLoaded = false;
	private loadPromise: Promise<void> | null = null;
	private tickingEnabled = false;

	// Synthetic tick sound using Web Audio API
	private audioContext: AudioContext | null = null;
	private tickInterval: ReturnType<typeof setInterval> | null = null;
	private tickVolume = 0;

	/**
	 * Preload all audio files
	 * Call this early in the app lifecycle for instant playback
	 */
	async loadSounds(): Promise<void> {
		// Return existing promise if already loading
		if (this.loadPromise) {
			return this.loadPromise;
		}

		this.loadPromise = this.doLoadSounds();
		return this.loadPromise;
	}

	private async doLoadSounds(): Promise<void> {
		if (this.isLoaded) return;

		const loadPromises: Promise<void>[] = [];

		// Load ambient sounds with looping
		const ambientTracks: AmbientTrack[] = ["rain", "fire", "coffee"];
		for (const track of ambientTracks) {
			loadPromises.push(this.loadTrack(track, true));
		}

		// Load sound effects (no looping)
		loadPromises.push(this.loadTrack("alarm", false));
		loadPromises.push(this.loadTrack("focus", false));
		loadPromises.push(this.loadTrack("countdownTick", false));

		await Promise.all(loadPromises);
		this.isLoaded = true;
	}

	private initAudioContext(): void {
		if (this.audioContext) return;

		try {
			// Create context - it will likely start in 'suspended' state
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext;
			if (AudioContextClass) {
				this.audioContext = new AudioContextClass();
			}
		} catch (error) {
			console.warn("Web Audio API not supported:", error);
		}
	}

	/**
	 * Resume all audio contexts (Web Audio API and Howler)
	 * Call this on user interaction to unlock audio
	 */
	async resumeContexts(): Promise<boolean> {
		this.initAudioContext();

		try {
			if (this.audioContext?.state === "suspended") {
				await this.audioContext.resume();
			}
			if (Howler.ctx && Howler.ctx.state === "suspended") {
				await Howler.ctx.resume();
			}
			return this.isAudioUnlocked();
		} catch (error) {
			console.error("Failed to resume audio context:", error);
			return false;
		}
	}

	/**
	 * Check if audio is currently unlocked and ready to play
	 */
	isAudioUnlocked(): boolean {
		const webAudioUnlocked =
			!this.audioContext || this.audioContext.state === "running";
		const howlerUnlocked = !Howler.ctx || Howler.ctx.state === "running";
		return webAudioUnlocked && howlerUnlocked;
	}

	private loadTrack(track: AudioTrack, loop: boolean): Promise<void> {
		return new Promise((resolve) => {
			const sound = new Howl({
				src: [AUDIO_PATHS[track]],
				loop,
				volume: 0,
				preload: true,
				onload: () => resolve(),
				onloaderror: (_id, error) => {
					console.warn(`Failed to load audio track "${track}":`, error);
					// Resolve anyway so other tracks can still load
					resolve();
				},
			});

			this.sounds.set(track, sound);
			this.volumes.set(track, 0);
		});
	}

	/**
	 * Play a synthetic tick sound using Web Audio API
	 */
	private async playTickSound(): Promise<void> {
		await this.resumeContexts();
		if (!this.audioContext || this.tickVolume === 0) return;

		const now = this.audioContext.currentTime;
		const volume = (this.tickVolume / 100) * this.masterVolume * 0.08;

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		oscillator.type = "sine";
		oscillator.frequency.setValueAtTime(150, now);
		oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.08);

		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.002);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

		oscillator.start(now);
		oscillator.stop(now + 0.1);
	}

	/**
	 * Play a countdown tick sound for the last seconds
	 * Uses preloaded audio file
	 */
	async playCountdownTick(_secondsRemaining: number): Promise<void> {
		await this.resumeContexts();
		this.play("countdownTick");
	}

	/**
	 * Play an audio track
	 * For ambient sounds, this starts the loop
	 * For alarm, this plays the sound once (or repeats based on settings)
	 */
	play(track: AudioTrack): void {
		const sound = this.sounds.get(track);
		if (!sound) return;

		// Only play if not already playing
		if (!sound.playing()) {
			sound.play();
		}
	}

	/**
	 * Stop an audio track
	 */
	stop(track: AudioTrack): void {
		const sound = this.sounds.get(track);
		if (!sound) return;

		sound.stop();
	}

	/**
	 * Stop all sounds
	 */
	stopAll(): void {
		for (const sound of this.sounds.values()) {
			sound.stop();
		}
		this.stopTicking();
	}

	/**
	 * Set volume for a specific track (0-100)
	 * The actual Howl volume is calculated as (trackVolume/100) * masterVolume
	 */
	setVolume(track: AudioTrack | "tick", volume: number): void {
		// Clamp volume between 0 and 100
		const clampedVolume = Math.max(0, Math.min(100, volume));
		this.volumes.set(track, clampedVolume);

		// Handle tick volume separately (synthetic sound)
		if (track === "tick") {
			this.tickVolume = clampedVolume;
			// Also update countdownTick if it exists
			const sound = this.sounds.get("countdownTick");
			if (sound) {
				sound.volume((clampedVolume / 100) * this.masterVolume);
			}
			return;
		}

		const sound = this.sounds.get(track);
		if (!sound) return;

		// Apply volume with master volume factor
		const effectiveVolume = (clampedVolume / 100) * this.masterVolume;
		sound.volume(effectiveVolume);

		// Auto-start/stop ambient tracks based on volume
		if (this.isAmbientTrack(track)) {
			if (clampedVolume > 0 && !sound.playing()) {
				sound.play();
			} else if (clampedVolume === 0 && sound.playing()) {
				sound.stop();
			}
		}
	}

	/**
	 * Set master volume (0-100)
	 * This affects all tracks proportionally
	 */
	setMasterVolume(volume: number): void {
		this.masterVolume = Math.max(0, Math.min(100, volume)) / 100;

		// Update all track volumes
		for (const [track, trackVolume] of this.volumes.entries()) {
			if (track === "tick") continue;
			const sound = this.sounds.get(track as AudioTrack);
			if (sound) {
				sound.volume((trackVolume / 100) * this.masterVolume);
			}
		}
	}

	/**
	 * Get the current mix state
	 */
	getMixState(): SoundMixState {
		return {
			masterVolume: this.masterVolume * 100,
			ambient: {
				rain: this.volumes.get("rain") ?? 0,
				fire: this.volumes.get("fire") ?? 0,
				coffee: this.volumes.get("coffee") ?? 0,
			},
			alarm: this.volumes.get("alarm") ?? 0,
			focus: this.volumes.get("focus") ?? 0,
			tick: this.tickVolume,
			tickingEnabled: this.tickingEnabled,
		};
	}

	/**
	 * Apply settings from the settings store
	 */
	applySettings(settings: SoundSettings): void {
		const wasTickingEnabled = this.tickingEnabled;
		const isCurrentlyTicking = this.isTickingActive();

		// Set ambient volumes
		this.setVolume("rain", settings.ambientMix.rain);
		this.setVolume("fire", settings.ambientMix.fire);
		this.setVolume("coffee", settings.ambientMix.coffee);

		// Set alarm volume
		this.setVolume("alarm", settings.alarmVolume);

		// Set focus sound volume (using alarm volume for now as they are both effects)
		this.setVolume("focus", settings.alarmVolume);

		// Set ticking
		this.tickingEnabled = settings.tickingEnabled;
		this.tickVolume = settings.tickingVolume;
		this.volumes.set("tick", settings.tickingVolume);

		// Set countdown tick volume (explicitly)
		this.setVolume("countdownTick", settings.tickingVolume);

		// Handle live updates to ticking
		if (isCurrentlyTicking && !this.tickingEnabled) {
			this.stopTicking();
		} else if (
			!isCurrentlyTicking &&
			this.tickingEnabled &&
			wasTickingEnabled === false
		) {
			// This part is tricky because we only want to start if we were ALREADY in a "running" state
			// that would have started ticking if it were enabled.
			// But since applySettings doesn't know about timer state,
			// it's better to let the Timer component handle the start/stop logic via its effect.
		}
	}

	/**
	 * Play alarm sound with optional repeat count
	 */
	async playAlarm(repeatCount = 1): Promise<void> {
		await this.resumeContexts();
		const sound = this.sounds.get("alarm");
		if (!sound) return;

		let played = 0;
		const playOnce = () => {
			played++;
			if (played < repeatCount) {
				// Set up listener for next play
				sound.once("end", playOnce);
			}
			sound.play();
		};

		// Remove any existing end listeners and start fresh
		sound.off("end");
		playOnce();
	}

	/**
	 * Play focus sound
	 */
	async playFocus(): Promise<void> {
		await this.resumeContexts();
		const sound = this.sounds.get("focus");
		if (!sound) return;

		sound.play();
	}

	/**
	 * Start ticking sound (only if enabled)
	 * Uses synthetic Web Audio API tick
	 */
	startTicking(): void {
		if (!this.tickingEnabled) {
			this.stopTicking();
			return;
		}

		if (this.tickInterval) return;

		// Play tick every second
		this.tickInterval = setInterval(() => {
			this.playTickSound();
		}, 1000);

		// Play first tick immediately
		this.playTickSound();
	}

	/**
	 * Stop ticking sound
	 */
	stopTicking(): void {
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = null;
		}
	}

	/**
	 * Check if a track is playing
	 */
	isPlaying(track: AudioTrack): boolean {
		const sound = this.sounds.get(track);
		return sound ? sound.playing() : false;
	}

	/**
	 * Check if ticking is active
	 */
	isTickingActive(): boolean {
		return this.tickInterval !== null;
	}

	/**
	 * Fade a track to a target volume over duration
	 */
	fade(track: AudioTrack, targetVolume: number, duration = 1000): void {
		const sound = this.sounds.get(track);
		if (!sound) return;

		const currentVolume = this.volumes.get(track) ?? 0;
		const targetEffective = (targetVolume / 100) * this.masterVolume;
		const currentEffective = (currentVolume / 100) * this.masterVolume;

		// Start playing if fading in
		if (targetVolume > 0 && !sound.playing()) {
			sound.volume(0);
			sound.play();
		}

		sound.fade(currentEffective, targetEffective, duration);
		this.volumes.set(track, targetVolume);

		// Stop after fade out
		if (targetVolume === 0) {
			setTimeout(() => {
				if (this.volumes.get(track) === 0) {
					sound.stop();
				}
			}, duration);
		}
	}

	private isAmbientTrack(track: AudioTrack): track is AmbientTrack {
		return ["rain", "fire", "coffee"].includes(track);
	}

	/**
	 * Dispose of all audio resources
	 */
	dispose(): void {
		this.stopTicking();
		for (const sound of this.sounds.values()) {
			sound.unload();
		}
		this.sounds.clear();
		this.volumes.clear();
		this.isLoaded = false;
		this.loadPromise = null;

		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}

// Export singleton instance
export const audioManager = new AudioManager();

// Export class for testing purposes
export { AudioManager };
