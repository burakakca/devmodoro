import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db/db";
import type { Task } from "@/types";
import { TaskProvider, useSelectedTask } from "./TaskContext";

// Mock localStorage
const localStorageMock = {
	store: {} as Record<string, string>,
	getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
	setItem: vi.fn((key: string, value: string) => {
		localStorageMock.store[key] = value;
	}),
	removeItem: vi.fn((key: string) => {
		delete localStorageMock.store[key];
	}),
	clear: vi.fn(() => {
		localStorageMock.store = {};
	}),
};

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

const wrapper = ({ children }: { children: ReactNode }) => (
	<TaskProvider>{children}</TaskProvider>
);

describe("TaskContext", () => {
	const mockTask: Task = {
		id: "task-1",
		title: "Test Task",
		estimatedPomos: 4,
		completedPomos: 0,
		status: "todo",
		createdAt: Date.now(),
	};

	beforeEach(async () => {
		await db.tasks.clear();
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await db.tasks.clear();
	});

	describe("useSelectedTask", () => {
		it("throws error when used outside TaskProvider", () => {
			// Suppress console.error for this test
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			expect(() => {
				renderHook(() => useSelectedTask());
			}).toThrow("useSelectedTask must be used within a TaskProvider");

			consoleSpy.mockRestore();
		});

		it("returns null selectedTask initially", () => {
			const { result } = renderHook(() => useSelectedTask(), { wrapper });
			expect(result.current.selectedTask).toBeNull();
		});

		it("provides selectTask function", () => {
			const { result } = renderHook(() => useSelectedTask(), { wrapper });
			expect(typeof result.current.selectTask).toBe("function");
		});

		it("provides clearSelectedTask function", () => {
			const { result } = renderHook(() => useSelectedTask(), { wrapper });
			expect(typeof result.current.clearSelectedTask).toBe("function");
		});
	});

	describe("selectTask", () => {
		it("stores task ID in localStorage when selecting a task", async () => {
			await db.tasks.add(mockTask);

			const { result } = renderHook(() => useSelectedTask(), { wrapper });

			act(() => {
				result.current.selectTask(mockTask);
			});

			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"devmodoro-selected-task-id",
				"task-1",
			);
		});

		it("removes task ID from localStorage when selecting null", async () => {
			const { result } = renderHook(() => useSelectedTask(), { wrapper });

			act(() => {
				result.current.selectTask(null);
			});

			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				"devmodoro-selected-task-id",
			);
		});
	});

	describe("clearSelectedTask", () => {
		it("removes task ID from localStorage", async () => {
			const { result } = renderHook(() => useSelectedTask(), { wrapper });

			act(() => {
				result.current.clearSelectedTask();
			});

			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				"devmodoro-selected-task-id",
			);
		});
	});

	describe("localStorage persistence", () => {
		it("reads initial task ID from localStorage", async () => {
			await db.tasks.add(mockTask);
			localStorageMock.store["devmodoro-selected-task-id"] = "task-1";

			const { result } = renderHook(() => useSelectedTask(), { wrapper });

			// Wait for the live query to resolve
			await waitFor(() => {
				expect(result.current.selectedTask).not.toBeNull();
			});

			expect(result.current.selectedTask?.id).toBe("task-1");
		});

		it("handles missing localStorage gracefully", () => {
			localStorageMock.getItem.mockImplementationOnce(() => {
				throw new Error("localStorage unavailable");
			});

			const { result } = renderHook(() => useSelectedTask(), { wrapper });

			// Should not throw, selectedTask should be null
			expect(result.current.selectedTask).toBeNull();
		});
	});

	describe("auto-deselect", () => {
		it("clears selected task when status becomes done", async () => {
			await db.tasks.add(mockTask);
			const { result } = renderHook(() => useSelectedTask(), { wrapper });

			// Select the task
			act(() => {
				result.current.selectTask(mockTask);
			});

			await waitFor(() => {
				expect(result.current.selectedTask?.id).toBe(mockTask.id);
			});

			// Update task status to done
			await act(async () => {
				await db.tasks.update(mockTask.id, { status: "done" });
			});

			// Expect it to be cleared
			await waitFor(() => {
				expect(result.current.selectedTask).toBeNull();
			});
		});
	});
});
