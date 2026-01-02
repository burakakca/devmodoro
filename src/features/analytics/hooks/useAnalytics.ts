import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db } from "@/db/db";
import {
	type AnalyticsData,
	computeAnalyticsData,
	getCurrentStreak,
	getSessionsWithTasks,
	getTimeRangeConfig,
	type TimeRange,
} from "../services/analyticsService";

export const useAnalytics = () => {
	const [timeRange, setTimeRange] = useState<TimeRange>("week");

	const { start, end } = useMemo(
		() => getTimeRangeConfig(timeRange),
		[timeRange],
	);

	// Single live query for sessions in range
	const sessions = useLiveQuery(
		() =>
			db.sessions.where("startTime").between(start, end, true, true).toArray(),
		[start, end],
	);

	// Compute all analytics in one pass
	const analytics: AnalyticsData | null = useMemo(() => {
		if (!sessions) return null;
		return computeAnalyticsData(sessions, timeRange);
	}, [sessions, timeRange]);

	// Streak is separate (always all-time calculation)
	const streak = useLiveQuery(() => getCurrentStreak(), []);

	return {
		timeRange,
		setTimeRange,
		totalFocusTime: analytics?.totalFocusTime ?? 0,
		totalSessions: analytics?.totalSessions ?? 0,
		averageSessionLength: analytics?.averageSessionLength ?? 0,
		streak: streak ?? 0,
		activityData: analytics?.activityData ?? [],
		insights: analytics?.insights ?? {
			mostProductiveDay: null,
			mostProductiveHour: null,
		},
		isLoading: sessions === undefined,
	};
};

export const useSessionHistory = (modeFilter: string = "all", limit = 50) => {
	const sessions = useLiveQuery(async () => {
		const allSessions = await getSessionsWithTasks();
		if (modeFilter === "all") {
			return allSessions.slice(0, limit);
		}
		return allSessions.filter((s) => s.mode === modeFilter).slice(0, limit);
	}, [modeFilter, limit]);

	return {
		sessions: sessions ?? [],
		isLoading: sessions === undefined,
	};
};
