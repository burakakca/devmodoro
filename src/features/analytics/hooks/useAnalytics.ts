import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useState } from "react";
import { db } from "@/db/db";
import { useSettings } from "@/features/settings/context/SettingsContext";
import type {
	AnalyticsData,
	GitHubAnalyticsData,
	TimeRange,
} from "../services/analyticsTypes";
import {
	computeAnalyticsData,
	getCurrentStreak,
	getSessionsWithTasks,
	getTimeRangeConfig,
} from "../services/generalAnalyticsService";
import { computeGitHubAnalyticsData } from "../services/gitHubAnalyticsService";

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

const DEFAULT_GITHUB_ANALYTICS: GitHubAnalyticsData = {
	isConnected: false,
	totalGitHubTasks: 0,
	totalNonGitHubTasks: 0,
	gitHubFocusTime: 0,
	nonGitHubFocusTime: 0,
	gitHubSessions: 0,
	nonGitHubSessions: 0,
	repoStats: [],
};

export const useGitHubAnalytics = () => {
	const { settings } = useSettings();
	const isConnected = settings.integration.github.isConnected;

	// Get all sessions (no time range filter for GitHub stats)
	const gitHubAnalytics = useLiveQuery(async () => {
		const sessions = await db.sessions.toArray();
		return computeGitHubAnalyticsData(sessions, isConnected);
	}, [isConnected]);

	return {
		...(gitHubAnalytics ?? DEFAULT_GITHUB_ANALYTICS),
		isLoading: gitHubAnalytics === undefined,
	};
};
