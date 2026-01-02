import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import {
	AnimatedContainer,
	useReducedMotion,
} from "@/components/ui/AnimatedContainer";
import { db } from "@/db/db";
import type { Task, TaskStatus } from "@/types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
	onSelectTask?: (task: Task) => void;
	selectedTaskId?: string;
}

const STATUS_CONFIG: Record<
	TaskStatus,
	{ label: string; icon: typeof Circle; color: string }
> = {
	todo: { label: "To Do", icon: Circle, color: "text-theme-text-muted" },
	"in-progress": {
		label: "In Progress",
		icon: Clock,
		color: "text-warning",
	},
	done: { label: "Done", icon: CheckCircle2, color: "text-success" },
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
	const reducedMotion = useReducedMotion();

	if (tasks.length === 0) return null;

	return (
		<div className="space-y-2">
			<h3
				id={`task-group-${status}`}
				className={`text-sm font-medium uppercase tracking-wider ${config.color}`}
			>
				{config.label} ({tasks.length})
			</h3>
			<ul className="space-y-2" aria-labelledby={`task-group-${status}`}>
				<AnimatePresence mode="popLayout">
					{tasks.map((task, index) => (
						<motion.div
							key={task.id}
							layout={!reducedMotion}
							initial={reducedMotion ? false : { opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={reducedMotion ? undefined : { opacity: 0, x: -20 }}
							transition={{
								duration: 0.2,
								delay: index * 0.05,
							}}
						>
							<TaskItem
								task={task}
								isSelected={task.id === selectedTaskId}
								onSelect={() => onSelectTask?.(task)}
							/>
						</motion.div>
					))}
				</AnimatePresence>
			</ul>
		</div>
	);
}

export function TaskList({ onSelectTask, selectedTaskId }: TaskListProps) {
	const tasks = useLiveQuery(() =>
		db.tasks.orderBy("createdAt").reverse().toArray(),
	);

	if (tasks === undefined) {
		return (
			<div className="text-center py-8 text-theme-text-muted">
				Loading tasks...
			</div>
		);
	}

	if (tasks.length === 0) {
		return (
			<AnimatedContainer animation="fadeIn" className="text-center py-8">
				<p className="text-theme-text-muted mb-2">No tasks yet</p>
				<p className="text-sm text-theme-text-muted opacity-60">
					Add a task above to get started
				</p>
			</AnimatedContainer>
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
