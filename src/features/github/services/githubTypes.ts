/**
 * Shared types for GitHub services.
 * Separated to enable tree-shaking and cleaner imports.
 */

import type { GitHubSettings } from "@/types";

export type { GitHubSettings };

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

export interface ParsedIssueUrl {
	owner: string;
	repo: string;
	issueNumber: number;
}
