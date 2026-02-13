import { useLiveQuery } from "dexie-react-hooks";
import { m } from "framer-motion";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { CollapsibleGroup } from "@/components/ui/CollapsibleGroup";
import { db } from "@/db/db";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Task, TaskStatus } from "@/types";
import { TASK_STATUS_CONFIG } from "../constants/taskStatusConfig";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
	onSelectTask?: (task: Task) => void;
	selectedTaskId?: string;
}

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
	const config = TASK_STATUS_CONFIG[status];
	const reducedMotion = useReducedMotion();

	if (tasks.length === 0) return null;

	return (
		<CollapsibleGroup
			title={config.label}
			count={tasks.length}
			defaultExpanded={defaultExpanded}
			groupId={`task-group-${status}`}
			headerClassName={config.color}
		>
			<ul className="space-y-2" aria-labelledby={`task-group-${status}`}>
				{tasks.map((task, index) => (
					<m.div
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
					</m.div>
				))}
			</ul>
		</CollapsibleGroup>
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
