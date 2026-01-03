/**
 * Analytics service barrel file.
 * Re-exports from split services for backwards compatibility.
 *
 * Service structure:
 * - analyticsTypes.ts: Shared type definitions
 * - generalAnalyticsService.ts: Core analytics (always loaded)
 * - gitHubAnalyticsService.ts: GitHub-specific analytics (tree-shakeable)
 */

// Re-export all types
export type {
	ActivityData,
	AnalyticsData,
	GitHubAnalyticsData,
	GitHubRepoStats,
	ProductivityInsights,
	TimeRange,
	TimeRangeConfig,
} from "./analyticsTypes";

// Re-export general analytics functions
export {
	computeAnalyticsData,
	getCurrentStreak,
	getLocalDateKey,
	getSessionsWithTasks,
	getTimeRangeConfig,
} from "./generalAnalyticsService";

// Re-export GitHub analytics functions
export { computeGitHubAnalyticsData } from "./gitHubAnalyticsService";
