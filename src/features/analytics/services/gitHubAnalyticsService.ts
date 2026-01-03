/**
 * GitHub-specific analytics service.
 * Separated from general analytics to enable tree-shaking when GitHub features are not used.
 * This service is only loaded when the analytics dashboard renders the GitHub section.
 */

import { db } from "@/db/db";
import type { Session, Task } from "@/types";
import type { GitHubAnalyticsData, GitHubRepoStats } from "./analyticsTypes";

/**
 * Extract repo name from GitHub issue URL
 * e.g., "https://github.com/owner/repo/issues/123" -> "owner/repo"
 */
const extractRepoFromUrl = (url: string): string | null => {
	const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
	return match ? match[1] : null;
};

/**
 * Check if a task is linked to GitHub (has an external GitHub URL)
 */
const isGitHubTask = (task: Task): boolean => {
	return Boolean(task.externalLink?.includes("github.com"));
};

/**
 * Compute GitHub-specific analytics data
 */
export const computeGitHubAnalyticsData = async (
	sessions: Session[],
	isConnected: boolean,
): Promise<GitHubAnalyticsData> => {
	// Get all tasks to determine which are GitHub-linked
	const allTasks = await db.tasks.toArray();
	const taskMap = new Map(allTasks.map((t) => [t.id, t]));

	// Separate GitHub and non-GitHub tasks
	const gitHubTasks = allTasks.filter(isGitHubTask);
	const nonGitHubTasks = allTasks.filter((t) => !isGitHubTask(t));

	// Process sessions (focus only)
	const focusSessions = sessions.filter((s) => s.mode === "focus");

	let gitHubFocusTime = 0;
	let nonGitHubFocusTime = 0;
	let gitHubSessions = 0;
	let nonGitHubSessions = 0;

	// Track repo-level stats
	const repoStatsMap = new Map<
		string,
		{ focusSeconds: number; sessionCount: number; taskIds: Set<string> }
	>();

	for (const session of focusSessions) {
		const task = taskMap.get(session.taskId);
		const isGitHub = task && isGitHubTask(task);

		if (isGitHub && task?.externalLink) {
			gitHubFocusTime += session.duration;
			gitHubSessions += 1;

			// Track per-repo stats
			const repoName = extractRepoFromUrl(task.externalLink);
			if (repoName) {
				const existing = repoStatsMap.get(repoName) ?? {
					focusSeconds: 0,
					sessionCount: 0,
					taskIds: new Set<string>(),
				};
				existing.focusSeconds += session.duration;
				existing.sessionCount += 1;
				existing.taskIds.add(task.id);
				repoStatsMap.set(repoName, existing);
			}
		} else {
			nonGitHubFocusTime += session.duration;
			nonGitHubSessions += 1;
		}
	}

	// Convert repo stats to array, sorted by focus time
	const repoStats: GitHubRepoStats[] = Array.from(repoStatsMap.entries())
		.map(([repoName, stats]) => ({
			repoName,
			focusMinutes: Math.round(stats.focusSeconds / 60),
			sessionCount: stats.sessionCount,
			taskCount: stats.taskIds.size,
		}))
		.sort((a, b) => b.focusMinutes - a.focusMinutes)
		.slice(0, 5); // Top 5 repos

	return {
		isConnected,
		totalGitHubTasks: gitHubTasks.length,
		totalNonGitHubTasks: nonGitHubTasks.length,
		gitHubFocusTime,
		nonGitHubFocusTime,
		gitHubSessions,
		nonGitHubSessions,
		repoStats,
	};
};
