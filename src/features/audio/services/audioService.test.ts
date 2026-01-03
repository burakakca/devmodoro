import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AudioManager } from "./audioService";

// Mock Howler
vi.mock("howler", () => {
	class MockHowl {
		private _volume = 0;
		private _playing = false;

		constructor(options: { onload?: () => void }) {
			// Simulate async load
			setTimeout(() => options.onload?.(), 0);
		}

		play = vi.fn(() => {
			this._playing = true;
		});
		stop = vi.fn(() => {
			this._playing = false;
		});
		volume = vi.fn((v?: number) => {
			if (v !== undefined) this._volume = v;
			return this._volume;
		});
		fade = vi.fn();
		playing = vi.fn(() => this._playing);
		unload = vi.fn();
		once = vi.fn();
		off = vi.fn();
	}

	return {
		Howl: MockHowl,
		Howler: {
			ctx: null,
		},
	};
});

describe("AudioManager", () => {
	let audioManager: AudioManager;

	beforeEach(() => {
		audioManager = new AudioManager();
		vi.clearAllMocks();
	});

	afterEach(() => {
		audioManager.dispose();
	});

	describe("getMixState", () => {
		it("returns initial state", () => {
			const state = audioManager.getMixState();

			expect(state.masterVolume).toBe(100);
			expect(state.ambient.rain).toBe(0);
			expect(state.ambient.fire).toBe(0);
			expect(state.ambient.coffee).toBe(0);
			expect(state.alarm).toBe(0);
			expect(state.focus).toBe(0);
			expect(state.tick).toBe(0);
			expect(state.tickingEnabled).toBe(false);
		});
	});

	describe("setMasterVolume", () => {
		it("sets master volume", async () => {
			await audioManager.loadSounds();
			audioManager.setMasterVolume(50);

			const state = audioManager.getMixState();
			expect(state.masterVolume).toBe(50);
		});

		it("clamps volume to 0-100 range", async () => {
			await audioManager.loadSounds();

			audioManager.setMasterVolume(150);
			expect(audioManager.getMixState().masterVolume).toBe(100);

			audioManager.setMasterVolume(-50);
			expect(audioManager.getMixState().masterVolume).toBe(0);
		});
	});

	describe("setVolume", () => {
		it("sets volume for ambient track", async () => {
			await audioManager.loadSounds();
			audioManager.setVolume("rain", 50);

			const state = audioManager.getMixState();
			expect(state.ambient.rain).toBe(50);
		});

		it("sets volume for tick (synthetic)", async () => {
			await audioManager.loadSounds();
			audioManager.setVolume("tick", 75);

			const state = audioManager.getMixState();
			expect(state.tick).toBe(75);
		});

		it("clamps volume to 0-100 range", async () => {
			await audioManager.loadSounds();

			audioManager.setVolume("rain", 150);
			expect(audioManager.getMixState().ambient.rain).toBe(100);

			audioManager.setVolume("fire", -50);
			expect(audioManager.getMixState().ambient.fire).toBe(0);
		});
	});

	describe("applySettings", () => {
		it("applies sound settings", async () => {
			await audioManager.loadSounds();

			audioManager.applySettings({
				alarmVolume: 80,
				alarmRepeat: 2,
				tickingVolume: 60,
				tickingEnabled: true,
				ambientMix: {
					rain: 50,
					fire: 30,
					coffee: 0,
				},
			});

			const state = audioManager.getMixState();
			expect(state.ambient.rain).toBe(50);
			expect(state.ambient.fire).toBe(30);
			expect(state.ambient.coffee).toBe(0);
			expect(state.alarm).toBe(80);
			expect(state.tick).toBe(60);
			expect(state.tickingEnabled).toBe(true);
		});
	});

	describe("startTicking / stopTicking", () => {
		beforeEach(async () => {
			await audioManager.loadSounds();
		});

		it("does not start if ticking is disabled", () => {
			audioManager.applySettings({
				alarmVolume: 50,
				alarmRepeat: 1,
				tickingVolume: 50,
				tickingEnabled: false,
				ambientMix: { rain: 0, fire: 0, coffee: 0 },
			});

			audioManager.startTicking();
			expect(audioManager.isTickingActive()).toBe(false);
		});

		it("starts if ticking is enabled", () => {
			audioManager.applySettings({
				alarmVolume: 50,
				alarmRepeat: 1,
				tickingVolume: 50,
				tickingEnabled: true,
				ambientMix: { rain: 0, fire: 0, coffee: 0 },
			});

			audioManager.startTicking();
			expect(audioManager.isTickingActive()).toBe(true);
		});

		it("stops ticking", () => {
			audioManager.applySettings({
				alarmVolume: 50,
				alarmRepeat: 1,
				tickingVolume: 50,
				tickingEnabled: true,
				ambientMix: { rain: 0, fire: 0, coffee: 0 },
			});

			audioManager.startTicking();
			expect(audioManager.isTickingActive()).toBe(true);

			audioManager.stopTicking();
			expect(audioManager.isTickingActive()).toBe(false);
		});
	});

	describe("isTickingActive", () => {
		it("returns false initially", () => {
			expect(audioManager.isTickingActive()).toBe(false);
		});
	});

	describe("stopAll", () => {
		it("stops all sounds and ticking", async () => {
			await audioManager.loadSounds();
			audioManager.applySettings({
				alarmVolume: 50,
				alarmRepeat: 1,
				tickingVolume: 50,
				tickingEnabled: true,
				ambientMix: { rain: 0, fire: 0, coffee: 0 },
			});

			audioManager.startTicking();
			expect(audioManager.isTickingActive()).toBe(true);

			audioManager.stopAll();
			expect(audioManager.isTickingActive()).toBe(false);
		});
	});

	describe("dispose", () => {
		it("clears all state", async () => {
			await audioManager.loadSounds();
			audioManager.setVolume("rain", 50);
			audioManager.applySettings({
				alarmVolume: 50,
				alarmRepeat: 1,
				tickingVolume: 50,
				tickingEnabled: true,
				ambientMix: { rain: 0, fire: 0, coffee: 0 },
			});
			audioManager.startTicking();

			audioManager.dispose();

			expect(audioManager.isTickingActive()).toBe(false);
			// After dispose, getMixState returns default values
			const state = audioManager.getMixState();
			expect(state.masterVolume).toBe(100);
		});
	});

	describe("loadSounds", () => {
		it("can be called multiple times safely", async () => {
			await audioManager.loadSounds();
			await audioManager.loadSounds();
			// Should not throw
		});
	});
});
