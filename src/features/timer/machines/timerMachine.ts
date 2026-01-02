import { assign, setup } from "xstate";

export type TimerMode = "focus" | "shortBreak" | "longBreak";

export interface TimerContext {
	timeLeft: number;
	duration: number;
	mode: TimerMode;
	completedPomos: number;
}

export type TimerEvent =
	| { type: "START" }
	| { type: "PAUSE" }
	| { type: "RESUME" }
	| { type: "RESET" }
	| { type: "SKIP" }
	| { type: "TICK" }
	| { type: "SET_DURATION"; duration: number }
	| { type: "SET_MODE"; mode: TimerMode; duration: number }
	| { type: "SET_COMPLETED_POMOS"; count: number };

export const timerMachine = setup({
	types: {
		context: {} as TimerContext,
		events: {} as TimerEvent,
		input: {} as { focusDuration: number },
	},
	actions: {
		tick: assign({
			timeLeft: ({ context }) => Math.max(0, context.timeLeft - 1),
		}),
		resetTime: assign({
			timeLeft: ({ context }) => context.duration,
		}),
		incrementPomos: assign({
			completedPomos: ({ context }) =>
				context.mode === "focus"
					? context.completedPomos + 1
					: context.completedPomos,
		}),
		setCompletedPomos: assign({
			completedPomos: ({ event }) =>
				event.type === "SET_COMPLETED_POMOS" ? event.count : 0,
		}),
	},
	guards: {
		isFinished: ({ context }) => context.timeLeft === 0,
	},
}).createMachine({
	id: "timer",
	initial: "idle",
	context: ({ input }) => ({
		timeLeft: input.focusDuration,
		duration: input.focusDuration,
		mode: "focus",
		completedPomos: 0,
	}),
	states: {
		idle: {
			on: {
				START: "running",
				SET_DURATION: {
					actions: assign({
						duration: ({ event }) => event.duration,
						timeLeft: ({ event }) => event.duration,
					}),
				},
				SET_MODE: {
					actions: assign({
						mode: ({ event }) => event.mode,
						duration: ({ event }) => event.duration,
						timeLeft: ({ event }) => event.duration,
					}),
				},
				SET_COMPLETED_POMOS: {
					actions: "setCompletedPomos",
				},
			},
		},
		running: {
			on: {
				PAUSE: "paused",
				TICK: {
					actions: "tick",
					target: "checkingFinished",
				},
				RESET: {
					target: "idle",
					actions: "resetTime",
				},
				SKIP: "completed",
			},
		},
		checkingFinished: {
			always: [
				{
					guard: "isFinished",
					target: "completed",
				},
				{ target: "running" },
			],
		},
		paused: {
			on: {
				RESUME: "running",
				RESET: {
					target: "idle",
					actions: "resetTime",
				},
			},
		},
		completed: {
			entry: "incrementPomos",
			on: {
				RESET: "idle",
				SET_MODE: {
					target: "idle",
					actions: assign({
						mode: ({ event }) => event.mode,
						duration: ({ event }) => event.duration,
						timeLeft: ({ event }) => event.duration,
					}),
				},
			},
		},
	},
});
