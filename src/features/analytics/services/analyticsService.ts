import { db } from "@/db/db";
import type { Session } from "@/types";

export type TimeRange = "today" | "week" | "month" | "all";

export interface ActivityData {
	label: string;
	date: string;
	focusMinutes: number;
	sessionCount: number;
}

export interface ProductivityInsights {
	mostProductiveDay: { day: string; minutes: number } | null;
	mostProductiveHour: { hour: number; minutes: number } | null;
}

export interface AnalyticsData {
	totalFocusTime: number;
	totalSessions: number;
	averageSessionLength: number;
	insights: ProductivityInsights;
	activityData: ActivityData[];
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

/**
 * Get date range boundaries and chart config based on the selected range
 */
export const getTimeRangeConfig = (
	range: TimeRange,
): { start: number; end: number; days: number; showWeekday: boolean } => {
	const now = new Date();
	const endOfDay = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		23,
		59,
		59,
		999,
	).getTime();

	switch (range) {
		case "today": {
			const startOfDay = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			).getTime();
			return { start: startOfDay, end: endOfDay, days: 1, showWeekday: false };
		}
		case "week": {
			const start = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - 6,
			).getTime();
			return { start, end: endOfDay, days: 7, showWeekday: true };
		}
		case "month": {
			const start = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() - 29,
			).getTime();
			return { start, end: endOfDay, days: 30, showWeekday: false };
		}
		case "all":
			return { start: 0, end: endOfDay, days: 0, showWeekday: false };
	}
};

/**
 * Calculate current streak (consecutive days with focus sessions)
 */
export const getCurrentStreak = async (): Promise<number> => {
	const sessions = await db.sessions
		.where("mode")
		.equals("focus")
		.reverse()
		.sortBy("startTime");

	if (sessions.length === 0) return 0;

	// Group sessions by date
	const sessionsByDate = new Map<string, boolean>();
	for (const session of sessions) {
		const dateKey = new Date(session.startTime).toISOString().split("T")[0];
		sessionsByDate.set(dateKey, true);
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	let streak = 0;
	const currentDate = new Date(today);

	// Count consecutive days from today (or yesterday if no session today)
	const todayKey = currentDate.toISOString().split("T")[0];
	if (!sessionsByDate.has(todayKey)) {
		// Check if yesterday had a session (streak can start from yesterday)
		currentDate.setDate(currentDate.getDate() - 1);
		const yesterdayKey = currentDate.toISOString().split("T")[0];
		if (!sessionsByDate.has(yesterdayKey)) {
			return 0;
		}
	}

	while (true) {
		const dateKey = currentDate.toISOString().split("T")[0];
		if (sessionsByDate.has(dateKey)) {
			streak++;
			currentDate.setDate(currentDate.getDate() - 1);
		} else {
			break;
		}
	}

	return streak;
};

/**
 * Compute all analytics data from sessions in a single pass
 */
export const computeAnalyticsData = (
	sessions: Session[],
	range: TimeRange,
): AnalyticsData => {
	const focusSessions = sessions.filter((s) => s.mode === "focus");
	const config = getTimeRangeConfig(range);

	// Basic metrics
	const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);
	const totalSessions = focusSessions.length;
	const averageSessionLength =
		totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0;

	// Productivity insights (day of week and hour)
	const dayTotals = new Map<number, number>();
	const hourTotals = new Map<number, number>();

	for (const session of focusSessions) {
		const date = new Date(session.startTime);
		const dayOfWeek = date.getDay();
		const hour = date.getHours();
		dayTotals.set(
			dayOfWeek,
			(dayTotals.get(dayOfWeek) ?? 0) + session.duration,
		);
		hourTotals.set(hour, (hourTotals.get(hour) ?? 0) + session.duration);
	}

	let mostProductiveDay: ProductivityInsights["mostProductiveDay"] = null;
	let maxDayMinutes = 0;
	for (const [day, seconds] of dayTotals) {
		const minutes = Math.round(seconds / 60);
		if (minutes > maxDayMinutes) {
			maxDayMinutes = minutes;
			mostProductiveDay = { day: FULL_DAY_NAMES[day], minutes };
		}
	}

	let mostProductiveHour: ProductivityInsights["mostProductiveHour"] = null;
	let maxHourMinutes = 0;
	for (const [hour, seconds] of hourTotals) {
		const minutes = Math.round(seconds / 60);
		if (minutes > maxHourMinutes) {
			maxHourMinutes = minutes;
			mostProductiveHour = { hour, minutes };
		}
	}

	// Activity data for chart
	const activityData = computeActivityData(focusSessions, range, config);

	return {
		totalFocusTime,
		totalSessions,
		averageSessionLength,
		insights: { mostProductiveDay, mostProductiveHour },
		activityData,
	};
};

/**
 * Compute activity data for chart based on time range
 */
const computeActivityData = (
	focusSessions: Session[],
	range: TimeRange,
	config: ReturnType<typeof getTimeRangeConfig>,
): ActivityData[] => {
	const now = new Date();

	if (range === "today") {
		// Show hourly breakdown for today
		const hourlyData = new Map<number, ActivityData>();
		for (let h = 0; h < 24; h++) {
			hourlyData.set(h, {
				label: `${h.toString().padStart(2, "0")}:00`,
				date: now.toISOString().split("T")[0],
				focusMinutes: 0,
				sessionCount: 0,
			});
		}
		for (const session of focusSessions) {
			const hour = new Date(session.startTime).getHours();
			const existing = hourlyData.get(hour);
			if (existing) {
				existing.focusMinutes += Math.round(session.duration / 60);
				existing.sessionCount += 1;
			}
		}
		return Array.from(hourlyData.values());
	}

	if (range === "all") {
		// Group by week for "all time"
		if (focusSessions.length === 0) return [];

		const weeklyData = new Map<string, ActivityData>();
		for (const session of focusSessions) {
			const date = new Date(session.startTime);
			// Get Monday of the week
			const day = date.getDay();
			const diff = date.getDate() - day + (day === 0 ? -6 : 1);
			const monday = new Date(date.setDate(diff));
			const weekKey = monday.toISOString().split("T")[0];

			if (!weeklyData.has(weekKey)) {
				weeklyData.set(weekKey, {
					label: `${monday.getMonth() + 1}/${monday.getDate()}`,
					date: weekKey,
					focusMinutes: 0,
					sessionCount: 0,
				});
			}
			const existing = weeklyData.get(weekKey);
			if (existing) {
				existing.focusMinutes += Math.round(session.duration / 60);
				existing.sessionCount += 1;
			}
		}
		// Sort by date and take last 12 weeks
		return Array.from(weeklyData.values())
			.sort((a, b) => a.date.localeCompare(b.date))
			.slice(-12);
	}

	// Week or Month: show daily data
	const { days, showWeekday } = config;
	const startDate = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate() - days + 1,
	);

	const dailyData = new Map<string, ActivityData>();
	for (let i = 0; i < days; i++) {
		const date = new Date(startDate);
		date.setDate(date.getDate() + i);
		const dateKey = date.toISOString().split("T")[0];
		const label = showWeekday
			? DAY_NAMES[date.getDay()]
			: `${date.getMonth() + 1}/${date.getDate()}`;
		dailyData.set(dateKey, {
			label,
			date: dateKey,
			focusMinutes: 0,
			sessionCount: 0,
		});
	}

	for (const session of focusSessions) {
		const dateKey = new Date(session.startTime).toISOString().split("T")[0];
		const existing = dailyData.get(dateKey);
		if (existing) {
			existing.focusMinutes += Math.round(session.duration / 60);
			existing.sessionCount += 1;
		}
	}

	return Array.from(dailyData.values());
};

/**
 * Get sessions with task names for history display
 */
export const getSessionsWithTasks = async (
	limit?: number,
): Promise<(Session & { taskTitle: string })[]> => {
	const sessions = await db.sessions.orderBy("startTime").reverse().toArray();

	const limitedSessions = limit ? sessions.slice(0, limit) : sessions;

	// Get unique task IDs
	const taskIds = [...new Set(limitedSessions.map((s) => s.taskId))];
	const tasks = await db.tasks.where("id").anyOf(taskIds).toArray();
	const taskMap = new Map(tasks.map((t) => [t.id, t.title]));

	return limitedSessions.map((s) => ({
		...s,
		taskTitle: taskMap.get(s.taskId) ?? "No Task",
	}));
};
