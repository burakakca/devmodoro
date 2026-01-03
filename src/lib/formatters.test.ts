import { describe, expect, it } from "vitest";
import {
	formatDurationLong,
	formatDurationPrecise,
	formatHour,
	formatRelativeDate,
	formatTime,
} from "./formatters";

describe("formatDurationLong", () => {
	it("formats zero seconds", () => {
		expect(formatDurationLong(0)).toBe("0m");
	});

	it("formats seconds under a minute", () => {
		expect(formatDurationLong(30)).toBe("0m");
		expect(formatDurationLong(59)).toBe("0m");
	});

	it("formats exactly one minute", () => {
		expect(formatDurationLong(60)).toBe("1m");
	});

	it("formats minutes only", () => {
		expect(formatDurationLong(300)).toBe("5m");
		expect(formatDurationLong(1500)).toBe("25m");
		expect(formatDurationLong(2700)).toBe("45m");
	});

	it("formats hours and minutes", () => {
		expect(formatDurationLong(3600)).toBe("1h 0m");
		expect(formatDurationLong(3660)).toBe("1h 1m");
		expect(formatDurationLong(5400)).toBe("1h 30m");
		expect(formatDurationLong(9000)).toBe("2h 30m");
	});

	it("handles large values", () => {
		expect(formatDurationLong(36000)).toBe("10h 0m");
		expect(formatDurationLong(86400)).toBe("24h 0m");
	});
});

describe("formatDurationPrecise", () => {
	it("formats zero seconds", () => {
		expect(formatDurationPrecise(0)).toBe("0s");
	});

	it("formats seconds only", () => {
		expect(formatDurationPrecise(1)).toBe("1s");
		expect(formatDurationPrecise(30)).toBe("30s");
		expect(formatDurationPrecise(59)).toBe("59s");
	});

	it("formats exactly one minute", () => {
		expect(formatDurationPrecise(60)).toBe("1m");
	});

	it("formats minutes without remaining seconds", () => {
		expect(formatDurationPrecise(120)).toBe("2m");
		expect(formatDurationPrecise(300)).toBe("5m");
	});

	it("formats minutes and seconds", () => {
		expect(formatDurationPrecise(61)).toBe("1m 1s");
		expect(formatDurationPrecise(90)).toBe("1m 30s");
		expect(formatDurationPrecise(330)).toBe("5m 30s");
	});

	it("correctly calculates 25 minutes exactly (no seconds shown)", () => {
		// The function intentionally omits 0 seconds for cleaner display
		expect(formatDurationPrecise(1500)).toBe("25m");
	});
});

describe("formatHour", () => {
	describe("12h format", () => {
		it("formats midnight", () => {
			expect(formatHour(0, "12h")).toBe("12AM");
		});

		it("formats morning hours", () => {
			expect(formatHour(1, "12h")).toBe("1AM");
			expect(formatHour(6, "12h")).toBe("6AM");
			expect(formatHour(11, "12h")).toBe("11AM");
		});

		it("formats noon", () => {
			expect(formatHour(12, "12h")).toBe("12PM");
		});

		it("formats afternoon/evening hours", () => {
			expect(formatHour(13, "12h")).toBe("1PM");
			expect(formatHour(18, "12h")).toBe("6PM");
			expect(formatHour(23, "12h")).toBe("11PM");
		});
	});

	describe("24h format", () => {
		it("formats midnight", () => {
			expect(formatHour(0, "24h")).toBe("00:00");
		});

		it("formats single digit hours", () => {
			expect(formatHour(1, "24h")).toBe("01:00");
			expect(formatHour(9, "24h")).toBe("09:00");
		});

		it("formats double digit hours", () => {
			expect(formatHour(10, "24h")).toBe("10:00");
			expect(formatHour(23, "24h")).toBe("23:00");
		});
	});

	it("defaults to 12h format", () => {
		expect(formatHour(14)).toBe("2PM");
	});
});

describe("formatRelativeDate", () => {
	it("returns 'Today' for today's date", () => {
		const now = Date.now();
		expect(formatRelativeDate(now)).toBe("Today");
	});

	it("returns 'Today' for earlier today", () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		expect(formatRelativeDate(today.getTime())).toBe("Today");
	});

	it("returns 'Yesterday' for yesterday", () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(formatRelativeDate(yesterday.getTime())).toBe("Yesterday");
	});

	it("returns 'X days ago' for 2-6 days ago", () => {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
		expect(formatRelativeDate(twoDaysAgo.getTime())).toBe("2 days ago");

		const sixDaysAgo = new Date();
		sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
		expect(formatRelativeDate(sixDaysAgo.getTime())).toBe("6 days ago");
	});

	it("returns formatted date for 7+ days ago", () => {
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const result = formatRelativeDate(sevenDaysAgo.getTime());
		// Should be a formatted date string, not "X days ago"
		expect(result).not.toContain("days ago");
	});
});

describe("formatTime", () => {
	it("formats a timestamp to time string", () => {
		// Create a known timestamp: 2:30 PM
		const date = new Date();
		date.setHours(14, 30, 0, 0);
		const result = formatTime(date.getTime());
		expect(result).toMatch(/2:30\s?PM/i);
	});

	it("formats morning time", () => {
		const date = new Date();
		date.setHours(9, 15, 0, 0);
		const result = formatTime(date.getTime());
		expect(result).toMatch(/9:15\s?AM/i);
	});

	it("formats midnight", () => {
		const date = new Date();
		date.setHours(0, 0, 0, 0);
		const result = formatTime(date.getTime());
		expect(result).toMatch(/12:00\s?AM/i);
	});

	it("formats noon", () => {
		const date = new Date();
		date.setHours(12, 0, 0, 0);
		const result = formatTime(date.getTime());
		expect(result).toMatch(/12:00\s?PM/i);
	});
});
