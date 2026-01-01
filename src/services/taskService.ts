import { db } from "../db/db";
import type { Task, TaskStatus } from "../types";

export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "completedPomos">;

/**
 * Creates a new task in the database
 */
export async function createTask(input: CreateTaskInput): Promise<string> {
	const task: Task = {
		...input,
		id: crypto.randomUUID(),
		completedPomos: 0,
		createdAt: Date.now(),
	};

	await db.tasks.add(task);
	return task.id;
}

/**
 * Retrieves all tasks, ordered by creation date (newest first)
 */
export async function getTasks(): Promise<Task[]> {
	return db.tasks.orderBy("createdAt").reverse().toArray();
}

/**
 * Retrieves a single task by ID
 */
export async function getTaskById(id: string): Promise<Task | undefined> {
	return db.tasks.get(id);
}

/**
 * Retrieves tasks filtered by status
 */
export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
	return db.tasks.where("status").equals(status).toArray();
}

/**
 * Updates an existing task
 */
export async function updateTask(
	id: string,
	updates: Partial<Omit<Task, "id" | "createdAt">>,
): Promise<void> {
	const count = await db.tasks.update(id, updates);
	if (count === 0) {
		throw new Error(`Task with id ${id} not found`);
	}
}

/**
 * Deletes a task by ID
 */
export async function deleteTask(id: string): Promise<void> {
	await db.tasks.delete(id);
}

/**
 * Increments the completed pomodoros count for a task
 */
export async function incrementTaskPomos(id: string): Promise<void> {
	await db.tasks
		.where("id")
		.equals(id)
		.modify((task) => {
			task.completedPomos += 1;
			// Auto-mark as done if completed all estimated pomos
			if (task.completedPomos >= task.estimatedPomos) {
				task.status = "done";
			} else if (task.status === "todo") {
				// Auto-mark as in-progress on first pomo
				task.status = "in-progress";
			}
		});
}
