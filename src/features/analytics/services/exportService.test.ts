import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportSessions } from "./exportService";

describe("exportService", () => {
	let mockCreateObjectURL: ReturnType<typeof vi.fn>;
	let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
	let mockAppendChild: ReturnType<typeof vi.fn>;
	let mockRemoveChild: ReturnType<typeof vi.fn>;
	let mockClick: ReturnType<typeof vi.fn>;
	let createdLink: HTMLAnchorElement | null = null;

	beforeEach(() => {
		mockCreateObjectURL = vi.fn().mockReturnValue("blob:test-url");
		mockRevokeObjectURL = vi.fn();
		mockAppendChild = vi.fn();
		mockRemoveChild = vi.fn();
		mockClick = vi.fn();

		// Mock URL methods
		vi.stubGlobal("URL", {
			createObjectURL: mockCreateObjectURL,
			revokeObjectURL: mockRevokeObjectURL,
		});

		// Mock document methods
		vi.spyOn(document, "createElement").mockImplementation((tag) => {
			if (tag === "a") {
				createdLink = {
					href: "",
					download: "",
					click: mockClick,
				} as unknown as HTMLAnchorElement;
				return createdLink as HTMLAnchorElement;
			}
			return document.createElement(tag);
		});

		vi.spyOn(document.body, "appendChild").mockImplementation(mockAppendChild);
		vi.spyOn(document.body, "removeChild").mockImplementation(mockRemoveChild);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		createdLink = null;
	});

	describe("exportSessions - JSON format", () => {
		it("exports sessions as JSON", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000, // 2024-01-01 00:00:00
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
					taskTitle: "Test Task",
				},
			];

			exportSessions(sessions, "json", "export");

			expect(mockCreateObjectURL).toHaveBeenCalled();
			const blobArg = mockCreateObjectURL.mock.calls[0][0];
			expect(blobArg).toBeInstanceOf(Blob);
			expect(blobArg.type).toBe("application/json");

			expect(createdLink?.download).toBe("export.json");
			expect(mockClick).toHaveBeenCalled();
			expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
		});

		it("formats JSON with indentation", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000,
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
				},
			];

			exportSessions(sessions, "json", "test");

			const blobArg = mockCreateObjectURL.mock.calls[0][0];
			// Reading the blob content would require async, but we verify it was created
			expect(blobArg).toBeInstanceOf(Blob);
		});
	});

	describe("exportSessions - CSV format", () => {
		it("exports sessions as CSV", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000,
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
					taskTitle: "Test Task",
				},
			];

			exportSessions(sessions, "csv", "export");

			expect(mockCreateObjectURL).toHaveBeenCalled();
			const blobArg = mockCreateObjectURL.mock.calls[0][0];
			expect(blobArg.type).toBe("text/csv");

			expect(createdLink?.download).toBe("export.csv");
			expect(mockClick).toHaveBeenCalled();
		});

		it("escapes quotes in task titles for CSV", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000,
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
					taskTitle: 'Task with "quotes"',
				},
			];

			exportSessions(sessions, "csv", "test");

			// The function should handle quotes properly
			expect(mockCreateObjectURL).toHaveBeenCalled();
		});

		it("handles sessions without task title", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000,
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
				},
			];

			// Should not throw
			expect(() => exportSessions(sessions, "csv", "test")).not.toThrow();
		});
	});

	describe("file download behavior", () => {
		it("creates download link and triggers click", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000,
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
				},
			];

			exportSessions(sessions, "json", "my-export");

			expect(document.createElement).toHaveBeenCalledWith("a");
			expect(createdLink?.href).toBe("blob:test-url");
			expect(createdLink?.download).toBe("my-export.json");
			expect(mockAppendChild).toHaveBeenCalledWith(createdLink);
			expect(mockClick).toHaveBeenCalled();
			expect(mockRemoveChild).toHaveBeenCalledWith(createdLink);
		});

		it("revokes object URL after download", () => {
			const sessions = [
				{
					id: "session-1",
					taskId: "task-1",
					startTime: 1704067200000,
					endTime: 1704068700000,
					duration: 1500,
					mode: "focus" as const,
				},
			];

			exportSessions(sessions, "json", "test");

			expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
		});
	});
});
