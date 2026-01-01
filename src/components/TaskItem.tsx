import {
	CheckCircle2,
	Circle,
	Clock,
	ExternalLink,
	Play,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { deleteTask, updateTask } from "../services/taskService";
import type { Task, TaskStatus } from "../types";

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
		color: "text-slate-400",
		bg: "bg-slate-400",
	},
	"in-progress": {
		label: "In Progress",
		icon: Clock,
		color: "text-amber-400",
		bg: "bg-amber-400",
	},
	done: {
		label: "Done",
		icon: CheckCircle2,
		color: "text-green-400",
		bg: "bg-green-400",
	},
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in-progress", "done"];

export function TaskItem({ task, isSelected, onSelect }: TaskItemProps) {
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const statusConfig = STATUS_CONFIG[task.status];
	const StatusIcon = statusConfig.icon;
	const progress =
		task.estimatedPomos > 0
			? Math.round((task.completedPomos / task.estimatedPomos) * 100)
			: 0;

	const handleStatusChange = async (newStatus: TaskStatus) => {
		setShowStatusMenu(false);
		if (newStatus !== task.status) {
			await updateTask(task.id, { status: newStatus });
		}
	};

	const handleDelete = async () => {
		if (window.confirm(`Delete "${task.title}"?`)) {
			setIsDeleting(true);
			try {
				await deleteTask(task.id);
			} catch {
				setIsDeleting(false);
			}
		}
	};

	return (
		<div
			className={`relative p-3 rounded-lg transition-all ${
				isSelected
					? "bg-indigo-600/20 border border-indigo-500"
					: "bg-slate-800/50 hover:bg-slate-800 border border-transparent"
			} ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
		>
			<div className="flex items-start gap-3">
				{/* Status dropdown */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setShowStatusMenu(!showStatusMenu)}
						className={`p-1 rounded hover:bg-slate-700 transition-colors ${statusConfig.color}`}
						title="Change status"
					>
						<StatusIcon className="w-5 h-5" />
					</button>

					{showStatusMenu && (
						<>
							<button
								type="button"
								className="fixed inset-0 z-10 cursor-default"
								onClick={() => setShowStatusMenu(false)}
								aria-label="Close status menu"
							/>
							<div className="absolute left-0 top-8 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-32">
								{STATUS_ORDER.map((status) => {
									const config = STATUS_CONFIG[status];
									const Icon = config.icon;
									return (
										<button
											key={status}
											type="button"
											onClick={() => handleStatusChange(status)}
											className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors ${
												status === task.status ? "bg-slate-700/50" : ""
											}`}
										>
											<Icon className={`w-4 h-4 ${config.color}`} />
											<span className="text-sm text-white">{config.label}</span>
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
						<span className="font-medium text-white truncate">
							{task.title}
						</span>
						{task.externalLink && (
							<a
								href={task.externalLink}
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-400 hover:text-indigo-400 transition-colors"
							>
								<ExternalLink className="w-4 h-4" />
							</a>
						)}
					</div>
					<div className="flex items-center gap-3 mt-1">
						<span className="text-sm text-slate-400">
							{task.completedPomos}/{task.estimatedPomos} pomos
						</span>
						{task.status !== "done" && task.estimatedPomos > 0 && (
							<div className="flex-1 max-w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
								<div
									className="h-full bg-indigo-500 rounded-full transition-all"
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
							className={`p-2 rounded-lg transition-colors ${
								isSelected
									? "bg-indigo-600 text-white"
									: "text-slate-400 hover:text-white hover:bg-slate-700"
							}`}
							title={isSelected ? "Selected" : "Select for timer"}
						>
							<Play className="w-4 h-4" />
						</button>
					)}
					<button
						type="button"
						onClick={handleDelete}
						className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
						title="Delete task"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
