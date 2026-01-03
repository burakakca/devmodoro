import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTimerNotifications } from "./useTimerNotifications";

// Mock useDocumentTitle
vi.mock("@/hooks/useDocumentTitle", () => ({
	useDocumentTitle: vi.fn(),
}));

// Mock useAudio
const mockPlayCountdownTick = vi.fn();
vi.mock("@/features/audio/context/AudioContext", () => ({
	useAudio: () => ({
		playCountdownTick: mockPlayCountdownTick,
	}),
}));

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

describe("useTimerNotifications", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls useDocumentTitle with correct props", () => {
		renderHook(() =>
			useTimerNotifications({
				timeLeft: 1500,
				mode: "focus",
				taskTitle: "My Task",
				isRunning: true,
				tickingEnabled: true,
			}),
		);

		expect(useDocumentTitle).toHaveBeenCalledWith({
			timeLeft: 1500,
			mode: "focus",
			taskTitle: "My Task",
		});
	});

	it("updates document title when props change", () => {
		const { rerender } = renderHook((props) => useTimerNotifications(props), {
			initialProps: {
				timeLeft: 1500,
				mode: "focus" as const,
				taskTitle: "Task 1",
				isRunning: true,
				tickingEnabled: true,
			},
		});

		rerender({
			timeLeft: 1200,
			mode: "focus",
			taskTitle: "Task 2",
			isRunning: true,
			tickingEnabled: true,
		});

		expect(useDocumentTitle).toHaveBeenLastCalledWith({
			timeLeft: 1200,
			mode: "focus",
			taskTitle: "Task 2",
		});
	});

	describe("countdown tick sound", () => {
		it("does not play tick when not running", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 6,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: false,
					tickingEnabled: true,
				},
			});

			rerender({
				timeLeft: 5,
				mode: "focus",
				taskTitle: undefined,
				isRunning: false,
				tickingEnabled: true,
			});

			expect(mockPlayCountdownTick).not.toHaveBeenCalled();
		});

		it("does not play tick when ticking disabled", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 6,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: true,
					tickingEnabled: false,
				},
			});

			rerender({
				timeLeft: 5,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: false,
			});

			expect(mockPlayCountdownTick).not.toHaveBeenCalled();
		});

		it("plays tick when crossing into last 5 seconds", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 6,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: true,
					tickingEnabled: true,
				},
			});

			// First render doesn't play (no previous value)
			expect(mockPlayCountdownTick).not.toHaveBeenCalled();

			// Crossing from 6 to 5 should trigger
			rerender({
				timeLeft: 5,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});

			expect(mockPlayCountdownTick).toHaveBeenCalledWith(5);
		});

		it("plays tick for each second from 5 to 1", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 6,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: true,
					tickingEnabled: true,
				},
			});

			// 6 -> 5
			rerender({
				timeLeft: 5,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});
			expect(mockPlayCountdownTick).toHaveBeenCalledWith(5);

			// 5 -> 4
			rerender({
				timeLeft: 4,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});
			expect(mockPlayCountdownTick).toHaveBeenCalledWith(4);

			// 4 -> 3
			rerender({
				timeLeft: 3,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});
			expect(mockPlayCountdownTick).toHaveBeenCalledWith(3);

			// 3 -> 2
			rerender({
				timeLeft: 2,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});
			expect(mockPlayCountdownTick).toHaveBeenCalledWith(2);

			// 2 -> 1
			rerender({
				timeLeft: 1,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});
			expect(mockPlayCountdownTick).toHaveBeenCalledWith(1);

			expect(mockPlayCountdownTick).toHaveBeenCalledTimes(5);
		});

		it("does not play tick at 0 seconds", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 1,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: true,
					tickingEnabled: true,
				},
			});

			vi.clearAllMocks();

			// 1 -> 0 should not trigger
			rerender({
				timeLeft: 0,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});

			expect(mockPlayCountdownTick).not.toHaveBeenCalled();
		});

		it("does not play tick when time increases", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 3,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: true,
					tickingEnabled: true,
				},
			});

			// Time increasing (e.g., mode switch) should not play
			rerender({
				timeLeft: 5,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});

			expect(mockPlayCountdownTick).not.toHaveBeenCalled();
		});

		it("does not play tick outside 1-5 second range", () => {
			const { rerender } = renderHook((props) => useTimerNotifications(props), {
				initialProps: {
					timeLeft: 100,
					mode: "focus" as const,
					taskTitle: undefined,
					isRunning: true,
					tickingEnabled: true,
				},
			});

			// 100 -> 99 should not trigger (outside range)
			rerender({
				timeLeft: 99,
				mode: "focus",
				taskTitle: undefined,
				isRunning: true,
				tickingEnabled: true,
			});

			expect(mockPlayCountdownTick).not.toHaveBeenCalled();
		});
	});
});
