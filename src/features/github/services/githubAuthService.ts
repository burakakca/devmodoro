/**
 * GitHub authentication service.
 * Handles token validation and settings management.
 */

import { githubFetch } from "./githubApiClient";
import type {
	GitHubSettings,
	GitHubUser,
	GitHubValidationResult,
} from "./githubTypes";

/**
 * Validate a GitHub personal access token by calling the /user endpoint
 */
export async function validateGitHubToken(
	token: string,
): Promise<GitHubValidationResult> {
	if (!token || token.trim() === "") {
		return { isValid: false, error: "Token is required" };
	}

	const { data, error } = await githubFetch<GitHubUser>("/user", { token });

	if (error) {
		return { isValid: false, error: error.message };
	}

	if (data) {
		return { isValid: true, user: data };
	}

	return { isValid: false, error: "Failed to validate token" };
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
