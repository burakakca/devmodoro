import { describe, expect, it } from "vitest";
import { getLabelTextColor, parseIssueUrl } from "./githubUtils";

describe("getLabelTextColor", () => {
	it("returns black for white background", () => {
		expect(getLabelTextColor("#ffffff")).toBe("#000000");
		expect(getLabelTextColor("ffffff")).toBe("#000000");
	});

	it("returns white for black background", () => {
		expect(getLabelTextColor("#000000")).toBe("#ffffff");
		expect(getLabelTextColor("000000")).toBe("#ffffff");
	});

	it("returns black for light colors", () => {
		expect(getLabelTextColor("#ffff00")).toBe("#000000"); // yellow
		expect(getLabelTextColor("#00ff00")).toBe("#000000"); // lime
		expect(getLabelTextColor("#f0f0f0")).toBe("#000000"); // light gray
	});

	it("returns white for dark colors", () => {
		expect(getLabelTextColor("#0000ff")).toBe("#ffffff"); // blue
		expect(getLabelTextColor("#800080")).toBe("#ffffff"); // purple
		expect(getLabelTextColor("#333333")).toBe("#ffffff"); // dark gray
	});

	it("handles edge cases around luminance threshold", () => {
		// These are around the 0.5 luminance threshold
		expect(getLabelTextColor("#808080")).toBe("#000000"); // gray (luminance ~0.5)
	});

	it("handles GitHub label colors", () => {
		expect(getLabelTextColor("#d73a4a")).toBe("#ffffff"); // GitHub bug (red)
		expect(getLabelTextColor("#0075ca")).toBe("#ffffff"); // GitHub documentation (blue)
		expect(getLabelTextColor("#7057ff")).toBe("#ffffff"); // GitHub good first issue (purple)
		expect(getLabelTextColor("#a2eeef")).toBe("#000000"); // GitHub enhancement (cyan)
	});
});

describe("parseIssueUrl", () => {
	describe("valid URLs", () => {
		it("parses standard issue URL", () => {
			const result = parseIssueUrl("https://github.com/owner/repo/issues/123");
			expect(result).toEqual({
				owner: "owner",
				repo: "repo",
				issueNumber: 123,
			});
		});

		it("parses pull request URL", () => {
			const result = parseIssueUrl("https://github.com/owner/repo/pull/456");
			expect(result).toEqual({
				owner: "owner",
				repo: "repo",
				issueNumber: 456,
			});
		});

		it("parses URL with hyphenated owner/repo names", () => {
			const result = parseIssueUrl(
				"https://github.com/my-org/my-repo/issues/789",
			);
			expect(result).toEqual({
				owner: "my-org",
				repo: "my-repo",
				issueNumber: 789,
			});
		});

		it("parses URL with underscores in names", () => {
			const result = parseIssueUrl(
				"https://github.com/my_org/my_repo/issues/1",
			);
			expect(result).toEqual({
				owner: "my_org",
				repo: "my_repo",
				issueNumber: 1,
			});
		});

		it("parses URL with large issue number", () => {
			const result = parseIssueUrl(
				"https://github.com/owner/repo/issues/99999",
			);
			expect(result).toEqual({
				owner: "owner",
				repo: "repo",
				issueNumber: 99999,
			});
		});
	});

	describe("invalid URLs", () => {
		it("returns null for non-GitHub URL", () => {
			expect(parseIssueUrl("https://gitlab.com/owner/repo/issues/123")).toBe(
				null,
			);
		});

		it("returns null for GitHub URL without issue/pull path", () => {
			expect(parseIssueUrl("https://github.com/owner/repo")).toBe(null);
		});

		it("returns null for GitHub URL with different path", () => {
			expect(parseIssueUrl("https://github.com/owner/repo/commits/main")).toBe(
				null,
			);
		});

		it("returns null for empty string", () => {
			expect(parseIssueUrl("")).toBe(null);
		});

		it("returns null for malformed URL", () => {
			expect(parseIssueUrl("not-a-url")).toBe(null);
		});

		it("parses partial GitHub URL (without protocol)", () => {
			// The regex matches github.com anywhere in the string
			const result = parseIssueUrl("github.com/owner/repo/issues/123");
			expect(result).toEqual({
				owner: "owner",
				repo: "repo",
				issueNumber: 123,
			});
		});
	});
});
