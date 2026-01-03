/**
 * GitHub issue fetching service.
 * Handles retrieval of issues assigned to the user.
 */

import { GITHUB_API_BASE } from "./githubApiClient";
import type { GitHubIssue, GitHubIssuesResult } from "./githubTypes";

/**
 * Fetch issues assigned to the authenticated user
 */
export async function getAssignedIssues(
	token: string,
	page = 1,
	perPage = 20,
): Promise<GitHubIssuesResult> {
	if (!token) {
		return { issues: [], hasMore: false, error: "Not authenticated" };
	}

	try {
		const params = new URLSearchParams({
			filter: "assigned",
			state: "open",
			sort: "updated",
			direction: "desc",
			page: String(page),
			per_page: String(perPage),
		});

		const response = await fetch(
			`${GITHUB_API_BASE}/issues?${params.toString()}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/vnd.github+json",
					"X-GitHub-Api-Version": "2022-11-28",
				},
			},
		);

		if (response.status === 401) {
			return { issues: [], hasMore: false, error: "Token expired or invalid" };
		}

		if (response.status === 403) {
			const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
			if (rateLimitRemaining === "0") {
				return {
					issues: [],
					hasMore: false,
					error: "Rate limit exceeded. Try again later.",
				};
			}
			return { issues: [], hasMore: false, error: "Access forbidden" };
		}

		if (!response.ok) {
			return { issues: [], hasMore: false, error: "Failed to fetch issues" };
		}

		const issues: GitHubIssue[] = await response.json();

		// Check if there are more pages via Link header
		const linkHeader = response.headers.get("Link");
		const hasMore = linkHeader?.includes('rel="next"') ?? false;

		return { issues, hasMore };
	} catch (error) {
		console.error("Failed to fetch GitHub issues:", error);
		return {
			issues: [],
			hasMore: false,
			error: "Network error. Check your connection.",
		};
	}
}
