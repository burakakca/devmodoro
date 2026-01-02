import { useLiveQuery } from "dexie-react-hooks";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, Circle, Clock } from "lucide-react";
import { useState } from "react";
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

const TaskGroup = ({
	status,
	tasks,
	selectedTaskId,
	onSelectTask,
	defaultExpanded = true,
}: {
	status: TaskStatus;
	tasks: Task[];
	selectedTaskId?: string;
	onSelectTask?: (task: Task) => void;
	defaultExpanded?: boolean;
}) => {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const config = STATUS_CONFIG[status];
	const reducedMotion = useReducedMotion();

	if (tasks.length === 0) return null;

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="flex items-center gap-2 w-full text-left focus:outline-none group"
			>
				<h3
					id={`task-group-${status}`}
					className={`text-sm font-medium uppercase tracking-wider flex-1 ${config.color}`}
				>
					{config.label} ({tasks.length})
				</h3>
				<ChevronDown
					className={`w-4 h-4 transition-transform duration-200 ${
						isExpanded ? "rotate-0" : "-rotate-90"
					} text-theme-text-muted group-hover:text-theme-text`}
				/>
			</button>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						initial={reducedMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<ul
							className="space-y-2 pt-1"
							aria-labelledby={`task-group-${status}`}
						>
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
						</ul>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export const TaskList = ({ onSelectTask, selectedTaskId }: TaskListProps) => {
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
				defaultExpanded={false}
			/>
		</div>
	);
};
