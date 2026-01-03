import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/db";
import type { Task } from "@/types";
import { useSessionLogger } from "./useSessionLogger";

// Mock the services
vi.mock("@/features/tasks/services/taskService", () => ({
	incrementTaskPomos: vi.fn(),
}));

vi.mock("@/features/timer/services/sessionService", () => ({
	createSession: vi.fn(),
}));

import { incrementTaskPomos } from "@/features/tasks/services/taskService";
import { createSession } from "@/features/timer/services/sessionService";

describe("useSessionLogger", () => {
	const mockPlayAlarm = vi.fn();
	const mockOnCelebrate = vi.fn();
	const mockOnGitHubLog = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await db.sessions.clear();
	});

	const createTask = (overrides: Partial<Task> = {}): Task => ({
		id: "task-1",
		title: "Test Task",
		estimatedPomos: 4,
		completedPomos: 0,
		status: "todo",
		createdAt: Date.now(),
		...overrides,
	});

	it("returns handleSessionComplete function", () => {
		const { result } = renderHook(() =>
			useSessionLogger({
				selectedTask: null,
				playAlarm: mockPlayAlarm,
				onCelebrate: mockOnCelebrate,
			}),
		);

		expect(typeof result.current.handleSessionComplete).toBe("function");
	});

	describe("handleSessionComplete", () => {
		it("plays alarm sound on any session completion", async () => {
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: null,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(mockPlayAlarm).toHaveBeenCalledTimes(1);
		});

		it("triggers celebration only for focus sessions", async () => {
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: null,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			// Focus session - should celebrate
			await result.current.handleSessionComplete("focus", 1500);
			expect(mockOnCelebrate).toHaveBeenCalledTimes(1);

			vi.clearAllMocks();

			// Short break - should not celebrate
			await result.current.handleSessionComplete("shortBreak", 300);
			expect(mockOnCelebrate).not.toHaveBeenCalled();

			// Long break - should not celebrate
			await result.current.handleSessionComplete("longBreak", 900);
			expect(mockOnCelebrate).not.toHaveBeenCalled();
		});

		it("creates session with correct data", async () => {
			const task = createTask();
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(createSession).toHaveBeenCalledWith(
				expect.objectContaining({
					taskId: "task-1",
					duration: 1500,
					mode: "focus",
				}),
			);
		});

		it("uses 'no-task' when no task is selected", async () => {
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: null,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(createSession).toHaveBeenCalledWith(
				expect.objectContaining({
					taskId: "no-task",
				}),
			);
		});

		it("converts timer modes to session modes correctly", async () => {
			const task = createTask();
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			// Test focus mode
			await result.current.handleSessionComplete("focus", 1500);
			expect(createSession).toHaveBeenLastCalledWith(
				expect.objectContaining({ mode: "focus" }),
			);

			// Test shortBreak mode
			await result.current.handleSessionComplete("shortBreak", 300);
			expect(createSession).toHaveBeenLastCalledWith(
				expect.objectContaining({ mode: "short-break" }),
			);

			// Test longBreak mode
			await result.current.handleSessionComplete("longBreak", 900);
			expect(createSession).toHaveBeenLastCalledWith(
				expect.objectContaining({ mode: "long-break" }),
			);
		});

		it("increments task pomos for focus sessions with selected task", async () => {
			const task = createTask();
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(incrementTaskPomos).toHaveBeenCalledWith("task-1");
		});

		it("does not increment pomos for break sessions", async () => {
			const task = createTask();
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			await result.current.handleSessionComplete("shortBreak", 300);

			expect(incrementTaskPomos).not.toHaveBeenCalled();
		});

		it("does not increment pomos when no task selected", async () => {
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: null,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(incrementTaskPomos).not.toHaveBeenCalled();
		});

		it("triggers GitHub log for task with external link", async () => {
			const task = createTask({
				externalLink: "https://github.com/owner/repo/issues/1",
			});
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
					onGitHubLog: mockOnGitHubLog,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(mockOnGitHubLog).toHaveBeenCalledWith({
				mode: "focus",
				duration: 1500,
				taskTitle: "Test Task",
				externalLink: "https://github.com/owner/repo/issues/1",
			});
		});

		it("does not trigger GitHub log without external link", async () => {
			const task = createTask();
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
					onGitHubLog: mockOnGitHubLog,
				}),
			);

			await result.current.handleSessionComplete("focus", 1500);

			expect(mockOnGitHubLog).not.toHaveBeenCalled();
		});

		it("does not trigger GitHub log without onGitHubLog callback", async () => {
			const task = createTask({
				externalLink: "https://github.com/owner/repo/issues/1",
			});
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
				}),
			);

			// Should not throw
			await result.current.handleSessionComplete("focus", 1500);
		});

		it("does not trigger GitHub log for break sessions", async () => {
			const task = createTask({
				externalLink: "https://github.com/owner/repo/issues/1",
			});
			const { result } = renderHook(() =>
				useSessionLogger({
					selectedTask: task,
					playAlarm: mockPlayAlarm,
					onCelebrate: mockOnCelebrate,
					onGitHubLog: mockOnGitHubLog,
				}),
			);

			await result.current.handleSessionComplete("shortBreak", 300);

			expect(mockOnGitHubLog).not.toHaveBeenCalled();
		});
	});
});
