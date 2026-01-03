import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	generateSessionComment,
	postIssueComment,
} from "./githubCommentService";

describe("githubCommentService", () => {
	describe("generateSessionComment", () => {
		it("generates comment for focus session", () => {
			const comment = generateSessionComment({
				duration: 1500, // 25 minutes
				mode: "focus",
			});

			expect(comment).toContain("🍅 Focus Session Completed");
			expect(comment).toContain("**Duration:** 25m");
			expect(comment).toContain("**Completed at:**");
			expect(comment).toContain("Devmodoro");
		});

		it("generates comment for short break", () => {
			const comment = generateSessionComment({
				duration: 300, // 5 minutes
				mode: "short-break",
			});

			expect(comment).toContain("🍅 Short Break Completed");
			expect(comment).toContain("**Duration:** 5m");
		});

		it("generates comment for long break", () => {
			const comment = generateSessionComment({
				duration: 900, // 15 minutes
				mode: "long-break",
			});

			expect(comment).toContain("🍅 Long Break Completed");
			expect(comment).toContain("**Duration:** 15m");
		});

		it("includes task title when provided", () => {
			const comment = generateSessionComment({
				duration: 1500,
				mode: "focus",
				taskTitle: "Fix bug #123",
			});

			expect(comment).toContain("**Task:** Fix bug #123");
		});

		it("includes notes when provided", () => {
			const comment = generateSessionComment({
				duration: 1500,
				mode: "focus",
				notes: "Made good progress on the feature",
			});

			expect(comment).toContain("**Notes:**");
			expect(comment).toContain("Made good progress on the feature");
		});

		it("formats duration with seconds", () => {
			const comment = generateSessionComment({
				duration: 1530, // 25 min 30 sec
				mode: "focus",
			});

			expect(comment).toContain("**Duration:** 25m 30s");
		});
	});

	describe("postIssueComment", () => {
		beforeEach(() => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() =>
					Promise.resolve({
						ok: true,
						status: 201,
						json: () =>
							Promise.resolve({
								html_url:
									"https://github.com/owner/repo/issues/1#issuecomment-123",
							}),
						headers: new Headers(),
					}),
				),
			);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		it("returns error when not authenticated", async () => {
			const result = await postIssueComment(
				"",
				"https://github.com/owner/repo/issues/1",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Not authenticated");
		});

		it("returns error for invalid issue URL", async () => {
			const result = await postIssueComment(
				"test-token",
				"https://invalid-url.com",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Invalid GitHub issue URL");
		});

		it("posts comment successfully", async () => {
			const result = await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/issues/1",
				"Test comment body",
			);

			expect(fetch).toHaveBeenCalledWith(
				"https://api.github.com/repos/owner/repo/issues/1/comments",
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						Authorization: "Bearer test-token",
					}),
					body: JSON.stringify({ body: "Test comment body" }),
				}),
			);

			expect(result.success).toBe(true);
			expect(result.commentUrl).toBe(
				"https://github.com/owner/repo/issues/1#issuecomment-123",
			);
		});

		it("handles pull request URLs", async () => {
			await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/pull/42",
				"Test comment",
			);

			expect(fetch).toHaveBeenCalledWith(
				"https://api.github.com/repos/owner/repo/issues/42/comments",
				expect.anything(),
			);
		});

		it("handles 401 Unauthorized", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() =>
					Promise.resolve({
						ok: false,
						status: 401,
						headers: new Headers(),
					}),
				),
			);

			const result = await postIssueComment(
				"invalid-token",
				"https://github.com/owner/repo/issues/1",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Token expired or invalid");
		});

		it("handles 403 rate limit", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() =>
					Promise.resolve({
						ok: false,
						status: 403,
						headers: new Headers({ "X-RateLimit-Remaining": "0" }),
					}),
				),
			);

			const result = await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/issues/1",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Rate limit exceeded. Try again later.");
		});

		it("handles 403 forbidden", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() =>
					Promise.resolve({
						ok: false,
						status: 403,
						headers: new Headers({ "X-RateLimit-Remaining": "100" }),
					}),
				),
			);

			const result = await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/issues/1",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Access forbidden. Check token permissions.");
		});

		it("handles 404 Not Found", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() =>
					Promise.resolve({
						ok: false,
						status: 404,
						headers: new Headers(),
					}),
				),
			);

			const result = await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/issues/999",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Issue not found or no access");
		});

		it("handles other errors", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() =>
					Promise.resolve({
						ok: false,
						status: 500,
						headers: new Headers(),
					}),
				),
			);

			const result = await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/issues/1",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to post comment");
		});

		it("handles network errors", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn(() => Promise.reject(new Error("Network error"))),
			);

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const result = await postIssueComment(
				"test-token",
				"https://github.com/owner/repo/issues/1",
				"Test comment",
			);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Network error. Check your connection.");

			consoleSpy.mockRestore();
		});
	});
});
