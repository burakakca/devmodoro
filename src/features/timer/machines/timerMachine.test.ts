import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { timerMachine } from "./timerMachine";

describe("timerMachine", () => {
	const createTimerActor = (focusDuration = 1500) => {
		return createActor(timerMachine, { input: { focusDuration } });
	};

	describe("initial state", () => {
		it("starts in idle state", () => {
			const actor = createTimerActor();
			actor.start();

			expect(actor.getSnapshot().value).toBe("idle");
		});

		it("initializes with provided focus duration", () => {
			const actor = createTimerActor(1800);
			actor.start();

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.timeLeft).toBe(1800);
			expect(snapshot.context.duration).toBe(1800);
		});

		it("initializes with default context values", () => {
			const actor = createTimerActor();
			actor.start();

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.mode).toBe("focus");
			expect(snapshot.context.completedPomos).toBe(0);
		});
	});

	describe("START event", () => {
		it("transitions from idle to running", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });

			expect(actor.getSnapshot().value).toBe("running");
		});

		it("does not transition from paused to running", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "PAUSE" });
			actor.send({ type: "START" });

			// Should still be paused, not running (START doesn't work in paused state)
			expect(actor.getSnapshot().value).toBe("paused");
		});
	});

	describe("PAUSE event", () => {
		it("transitions from running to paused", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "PAUSE" });

			expect(actor.getSnapshot().value).toBe("paused");
		});
	});

	describe("RESUME event", () => {
		it("transitions from paused to running", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "PAUSE" });
			actor.send({ type: "RESUME" });

			expect(actor.getSnapshot().value).toBe("running");
		});
	});

	describe("TICK event", () => {
		it("decrements timeLeft by 1", () => {
			const actor = createTimerActor(100);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });

			expect(actor.getSnapshot().context.timeLeft).toBe(99);
		});

		it("does not go below 0", () => {
			const actor = createTimerActor(1);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });
			actor.send({ type: "TICK" }); // Extra tick

			expect(actor.getSnapshot().context.timeLeft).toBe(0);
		});

		it("transitions to completed when timeLeft reaches 0", () => {
			const actor = createTimerActor(1);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });

			expect(actor.getSnapshot().value).toBe("completed");
		});
	});

	describe("SKIP event", () => {
		it("transitions from running to completed", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "SKIP" });

			expect(actor.getSnapshot().value).toBe("completed");
		});

		it("increments completedPomos when in focus mode", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "SKIP" });

			expect(actor.getSnapshot().context.completedPomos).toBe(1);
		});
	});

	describe("RESET event", () => {
		it("transitions to idle and resets timeLeft", () => {
			const actor = createTimerActor(100);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });
			actor.send({ type: "TICK" });
			actor.send({ type: "RESET" });

			const snapshot = actor.getSnapshot();
			expect(snapshot.value).toBe("idle");
			expect(snapshot.context.timeLeft).toBe(100);
		});

		it("works from any state", () => {
			const actor = createTimerActor(100);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "PAUSE" });
			actor.send({ type: "RESET" });

			expect(actor.getSnapshot().value).toBe("idle");
		});
	});

	describe("SET_MODE event", () => {
		it("changes mode and duration", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "SET_MODE", mode: "shortBreak", duration: 300 });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.mode).toBe("shortBreak");
			expect(snapshot.context.duration).toBe(300);
			expect(snapshot.context.timeLeft).toBe(300);
		});

		it("transitions to idle state", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "SET_MODE", mode: "longBreak", duration: 900 });

			expect(actor.getSnapshot().value).toBe("idle");
		});
	});

	describe("SET_DURATION event", () => {
		it("updates duration and timeLeft", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "SET_DURATION", duration: 1800 });

			const snapshot = actor.getSnapshot();
			expect(snapshot.context.duration).toBe(1800);
			expect(snapshot.context.timeLeft).toBe(1800);
		});

		it("transitions to idle state", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "SET_DURATION", duration: 1800 });

			expect(actor.getSnapshot().value).toBe("idle");
		});
	});

	describe("SET_COMPLETED_POMOS event", () => {
		it("sets completedPomos to specified count", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "SET_COMPLETED_POMOS", count: 5 });

			expect(actor.getSnapshot().context.completedPomos).toBe(5);
		});

		it("works in any state", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "SET_COMPLETED_POMOS", count: 3 });

			expect(actor.getSnapshot().context.completedPomos).toBe(3);
		});
	});

	describe("completed state", () => {
		it("increments completedPomos on entry (focus mode)", () => {
			const actor = createTimerActor(1);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });

			expect(actor.getSnapshot().context.completedPomos).toBe(1);
		});

		it("does not increment completedPomos for break modes", () => {
			const actor = createTimerActor();
			actor.start();
			actor.send({ type: "SET_MODE", mode: "shortBreak", duration: 1 });
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });

			expect(actor.getSnapshot().context.completedPomos).toBe(0);
		});

		it("can start a new session from completed state", () => {
			const actor = createTimerActor(1);
			actor.start();
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });
			// Now in completed state
			actor.send({ type: "START" });

			expect(actor.getSnapshot().value).toBe("idle");
		});
	});

	describe("multiple pomodoro cycles", () => {
		it("accumulates completedPomos across cycles", () => {
			const actor = createTimerActor(1);
			actor.start();

			// First pomodoro
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });
			expect(actor.getSnapshot().context.completedPomos).toBe(1);

			// Switch to break and complete
			actor.send({ type: "SET_MODE", mode: "shortBreak", duration: 1 });
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });
			expect(actor.getSnapshot().context.completedPomos).toBe(1);

			// Second pomodoro
			actor.send({ type: "SET_MODE", mode: "focus", duration: 1 });
			actor.send({ type: "START" });
			actor.send({ type: "TICK" });
			expect(actor.getSnapshot().context.completedPomos).toBe(2);
		});
	});
});
