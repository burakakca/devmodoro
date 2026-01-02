import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import { type TimerMode, timerMachine } from "../machines/timerMachine";

interface UseTimerOptions {
	focusDuration: number;
	initialCompletedPomos?: number;
	onSessionComplete?: (mode: TimerMode, duration: number) => void;
	onPomosChange?: (count: number) => void;
}

export function useTimer({
	focusDuration,
	initialCompletedPomos = 0,
	onSessionComplete,
	onPomosChange,
}: UseTimerOptions) {
	const workerRef = useRef<Worker | null>(null);
	const sessionStartRef = useRef<number | null>(null);
	const prevCompletedPomosRef = useRef<number>(initialCompletedPomos);
	const hasInitializedRef = useRef(false);

	const [state, send] = useMachine(timerMachine, {
		input: { focusDuration },
	});

	// Initialize completedPomos from persisted state (only once on mount)
	useEffect(() => {
		if (!hasInitializedRef.current && initialCompletedPomos > 0) {
			send({ type: "SET_COMPLETED_POMOS", count: initialCompletedPomos });
			hasInitializedRef.current = true;
		}
	}, [initialCompletedPomos, send]);

	// Persist completedPomos changes
	useEffect(() => {
		const current = state.context.completedPomos;
		if (current !== prevCompletedPomosRef.current) {
			prevCompletedPomosRef.current = current;
			onPomosChange?.(current);
		}
	}, [state.context.completedPomos, onPomosChange]);

	// Compute state matches for dependency tracking
	const isRunning = state.matches("running");
	const isCompleted = state.matches("completed");
	const { duration, mode } = state.context;

	// Track session start time
	useEffect(() => {
		if (isRunning && sessionStartRef.current === null) {
			sessionStartRef.current = Date.now();
		}
	}, [isRunning]);

	// Handle session completion
	useEffect(() => {
		if (isCompleted && sessionStartRef.current !== null) {
			onSessionComplete?.(mode, duration);
			sessionStartRef.current = null;
		}
	}, [isCompleted, duration, mode, onSessionComplete]);

	useEffect(() => {
		// Initialize worker
		workerRef.current = new Worker(
			new URL("../workers/timerWorker.ts", import.meta.url),
			{
				type: "module",
			},
		);

		workerRef.current.onmessage = (event) => {
			if (event.data.type === "TICK") {
				send({ type: "TICK" });
			}
		};

		return () => {
			workerRef.current?.terminate();
		};
	}, [send]);

	useEffect(() => {
		if (state.status === "active") {
			if (isRunning) {
				workerRef.current?.postMessage({ type: "START" });
			} else {
				workerRef.current?.postMessage({ type: "STOP" });
			}
		}
	}, [state.status, isRunning]);

	return { state, send };
}
