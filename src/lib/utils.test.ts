import { describe, expect, it } from "vitest";
import { formatTime } from "./utils";

describe("formatTime (timer format)", () => {
	it("formats zero seconds", () => {
		expect(formatTime(0)).toBe("00:00");
	});

	it("formats seconds only", () => {
		expect(formatTime(1)).toBe("00:01");
		expect(formatTime(9)).toBe("00:09");
		expect(formatTime(30)).toBe("00:30");
		expect(formatTime(59)).toBe("00:59");
	});

	it("formats minutes and seconds", () => {
		expect(formatTime(60)).toBe("01:00");
		expect(formatTime(61)).toBe("01:01");
		expect(formatTime(90)).toBe("01:30");
		expect(formatTime(599)).toBe("09:59");
	});

	it("formats double digit minutes", () => {
		expect(formatTime(600)).toBe("10:00");
		expect(formatTime(1500)).toBe("25:00");
		expect(formatTime(1530)).toBe("25:30");
	});

	it("formats large values (over an hour)", () => {
		expect(formatTime(3600)).toBe("60:00");
		expect(formatTime(3661)).toBe("61:01");
	});

	it("pads both minutes and seconds correctly", () => {
		expect(formatTime(65)).toBe("01:05");
		expect(formatTime(605)).toBe("10:05");
	});
});
