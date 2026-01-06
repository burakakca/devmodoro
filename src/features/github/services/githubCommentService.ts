/**
 * GitHub comment service.
 * Handles posting session comments to issues and formatting.
 */

import { formatDurationPrecise } from "@/lib/formatters";
import { GITHUB_API_BASE } from "./githubApiClient";
import type { GitHubCommentResult, SessionCommentData } from "./githubTypes";
import { parseIssueUrl } from "./githubUtils";

/**
 * Generate a session summary comment body
 */
export function generateSessionComment(data: SessionCommentData): string {
	const modeLabels = {
		focus: "Focus Session",
		"short-break": "Short Break",
		"long-break": "Long Break",
	};

	const timestamp = new Date().toISOString();
	const duration = formatDurationPrecise(data.duration);

	let comment = `### 🍅 ${modeLabels[data.mode]} Completed\n\n`;
	comment += `- **Duration:** ${duration}\n`;
	comment += `- **Completed at:** ${new Date(timestamp).toLocaleString()}\n`;

	if (data.taskTitle) {
		comment += `- **Task:** ${data.taskTitle}\n`;
	}

	if (data.notes) {
		comment += `\n**Notes:**\n${data.notes}\n`;
	}

	comment += `\n---\n*Logged via [Devmodoro](https://github.com/burakakca/devmodoro)*`;

	return comment;
}

/**
 * Post a comment to a GitHub issue
 */
export async function postIssueComment(
	token: string,
	issueUrl: string,
	body: string,
): Promise<GitHubCommentResult> {
	if (!token) {
		return { success: false, error: "Not authenticated" };
	}

	const parsed = parseIssueUrl(issueUrl);
	if (!parsed) {
		return { success: false, error: "Invalid GitHub issue URL" };
	}

	const { owner, repo, issueNumber } = parsed;

	try {
		const response = await fetch(
			`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ body }),
			},
		);

		if (response.status === 401) {
			return { success: false, error: "Token expired or invalid" };
		}

		if (response.status === 403) {
			const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
			if (rateLimitRemaining === "0") {
				return {
					success: false,
					error: "Rate limit exceeded. Try again later.",
				};
			}
			return {
				success: false,
				error: "Access forbidden. Check token permissions.",
			};
		}

		if (response.status === 404) {
			return { success: false, error: "Issue not found or no access" };
		}

		if (!response.ok) {
			return { success: false, error: "Failed to post comment" };
		}

		const result = await response.json();
		return { success: true, commentUrl: result.html_url };
	} catch (error) {
		console.error("Failed to post GitHub comment:", error);
		return {
			success: false,
			error: "Network error. Check your connection.",
		};
	}
}
