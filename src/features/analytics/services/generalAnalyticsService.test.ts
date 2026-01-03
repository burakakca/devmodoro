import { describe, expect, it } from "vitest";
import type { Session } from "@/types";
import {
	computeAnalyticsData,
	getLocalDateKey,
	getTimeRangeConfig,
} from "./generalAnalyticsService";

describe("generalAnalyticsService", () => {
	describe("getLocalDateKey", () => {
		it("formats date as YYYY-MM-DD", () => {
			const date = new Date(2024, 0, 15); // January 15, 2024
			expect(getLocalDateKey(date)).toBe("2024-01-15");
		});

		it("pads single digit months", () => {
			const date = new Date(2024, 4, 5); // May 5, 2024
			expect(getLocalDateKey(date)).toBe("2024-05-05");
		});

		it("pads single digit days", () => {
			const date = new Date(2024, 11, 3); // December 3, 2024
			expect(getLocalDateKey(date)).toBe("2024-12-03");
		});

		it("handles end of year", () => {
			const date = new Date(2024, 11, 31); // December 31, 2024
			expect(getLocalDateKey(date)).toBe("2024-12-31");
		});

		it("handles beginning of year", () => {
			const date = new Date(2024, 0, 1); // January 1, 2024
			expect(getLocalDateKey(date)).toBe("2024-01-01");
		});
	});

	describe("getTimeRangeConfig", () => {
		it("returns correct config for today", () => {
			const config = getTimeRangeConfig("today");
			const now = new Date();
			const startOfDay = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			).getTime();

			expect(config.days).toBe(1);
			expect(config.showWeekday).toBe(false);
			expect(config.start).toBe(startOfDay);
		});

		it("returns correct config for week", () => {
			const config = getTimeRangeConfig("week");
			expect(config.days).toBe(7);
			expect(config.showWeekday).toBe(true);
		});

		it("returns correct config for month", () => {
			const config = getTimeRangeConfig("month");
			expect(config.days).toBe(30);
			expect(config.showWeekday).toBe(false);
		});

		it("returns correct config for all time", () => {
			const config = getTimeRangeConfig("all");
			expect(config.days).toBe(0);
			expect(config.start).toBe(0);
			expect(config.showWeekday).toBe(false);
		});

		it("end time is end of current day", () => {
			const config = getTimeRangeConfig("today");
			const now = new Date();
			const expectedEnd = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				23,
				59,
				59,
				999,
			).getTime();

			expect(config.end).toBe(expectedEnd);
		});
	});

	describe("computeAnalyticsData", () => {
		const createSession = (
			startTime: number,
			duration: number,
			mode: Session["mode"] = "focus",
		): Session => ({
			id: `session-${startTime}`,
			taskId: "task-1",
			startTime,
			endTime: startTime + duration * 1000,
			duration,
			mode,
		});

		it("returns zero values for empty sessions", () => {
			const result = computeAnalyticsData([], "today");

			expect(result.totalFocusTime).toBe(0);
			expect(result.totalSessions).toBe(0);
			expect(result.averageSessionLength).toBe(0);
			expect(result.insights.mostProductiveDay).toBeNull();
			expect(result.insights.mostProductiveHour).toBeNull();
		});

		it("calculates total focus time correctly", () => {
			const sessions = [
				createSession(1000, 1500, "focus"),
				createSession(3000, 1500, "focus"),
				createSession(5000, 300, "short-break"),
			];

			const result = computeAnalyticsData(sessions, "today");
			expect(result.totalFocusTime).toBe(3000);
		});

		it("counts only focus sessions", () => {
			const sessions = [
				createSession(1000, 1500, "focus"),
				createSession(3000, 1500, "focus"),
				createSession(5000, 300, "short-break"),
				createSession(6000, 900, "long-break"),
			];

			const result = computeAnalyticsData(sessions, "today");
			expect(result.totalSessions).toBe(2);
		});

		it("calculates average session length", () => {
			const sessions = [
				createSession(1000, 1500, "focus"),
				createSession(3000, 1800, "focus"),
				createSession(5000, 1200, "focus"),
			];

			const result = computeAnalyticsData(sessions, "today");
			expect(result.averageSessionLength).toBe(1500); // (1500 + 1800 + 1200) / 3
		});

		it("identifies most productive day", () => {
			// Create sessions on different days
			const monday = new Date();
			monday.setDate(monday.getDate() - monday.getDay() + 1); // Get Monday
			monday.setHours(10, 0, 0, 0);

			const tuesday = new Date(monday);
			tuesday.setDate(tuesday.getDate() + 1);

			const sessions = [
				createSession(monday.getTime(), 3600, "focus"), // Monday: 60 min
				createSession(tuesday.getTime(), 1800, "focus"), // Tuesday: 30 min
			];

			const result = computeAnalyticsData(sessions, "week");
			expect(result.insights.mostProductiveDay).toEqual({
				day: "Monday",
				minutes: 60,
			});
		});

		it("identifies most productive hour", () => {
			const today = new Date();
			today.setHours(14, 0, 0, 0); // 2 PM

			const morning = new Date(today);
			morning.setHours(9, 0, 0, 0); // 9 AM

			const sessions = [
				createSession(today.getTime(), 3600, "focus"), // 2 PM: 60 min
				createSession(morning.getTime(), 1800, "focus"), // 9 AM: 30 min
			];

			const result = computeAnalyticsData(sessions, "today");
			expect(result.insights.mostProductiveHour).toEqual({
				hour: 14,
				minutes: 60,
			});
		});

		describe("activity data for today", () => {
			it("returns hourly breakdown", () => {
				const result = computeAnalyticsData([], "today");
				expect(result.activityData).toHaveLength(24);
				expect(result.activityData[0].label).toBe("00:00");
				expect(result.activityData[23].label).toBe("23:00");
			});

			it("aggregates sessions by hour", () => {
				const today = new Date();
				today.setHours(10, 30, 0, 0);

				const sessions = [
					createSession(today.getTime(), 1500, "focus"), // 10:30, 25 min
					createSession(today.getTime() + 3600000, 900, "focus"), // 11:30, 15 min
				];

				const result = computeAnalyticsData(sessions, "today");
				const hour10 = result.activityData.find((d) => d.label === "10:00");
				const hour11 = result.activityData.find((d) => d.label === "11:00");

				expect(hour10?.focusMinutes).toBe(25);
				expect(hour10?.sessionCount).toBe(1);
				expect(hour11?.focusMinutes).toBe(15);
				expect(hour11?.sessionCount).toBe(1);
			});
		});

		describe("activity data for week", () => {
			it("returns daily breakdown with weekday labels", () => {
				const result = computeAnalyticsData([], "week");
				expect(result.activityData).toHaveLength(7);
				// Labels should be day abbreviations
				const labels = result.activityData.map((d) => d.label);
				expect(
					labels.some((l) =>
						["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(l),
					),
				).toBe(true);
			});
		});

		describe("activity data for month", () => {
			it("returns daily breakdown with date labels", () => {
				const result = computeAnalyticsData([], "month");
				expect(result.activityData).toHaveLength(30);
				// Labels should be MM/DD format
				expect(result.activityData[0].label).toMatch(/^\d+\/\d+$/);
			});
		});

		describe("activity data for all time", () => {
			it("returns empty array for no sessions", () => {
				const result = computeAnalyticsData([], "all");
				expect(result.activityData).toEqual([]);
			});

			it("groups sessions by week", () => {
				const today = new Date();
				const lastWeek = new Date(today);
				lastWeek.setDate(lastWeek.getDate() - 7);

				const sessions = [
					createSession(today.getTime(), 1500, "focus"),
					createSession(lastWeek.getTime(), 1500, "focus"),
				];

				const result = computeAnalyticsData(sessions, "all");
				expect(result.activityData.length).toBeGreaterThanOrEqual(1);
			});
		});
	});
});
