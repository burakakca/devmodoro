import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { TaskStatus } from "@/types";

export interface TaskStatusConfig {
	label: string;
	icon: typeof Circle;
	color: string;
	bg: string;
}

/**
 * Shared configuration for task status display.
 * Used by TaskItem, TaskList, and any component that needs status styling.
 */
export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusConfig> = {
	todo: {
		label: "To Do",
		icon: Circle,
		color: "text-theme-text-muted",
		bg: "bg-theme-bg-tertiary",
	},
	"in-progress": {
		label: "In Progress",
		icon: Clock,
		color: "text-warning",
		bg: "bg-warning",
	},
	done: {
		label: "Done",
		icon: CheckCircle2,
		color: "text-success",
		bg: "bg-success",
	},
};

/**
 * Order of statuses for cycling through or displaying in sequence.
 */
export const TASK_STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "done"];
