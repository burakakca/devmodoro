import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/db";
import type { Session, Task } from "@/types";
import { computeGitHubAnalyticsData } from "./gitHubAnalyticsService";

describe("gitHubAnalyticsService", () => {
	beforeEach(async () => {
		await db.tasks.clear();
		await db.sessions.clear();
	});

	describe("computeGitHubAnalyticsData", () => {
		const createTask = async (
			id: string,
			externalLink?: string,
		): Promise<Task> => {
			const task: Task = {
				id,
				title: `Task ${id}`,
				estimatedPomos: 4,
				completedPomos: 0,
				status: "todo",
				createdAt: Date.now(),
				externalLink,
			};
			await db.tasks.add(task);
			return task;
		};

		const createSession = (
			taskId: string,
			duration: number,
			mode: Session["mode"] = "focus",
		): Session => ({
			id: `session-${taskId}-${Date.now()}`,
			taskId,
			startTime: Date.now(),
			endTime: Date.now() + duration * 1000,
			duration,
			mode,
		});

		it("returns zeros when no tasks or sessions exist", async () => {
			const result = await computeGitHubAnalyticsData([], false);

			expect(result).toEqual({
				isConnected: false,
				totalGitHubTasks: 0,
				totalNonGitHubTasks: 0,
				gitHubFocusTime: 0,
				nonGitHubFocusTime: 0,
				gitHubSessions: 0,
				nonGitHubSessions: 0,
				repoStats: [],
			});
		});

		it("correctly identifies GitHub tasks", async () => {
			await createTask("task-1", "https://github.com/owner/repo/issues/1");
			await createTask("task-2", "https://github.com/owner/repo/issues/2");
			await createTask("task-3"); // No external link

			const result = await computeGitHubAnalyticsData([], true);

			expect(result.totalGitHubTasks).toBe(2);
			expect(result.totalNonGitHubTasks).toBe(1);
		});

		it("calculates focus time separately for GitHub and non-GitHub tasks", async () => {
			const ghTask = await createTask(
				"gh-task",
				"https://github.com/owner/repo/issues/1",
			);
			const regularTask = await createTask("regular-task");

			const sessions = [
				createSession(ghTask.id, 1500, "focus"),
				createSession(ghTask.id, 1500, "focus"),
				createSession(regularTask.id, 900, "focus"),
			];

			const result = await computeGitHubAnalyticsData(sessions, true);

			expect(result.gitHubFocusTime).toBe(3000);
			expect(result.nonGitHubFocusTime).toBe(900);
			expect(result.gitHubSessions).toBe(2);
			expect(result.nonGitHubSessions).toBe(1);
		});

		it("ignores break sessions", async () => {
			const ghTask = await createTask(
				"gh-task",
				"https://github.com/owner/repo/issues/1",
			);

			const sessions = [
				createSession(ghTask.id, 1500, "focus"),
				createSession(ghTask.id, 300, "short-break"),
				createSession(ghTask.id, 900, "long-break"),
			];

			const result = await computeGitHubAnalyticsData(sessions, true);

			expect(result.gitHubFocusTime).toBe(1500);
			expect(result.gitHubSessions).toBe(1);
		});

		it("computes repo stats correctly", async () => {
			await createTask("task-1", "https://github.com/owner/repo1/issues/1");
			await createTask("task-2", "https://github.com/owner/repo1/issues/2");
			await createTask("task-3", "https://github.com/owner/repo2/issues/1");

			const sessions = [
				createSession("task-1", 1800, "focus"), // 30 min
				createSession("task-2", 1200, "focus"), // 20 min
				createSession("task-3", 600, "focus"), // 10 min
			];

			const result = await computeGitHubAnalyticsData(sessions, true);

			expect(result.repoStats).toHaveLength(2);

			// repo1 should be first (more focus time)
			expect(result.repoStats[0].repoName).toBe("owner/repo1");
			expect(result.repoStats[0].focusMinutes).toBe(50); // 30 + 20
			expect(result.repoStats[0].sessionCount).toBe(2);
			expect(result.repoStats[0].taskCount).toBe(2);

			// repo2 second
			expect(result.repoStats[1].repoName).toBe("owner/repo2");
			expect(result.repoStats[1].focusMinutes).toBe(10);
			expect(result.repoStats[1].sessionCount).toBe(1);
			expect(result.repoStats[1].taskCount).toBe(1);
		});

		it("limits repo stats to top 5", async () => {
			// Create 7 repos
			for (let i = 1; i <= 7; i++) {
				await createTask(
					`task-${i}`,
					`https://github.com/owner/repo${i}/issues/1`,
				);
			}

			const sessions = [
				createSession("task-1", 700, "focus"),
				createSession("task-2", 600, "focus"),
				createSession("task-3", 500, "focus"),
				createSession("task-4", 400, "focus"),
				createSession("task-5", 300, "focus"),
				createSession("task-6", 200, "focus"),
				createSession("task-7", 100, "focus"),
			];

			const result = await computeGitHubAnalyticsData(sessions, true);

			expect(result.repoStats).toHaveLength(5);
			// Should be sorted by focus time (descending)
			expect(result.repoStats[0].repoName).toBe("owner/repo1");
			expect(result.repoStats[4].repoName).toBe("owner/repo5");
		});

		it("preserves isConnected flag", async () => {
			const resultConnected = await computeGitHubAnalyticsData([], true);
			const resultDisconnected = await computeGitHubAnalyticsData([], false);

			expect(resultConnected.isConnected).toBe(true);
			expect(resultDisconnected.isConnected).toBe(false);
		});

		it("handles sessions with unknown task IDs", async () => {
			const sessions = [createSession("unknown-task", 1500, "focus")];

			const result = await computeGitHubAnalyticsData(sessions, true);

			// Should count as non-GitHub since task doesn't exist
			expect(result.nonGitHubFocusTime).toBe(1500);
			expect(result.nonGitHubSessions).toBe(1);
		});

		it("handles pull request URLs", async () => {
			await createTask("task-1", "https://github.com/owner/repo/pull/123");

			const sessions = [createSession("task-1", 1500, "focus")];

			const result = await computeGitHubAnalyticsData(sessions, true);

			expect(result.gitHubFocusTime).toBe(1500);
			expect(result.repoStats[0].repoName).toBe("owner/repo");
		});
	});
});
