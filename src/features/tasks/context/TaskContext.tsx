import { useLiveQuery } from "dexie-react-hooks";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { db } from "@/db/db";
import type { Task } from "@/types";

interface TaskContextValue {
	selectedTask: Task | null;
	selectTask: (task: Task | null) => void;
	clearSelectedTask: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => {
		try {
			return localStorage.getItem("devmodoro-selected-task-id");
		} catch {
			return null;
		}
	});

	const selectedTask = useLiveQuery(
		() => (selectedTaskId ? db.tasks.get(selectedTaskId) : undefined),
		[selectedTaskId],
	);

	const selectTask = useCallback((task: Task | null) => {
		const id = task?.id ?? null;
		setSelectedTaskId(id);
		try {
			if (id) {
				localStorage.setItem("devmodoro-selected-task-id", id);
			} else {
				localStorage.removeItem("devmodoro-selected-task-id");
			}
		} catch (e) {
			console.error("Failed to save selected task ID:", e);
		}
	}, []);

	const clearSelectedTask = useCallback(() => {
		setSelectedTaskId(null);
		try {
			localStorage.removeItem("devmodoro-selected-task-id");
		} catch (e) {
			console.error("Failed to clear selected task ID:", e);
		}
	}, []);

	// Auto-clear selected task if it becomes done
	useEffect(() => {
		if (selectedTask?.status === "done") {
			clearSelectedTask();
		}
	}, [selectedTask?.status, clearSelectedTask]);

	return (
		<TaskContext.Provider
			value={{
				selectedTask: selectedTask ?? null,
				selectTask,
				clearSelectedTask,
			}}
		>
			{children}
		</TaskContext.Provider>
	);
}

export function useSelectedTask() {
	const context = useContext(TaskContext);
	if (!context) {
		throw new Error("useSelectedTask must be used within a TaskProvider");
	}
	return context;
}
