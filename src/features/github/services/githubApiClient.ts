/**
 * GitHub API client with centralized error handling.
 * Provides consistent request handling and rate limit management.
 */

const GITHUB_API_BASE = "https://api.github.com";

export interface GitHubApiError {
	status: number;
	message: string;
	isRateLimit: boolean;
	isAuthError: boolean;
}

export interface GitHubRequestOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	body?: unknown;
	token: string;
}

/**
 * Parse GitHub API error response
 */
function parseApiError(response: Response): GitHubApiError {
	const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
	const isRateLimit = rateLimitRemaining === "0";

	switch (response.status) {
		case 401:
			return {
				status: 401,
				message: "Token expired or invalid",
				isRateLimit: false,
				isAuthError: true,
			};
		case 403:
			if (isRateLimit) {
				return {
					status: 403,
					message: "Rate limit exceeded. Try again later.",
					isRateLimit: true,
					isAuthError: false,
				};
			}
			return {
				status: 403,
				message: "Access forbidden. Check token permissions.",
				isRateLimit: false,
				isAuthError: true,
			};
		case 404:
			return {
				status: 404,
				message: "Resource not found or no access",
				isRateLimit: false,
				isAuthError: false,
			};
		default:
			return {
				status: response.status,
				message: `Request failed with status ${response.status}`,
				isRateLimit: false,
				isAuthError: false,
			};
	}
}

/**
 * Make a request to the GitHub API with proper headers and error handling
 */
export async function githubFetch<T>(
	endpoint: string,
	options: GitHubRequestOptions,
): Promise<{
	data: T | null;
	error: GitHubApiError | null;
	response: Response;
}> {
	const { method = "GET", body, token } = options;

	const headers: HeadersInit = {
		Authorization: `Bearer ${token}`,
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	};

	if (body) {
		headers["Content-Type"] = "application/json";
	}

	try {
		const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			return {
				data: null,
				error: parseApiError(response),
				response,
			};
		}

		const data = await response.json();
		return { data, error: null, response };
	} catch (error) {
		console.error(`GitHub API request failed: ${endpoint}`, error);
		return {
			data: null,
			error: {
				status: 0,
				message: "Network error. Check your connection.",
				isRateLimit: false,
				isAuthError: false,
			},
			response: new Response(null, { status: 0 }),
		};
	}
}

export { GITHUB_API_BASE };
