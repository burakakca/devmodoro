import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import type { Task } from "../types";

interface TaskContextValue {
	selectedTask: Task | null;
	selectTask: (task: Task | null) => void;
	clearSelectedTask: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	const selectTask = useCallback((task: Task | null) => {
		setSelectedTask(task);
	}, []);

	const clearSelectedTask = useCallback(() => {
		setSelectedTask(null);
	}, []);

	return (
		<TaskContext.Provider
			value={{ selectedTask, selectTask, clearSelectedTask }}
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
