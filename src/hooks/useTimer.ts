import { useMachine } from "@xstate/react";
import { useEffect, useRef } from "react";
import { timerMachine } from "../machines/timerMachine";

export function useTimer(focusDuration: number) {
	const workerRef = useRef<Worker | null>(null);
	const [state, send] = useMachine(timerMachine, {
		input: { focusDuration },
	});

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
	}, [state.matches("running"), state.status]);

	return { state, send };
}
