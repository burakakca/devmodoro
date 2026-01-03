/**
 * Shared types for analytics services.
 * Separated to enable tree-shaking of unused analytics features.
 */

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

export interface GitHubRepoStats {
	repoName: string;
	focusMinutes: number;
	sessionCount: number;
	taskCount: number;
}

export interface GitHubAnalyticsData {
	isConnected: boolean;
	totalGitHubTasks: number;
	totalNonGitHubTasks: number;
	gitHubFocusTime: number;
	nonGitHubFocusTime: number;
	gitHubSessions: number;
	nonGitHubSessions: number;
	repoStats: GitHubRepoStats[];
}

export interface TimeRangeConfig {
	start: number;
	end: number;
	days: number;
	showWeekday: boolean;
}
