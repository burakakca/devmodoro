import { useLiveQuery } from "dexie-react-hooks";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { db } from "../db/db";
import type { Task, TaskStatus } from "../types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
	onSelectTask?: (task: Task) => void;
	selectedTaskId?: string;
}

const STATUS_CONFIG: Record<
	TaskStatus,
	{ label: string; icon: typeof Circle; color: string }
> = {
	todo: { label: "To Do", icon: Circle, color: "text-slate-400" },
	"in-progress": { label: "In Progress", icon: Clock, color: "text-amber-400" },
	done: { label: "Done", icon: CheckCircle2, color: "text-green-400" },
};

function TaskGroup({
	status,
	tasks,
	selectedTaskId,
	onSelectTask,
}: {
	status: TaskStatus;
	tasks: Task[];
	selectedTaskId?: string;
	onSelectTask?: (task: Task) => void;
}) {
	const config = STATUS_CONFIG[status];

	if (tasks.length === 0) return null;

	return (
		<div className="space-y-2">
			<h3
				className={`text-sm font-medium uppercase tracking-wider ${config.color}`}
			>
				{config.label} ({tasks.length})
			</h3>
			<div className="space-y-2">
				{tasks.map((task) => (
					<TaskItem
						key={task.id}
						task={task}
						isSelected={task.id === selectedTaskId}
						onSelect={() => onSelectTask?.(task)}
					/>
				))}
			</div>
		</div>
	);
}

export function TaskList({ onSelectTask, selectedTaskId }: TaskListProps) {
	const tasks = useLiveQuery(() =>
		db.tasks.orderBy("createdAt").reverse().toArray(),
	);

	if (tasks === undefined) {
		return (
			<div className="text-center py-8 text-slate-500">Loading tasks...</div>
		);
	}

	if (tasks.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-slate-500 mb-2">No tasks yet</p>
				<p className="text-sm text-slate-600">
					Add a task above to get started
				</p>
			</div>
		);
	}

	const groupedTasks: Record<TaskStatus, Task[]> = {
		"in-progress": tasks.filter((t) => t.status === "in-progress"),
		todo: tasks.filter((t) => t.status === "todo"),
		done: tasks.filter((t) => t.status === "done"),
	};

	return (
		<div className="space-y-6">
			<TaskGroup
				status="in-progress"
				tasks={groupedTasks["in-progress"]}
				selectedTaskId={selectedTaskId}
				onSelectTask={onSelectTask}
			/>
			<TaskGroup
				status="todo"
				tasks={groupedTasks.todo}
				selectedTaskId={selectedTaskId}
				onSelectTask={onSelectTask}
			/>
			<TaskGroup
				status="done"
				tasks={groupedTasks.done}
				selectedTaskId={selectedTaskId}
				onSelectTask={onSelectTask}
			/>
		</div>
	);
}
