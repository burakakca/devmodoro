import type { GitHubSettings } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubUser {
	login: string;
	id: number;
	avatar_url: string;
	name: string | null;
}

export interface GitHubLabel {
	id: number;
	name: string;
	color: string;
	description: string | null;
}

export interface GitHubRepository {
	id: number;
	name: string;
	full_name: string;
	html_url: string;
}

export interface GitHubIssue {
	id: number;
	number: number;
	title: string;
	html_url: string;
	state: "open" | "closed";
	labels: GitHubLabel[];
	repository: GitHubRepository;
	created_at: string;
	updated_at: string;
}

export interface GitHubIssuesResult {
	issues: GitHubIssue[];
	hasMore: boolean;
	error?: string;
}

export interface GitHubCommentResult {
	success: boolean;
	commentUrl?: string;
	error?: string;
}

export interface SessionCommentData {
	duration: number; // in seconds
	mode: "focus" | "short-break" | "long-break";
	taskTitle?: string;
	notes?: string;
}

export interface GitHubValidationResult {
	isValid: boolean;
	user?: GitHubUser;
	error?: string;
}

/**
 * Validate a GitHub personal access token by calling the /user endpoint
 */
export async function validateGitHubToken(
	token: string,
): Promise<GitHubValidationResult> {
	if (!token || token.trim() === "") {
		return { isValid: false, error: "Token is required" };
	}

	try {
		const response = await fetch(`${GITHUB_API_BASE}/user`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
			},
		});

		if (response.status === 401) {
			return { isValid: false, error: "Invalid or expired token" };
		}

		if (response.status === 403) {
			const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
			if (rateLimitRemaining === "0") {
				return {
					isValid: false,
					error: "Rate limit exceeded. Try again later.",
				};
			}
			return {
				isValid: false,
				error: "Access forbidden. Check token permissions.",
			};
		}

		if (!response.ok) {
			return { isValid: false, error: "Failed to validate token" };
		}

		const user: GitHubUser = await response.json();
		return { isValid: true, user };
	} catch (error) {
		// Don't expose internal error details
		console.error("GitHub token validation failed:", error);
		return { isValid: false, error: "Network error. Check your connection." };
	}
}

/**
 * Create GitHub settings object from validation result
 */
export function createGitHubSettings(
	token: string,
	user: GitHubUser,
): GitHubSettings {
	return {
		token,
		username: user.login,
		isConnected: true,
	};
}

/**
 * Create disconnected GitHub settings
 */
export function createDisconnectedGitHubSettings(): GitHubSettings {
	return {
		token: "",
		username: "",
		isConnected: false,
	};
}

/**
 * Mask a token for display (show first 4 and last 4 characters)
 */
export function maskToken(token: string): string {
	if (token.length <= 8) {
		return "****";
	}
	return `${token.slice(0, 4)}${"*".repeat(Math.min(token.length - 8, 20))}${token.slice(-4)}`;
}

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

/**
 * Generate a contrasting text color for a label background
 */
export function getLabelTextColor(hexColor: string): string {
	// Remove # if present
	const hex = hexColor.replace("#", "");

	// Parse RGB values
	const r = Number.parseInt(hex.substring(0, 2), 16);
	const g = Number.parseInt(hex.substring(2, 4), 16);
	const b = Number.parseInt(hex.substring(4, 6), 16);

	// Calculate relative luminance
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	// Return black for light backgrounds, white for dark
	return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Parse a GitHub issue URL to extract owner, repo, and issue number
 */
export function parseIssueUrl(
	issueUrl: string,
): { owner: string; repo: string; issueNumber: number } | null {
	// Match patterns like:
	// https://github.com/owner/repo/issues/123
	// https://github.com/owner/repo/pull/123
	const match = issueUrl.match(
		/github\.com\/([^/]+)\/([^/]+)\/(?:issues|pull)\/(\d+)/,
	);

	if (!match) {
		return null;
	}

	return {
		owner: match[1],
		repo: match[2],
		issueNumber: Number.parseInt(match[3], 10),
	};
}

/**
 * Format duration in seconds to human-readable string
 */
function formatDuration(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes === 0) {
		return `${remainingSeconds}s`;
	}
	if (remainingSeconds === 0) {
		return `${minutes}m`;
	}
	return `${minutes}m ${remainingSeconds}s`;
}

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
	const duration = formatDuration(data.duration);

	let comment = `### 🍅 ${modeLabels[data.mode]} Completed\n\n`;
	comment += `- **Duration:** ${duration}\n`;
	comment += `- **Completed at:** ${new Date(timestamp).toLocaleString()}\n`;

	if (data.taskTitle) {
		comment += `- **Task:** ${data.taskTitle}\n`;
	}

	if (data.notes) {
		comment += `\n**Notes:**\n${data.notes}\n`;
	}

	comment += `\n---\n*Logged via [Devmodoro](https://github.com/devmodoro)*`;

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
