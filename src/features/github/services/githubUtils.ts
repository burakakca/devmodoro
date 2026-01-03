/**
 * GitHub utility functions.
 * Pure functions for URL parsing and color calculations.
 */

import type { ParsedIssueUrl } from "./githubTypes";

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
export function parseIssueUrl(issueUrl: string): ParsedIssueUrl | null {
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
