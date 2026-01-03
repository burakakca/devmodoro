import { describe, expect, it } from "vitest";
import {
	createDisconnectedGitHubSettings,
	createGitHubSettings,
	maskToken,
} from "./githubAuthService";
import type { GitHubUser } from "./githubTypes";

// Note: validateGitHubToken is not tested here as it requires mocking the API client
// It should be tested as an integration test with proper API mocking

describe("createGitHubSettings", () => {
	it("creates settings with token and user info", () => {
		const user: GitHubUser = {
			login: "testuser",
			id: 12345,
			avatar_url: "https://avatars.githubusercontent.com/u/12345",
			name: "Test User",
		};

		const result = createGitHubSettings("ghp_testtoken123", user);

		expect(result).toEqual({
			token: "ghp_testtoken123",
			username: "testuser",
			isConnected: true,
		});
	});

	it("handles user with null name", () => {
		const user: GitHubUser = {
			login: "anotheruser",
			id: 67890,
			avatar_url: "https://avatars.githubusercontent.com/u/67890",
			name: null,
		};

		const result = createGitHubSettings("ghp_anothertoken", user);

		expect(result).toEqual({
			token: "ghp_anothertoken",
			username: "anotheruser",
			isConnected: true,
		});
	});
});

describe("createDisconnectedGitHubSettings", () => {
	it("creates empty disconnected settings", () => {
		const result = createDisconnectedGitHubSettings();

		expect(result).toEqual({
			token: "",
			username: "",
			isConnected: false,
		});
	});
});

describe("maskToken", () => {
	it("masks token with first 4 and last 4 characters visible", () => {
		const result = maskToken("ghp_abcdefghijklmnop");
		expect(result).toBe("ghp_************mnop");
	});

	it("returns **** for short tokens (8 or fewer characters)", () => {
		expect(maskToken("short")).toBe("****");
		expect(maskToken("12345678")).toBe("****");
	});

	it("handles tokens just over 8 characters", () => {
		const result = maskToken("123456789");
		expect(result).toBe("1234*6789");
	});

	it("handles very long tokens", () => {
		const longToken = `ghp_${"a".repeat(50)}`;
		const result = maskToken(longToken);
		// First 4: "ghp_", last 4: "aaaa", middle: 20 asterisks (capped)
		expect(result.startsWith("ghp_")).toBe(true);
		expect(result.endsWith("aaaa")).toBe(true);
		expect(result).toContain("********************");
	});

	it("limits asterisks to 20 for very long tokens", () => {
		const veryLongToken = "a".repeat(100);
		const result = maskToken(veryLongToken);
		// Should have exactly 20 asterisks
		const asteriskCount = (result.match(/\*/g) || []).length;
		expect(asteriskCount).toBe(20);
	});
});
