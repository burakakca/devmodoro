import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/db";
import {
	createTask,
	deleteTask,
	getTaskById,
	getTasks,
	getTasksByStatus,
	incrementTaskPomos,
	updateTask,
} from "./taskService";

describe("taskService", () => {
	beforeEach(async () => {
		// Clear the tasks table before each test
		await db.tasks.clear();
	});

	describe("createTask", () => {
		it("creates a task with auto-generated id and timestamp", async () => {
			const id = await createTask({
				title: "Test Task",
				estimatedPomos: 4,
				status: "todo",
			});

			expect(id).toBe("test-uuid-0001");

			const task = await db.tasks.get(id);
			expect(task).toBeDefined();
			expect(task?.title).toBe("Test Task");
			expect(task?.estimatedPomos).toBe(4);
			expect(task?.completedPomos).toBe(0);
			expect(task?.status).toBe("todo");
			expect(task?.createdAt).toBeDefined();
		});

		it("creates a task with optional fields", async () => {
			const id = await createTask({
				title: "GitHub Task",
				estimatedPomos: 2,
				status: "todo",
				projectId: "project-1",
				externalLink: "https://github.com/owner/repo/issues/1",
			});

			const task = await db.tasks.get(id);
			expect(task?.projectId).toBe("project-1");
			expect(task?.externalLink).toBe("https://github.com/owner/repo/issues/1");
		});
	});

	describe("getTasks", () => {
		it("returns empty array when no tasks exist", async () => {
			const tasks = await getTasks();
			expect(tasks).toEqual([]);
		});

		it("returns tasks ordered by createdAt (newest first)", async () => {
			await createTask({ title: "First", estimatedPomos: 1, status: "todo" });
			await createTask({ title: "Second", estimatedPomos: 1, status: "todo" });
			await createTask({ title: "Third", estimatedPomos: 1, status: "todo" });

			const tasks = await getTasks();
			expect(tasks).toHaveLength(3);
			expect(tasks[0].title).toBe("Third");
			expect(tasks[1].title).toBe("Second");
			expect(tasks[2].title).toBe("First");
		});
	});

	describe("getTaskById", () => {
		it("returns undefined for non-existent task", async () => {
			const task = await getTaskById("non-existent-id");
			expect(task).toBeUndefined();
		});

		it("returns the correct task", async () => {
			const id = await createTask({
				title: "Find Me",
				estimatedPomos: 3,
				status: "todo",
			});

			const task = await getTaskById(id);
			expect(task).toBeDefined();
			expect(task?.title).toBe("Find Me");
		});
	});

	describe("getTasksByStatus", () => {
		beforeEach(async () => {
			await createTask({ title: "Todo 1", estimatedPomos: 1, status: "todo" });
			await createTask({ title: "Todo 2", estimatedPomos: 1, status: "todo" });
			await createTask({
				title: "In Progress",
				estimatedPomos: 1,
				status: "in-progress",
			});
			await createTask({ title: "Done", estimatedPomos: 1, status: "done" });
		});

		it("returns tasks with todo status", async () => {
			const tasks = await getTasksByStatus("todo");
			expect(tasks).toHaveLength(2);
			expect(tasks.every((t) => t.status === "todo")).toBe(true);
		});

		it("returns tasks with in-progress status", async () => {
			const tasks = await getTasksByStatus("in-progress");
			expect(tasks).toHaveLength(1);
			expect(tasks[0].title).toBe("In Progress");
		});

		it("returns tasks with done status", async () => {
			const tasks = await getTasksByStatus("done");
			expect(tasks).toHaveLength(1);
			expect(tasks[0].title).toBe("Done");
		});

		it("returns empty array for status with no tasks", async () => {
			await db.tasks.clear();
			const tasks = await getTasksByStatus("done");
			expect(tasks).toEqual([]);
		});
	});

	describe("updateTask", () => {
		it("updates task fields", async () => {
			const id = await createTask({
				title: "Original",
				estimatedPomos: 4,
				status: "todo",
			});

			await updateTask(id, { title: "Updated", estimatedPomos: 6 });

			const task = await getTaskById(id);
			expect(task?.title).toBe("Updated");
			expect(task?.estimatedPomos).toBe(6);
		});

		it("updates task status", async () => {
			const id = await createTask({
				title: "Task",
				estimatedPomos: 1,
				status: "todo",
			});

			await updateTask(id, { status: "in-progress" });
			let task = await getTaskById(id);
			expect(task?.status).toBe("in-progress");

			await updateTask(id, { status: "done" });
			task = await getTaskById(id);
			expect(task?.status).toBe("done");
		});

		it("throws error for non-existent task", async () => {
			await expect(
				updateTask("non-existent-id", { title: "Updated" }),
			).rejects.toThrow("Task with id non-existent-id not found");
		});
	});

	describe("deleteTask", () => {
		it("deletes an existing task", async () => {
			const id = await createTask({
				title: "To Delete",
				estimatedPomos: 1,
				status: "todo",
			});

			await deleteTask(id);

			const task = await getTaskById(id);
			expect(task).toBeUndefined();
		});

		it("does not throw for non-existent task", async () => {
			await expect(deleteTask("non-existent-id")).resolves.not.toThrow();
		});
	});

	describe("incrementTaskPomos", () => {
		it("increments completedPomos by 1", async () => {
			const id = await createTask({
				title: "Task",
				estimatedPomos: 4,
				status: "todo",
			});

			// Get initial state
			let task = await getTaskById(id);
			expect(task?.completedPomos).toBe(0);

			await incrementTaskPomos(id);
			task = await getTaskById(id);
			// After incrementing, completedPomos should be 1
			expect(task?.completedPomos).toBe(1);
		});

		it("changes status from todo to in-progress on first pomo", async () => {
			const id = await createTask({
				title: "Task",
				estimatedPomos: 4,
				status: "todo",
			});

			await incrementTaskPomos(id);
			const task = await getTaskById(id);
			// Status should change to in-progress
			expect(task?.status).toBe("in-progress");
		});

		it("changes status to done when reaching estimated pomos", async () => {
			const id = await createTask({
				title: "Task",
				estimatedPomos: 2,
				status: "todo",
			});

			// First pomo
			await incrementTaskPomos(id);
			let task = await getTaskById(id);
			expect(task?.completedPomos).toBe(1);
			expect(task?.status).toBe("in-progress");

			// Second pomo - should complete
			await incrementTaskPomos(id);
			task = await getTaskById(id);
			expect(task?.completedPomos).toBe(2);
			expect(task?.status).toBe("done");
		});

		it("does not increment or change status for done tasks", async () => {
			// Create a task that's already done
			const id = await createTask({
				title: "Task",
				estimatedPomos: 2,
				status: "done",
			});

			// Manually set completedPomos to simulate completed task
			await db.tasks.update(id, { completedPomos: 2 });

			// Try to increment - should have no effect
			await incrementTaskPomos(id);
			const task = await getTaskById(id);
			expect(task?.completedPomos).toBe(2);
			expect(task?.status).toBe("done");
		});

		it("keeps in-progress status when not yet complete", async () => {
			const id = await createTask({
				title: "Task",
				estimatedPomos: 4,
				status: "in-progress",
			});
			await db.tasks.update(id, { completedPomos: 1 });

			await incrementTaskPomos(id);
			const task = await getTaskById(id);
			expect(task?.status).toBe("in-progress");
			expect(task?.completedPomos).toBe(2);
		});
	});
});
