import {
	CheckCircle2,
	Circle,
	Clock,
	ExternalLink,
	Play,
	Trash2,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import { deleteTask, updateTask } from "@/features/tasks/services/taskService";
import type { Task, TaskStatus } from "@/types";

interface TaskItemProps {
	task: Task;
	isSelected: boolean;
	onSelect?: () => void;
}

const STATUS_CONFIG: Record<
	TaskStatus,
	{ label: string; icon: typeof Circle; color: string; bg: string }
> = {
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

const STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "done"];

export const TaskItem = memo(function TaskItem({
	task,
	isSelected,
	onSelect,
}: TaskItemProps) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const statusConfig = STATUS_CONFIG[task.status];
	const StatusIcon = statusConfig.icon;
	const progress =
		task.estimatedPomos > 0
			? Math.round((task.completedPomos / task.estimatedPomos) * 100)
			: 0;

	const handleStatusChange = useCallback(
		async (newStatus: TaskStatus) => {
			setShowStatusMenu(false);
			if (newStatus !== task.status) {
				await updateTask(task.id, { status: newStatus });
			}
		},
		[task.id, task.status],
	);

	const handleDelete = useCallback(async () => {
		if (window.confirm(`Delete "${task.title}"?`)) {
			setIsDeleting(true);
			try {
				await deleteTask(task.id);
			} catch {
				setIsDeleting(false);
			}
		}
	}, [task.id, task.title]);

	return (
		<li
			className={`relative p-3 rounded-lg transition-all ${
				isSelected
					? "bg-primary/20 border border-primary"
					: "bg-theme-bg-tertiary/50 hover:bg-theme-bg-tertiary border border-transparent"
			} ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
		>
			<div className="flex items-start gap-3">
				{/* Status dropdown */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setShowStatusMenu(!showStatusMenu)}
						className={`p-1 rounded hover:bg-theme-bg-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${statusConfig.color}`}
						aria-haspopup="true"
						aria-expanded={showStatusMenu}
						aria-label={`Change status for "${task.title}". Current: ${statusConfig.label}`}
					>
						<StatusIcon className="w-5 h-5" aria-hidden="true" />
					</button>

					{showStatusMenu && (
						<>
							<button
								type="button"
								className="fixed inset-0 z-10 cursor-default"
								onClick={() => setShowStatusMenu(false)}
								aria-label="Close status menu"
							/>
							<div
								className="absolute left-0 top-8 z-20 bg-theme-bg-secondary border border-theme-border rounded-lg shadow-xl py-1 min-w-32"
								role="menu"
							>
								{STATUS_ORDER.map((status) => {
									const config = STATUS_CONFIG[status];
									const Icon = config.icon;
									return (
										<button
											key={status}
											type="button"
											role="menuitem"
											onClick={() => handleStatusChange(status)}
											className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-theme-bg-tertiary transition-colors focus:bg-theme-bg-tertiary focus:outline-none ${
												status === task.status ? "bg-theme-bg-tertiary/50" : ""
											}`}
										>
											<Icon
												className={`w-4 h-4 ${config.color}`}
												aria-hidden="true"
											/>
											<span className="text-sm text-theme-text">
												{config.label}
											</span>
										</button>
									);
								})}
							</div>
						</>
					)}
				</div>

				{/* Task content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-medium text-theme-text truncate">
							{task.title}
						</span>
						{task.externalLink && (
							<a
								href={task.externalLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-theme-text-secondary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
								aria-label={`Open external link for "${task.title}"`}
							>
								<ExternalLink className="w-4 h-4" aria-hidden="true" />
							</a>
						)}
					</div>
					<div className="flex items-center gap-3 mt-1">
						<span className="text-sm text-theme-text-secondary">
							{task.completedPomos}/{task.estimatedPomos} pomos
						</span>
						{task.status !== "done" && task.estimatedPomos > 0 && (
							<div
								className="flex-1 max-w-24 h-1.5 bg-theme-bg-tertiary rounded-full overflow-hidden"
								role="progressbar"
								aria-valuenow={task.completedPomos}
								aria-valuemin={0}
								aria-valuemax={task.estimatedPomos}
								aria-label={`Progress: ${task.completedPomos} of ${task.estimatedPomos} pomos`}
							>
								<div
									className="h-full bg-primary rounded-full transition-all"
									style={{ width: `${progress}%` }}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex items-center gap-1">
					{task.status !== "done" && (
						<button
							type="button"
							onClick={onSelect}
							className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
								isSelected
									? "bg-primary text-primary-foreground"
									: "text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary"
							}`}
							aria-label={
								isSelected
									? `"${task.title}" is currently selected`
									: `Select "${task.title}" for timer`
							}
							title={isSelected ? "Selected" : "Select for timer"}
						>
							<Play className="w-4 h-4" aria-hidden="true" />
						</button>
					)}
					<button
						type="button"
						onClick={handleDelete}
						className="p-2 rounded-lg text-theme-text-secondary hover:text-red-400 hover:bg-theme-bg-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
						aria-label={`Delete task "${task.title}"`}
						title="Delete task"
					>
						<Trash2 className="w-4 h-4" aria-hidden="true" />
					</button>
				</div>
			</div>
		</li>
	);
});
