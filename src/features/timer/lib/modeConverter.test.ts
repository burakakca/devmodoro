import { describe, expect, it } from "vitest";
import { timerModeToSessionMode } from "./modeConverter";

describe("timerModeToSessionMode", () => {
	it("converts focus mode", () => {
		expect(timerModeToSessionMode("focus")).toBe("focus");
	});

	it("converts shortBreak to short-break", () => {
		expect(timerModeToSessionMode("shortBreak")).toBe("short-break");
	});

	it("converts longBreak to long-break", () => {
		expect(timerModeToSessionMode("longBreak")).toBe("long-break");
	});
});
