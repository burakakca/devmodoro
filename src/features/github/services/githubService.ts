/**
 * GitHub service barrel file.
 * Re-exports from split services for backwards compatibility.
 *
 * Service structure:
 * - githubTypes.ts: Shared type definitions
 * - githubApiClient.ts: Base API client with error handling
 * - githubAuthService.ts: Token validation and settings
 * - githubIssueService.ts: Issue fetching
 * - githubCommentService.ts: Comment posting and formatting
 * - githubUtils.ts: Utility functions (colors, URL parsing)
 */

// Re-export auth functions
export {
	createDisconnectedGitHubSettings,
	createGitHubSettings,
	maskToken,
	validateGitHubToken,
} from "./githubAuthService";
// Re-export comment functions
export {
	generateSessionComment,
	postIssueComment,
} from "./githubCommentService";

// Re-export issue functions
export { getAssignedIssues } from "./githubIssueService";
// Re-export all types
export type {
	GitHubCommentResult,
	GitHubIssue,
	GitHubIssuesResult,
	GitHubLabel,
	GitHubRepository,
	GitHubSettings,
	GitHubUser,
	GitHubValidationResult,
	ParsedIssueUrl,
	SessionCommentData,
} from "./githubTypes";

// Re-export utility functions
export { getLabelTextColor, parseIssueUrl } from "./githubUtils";
