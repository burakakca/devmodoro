import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import { type TimerMode, timerMachine } from "../machines/timerMachine";

interface UseTimerOptions {
	focusDuration: number;
	onSessionComplete?: (mode: TimerMode, duration: number) => void;
}

export function useTimer({
	focusDuration,
	onSessionComplete,
}: UseTimerOptions) {
	const workerRef = useRef<Worker | null>(null);
	const sessionStartRef = useRef<number | null>(null);
	const [state, send] = useMachine(timerMachine, {
		input: { focusDuration },
	});

	// Track session start time
	useEffect(() => {
		if (state.matches("running") && sessionStartRef.current === null) {
			sessionStartRef.current = Date.now();
		}
	}, [state.matches]);

	// Handle session completion
	useEffect(() => {
		if (state.matches("completed") && sessionStartRef.current !== null) {
			const duration = state.context.duration;
			const mode = state.context.mode;

			onSessionComplete?.(mode, duration);
			sessionStartRef.current = null;
		}
	}, [
		state.context.duration,
		state.context.mode,
		onSessionComplete,
		state.matches,
	]);

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
			if (state.matches("running")) {
				workerRef.current?.postMessage({ type: "START" });
			} else {
				workerRef.current?.postMessage({ type: "STOP" });
			}
		}
	}, [state.status, state.matches]);

	return { state, send };
}
