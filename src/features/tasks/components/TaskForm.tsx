import { useLiveQuery } from "dexie-react-hooks";
import { Plus } from "lucide-react";
import { useState } from "react";
import { db } from "@/db/db";
import { createTask } from "@/features/tasks/services/taskService";

export const TaskForm = () => {
	const [title, setTitle] = useState("");
	const [estimatedPomos, setEstimatedPomos] = useState(1);
	const [externalLink, setExternalLink] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const existingTasks = useLiveQuery(() => db.tasks.toArray());

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		if (estimatedPomos < 1) {
			setError("Estimated pomos must be at least 1");
			return;
		}

		setIsSubmitting(true);

		try {
			const link = externalLink.trim();
			let displayTitle = title.trim();

			if (link && existingTasks) {
				const count = existingTasks.filter(
					(t) => t.externalLink === link,
				).length;
				if (count > 0) {
					displayTitle = `${displayTitle} (${count + 1})`;
				}
			}

			await createTask({
				title: displayTitle,
				estimatedPomos,
				externalLink: link || undefined,
				status: "todo",
			});

			// Reset form on success
			setTitle("");
			setEstimatedPomos(1);
			setExternalLink("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create task");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label
					htmlFor="title"
					className="block text-sm font-medium text-theme-text-secondary mb-1"
				>
					Task Title <span className="text-red-400">*</span>
				</label>
				<input
					type="text"
					id="title"
					required
					aria-required="true"
					aria-invalid={error === "Title is required" ? "true" : "false"}
					aria-describedby={error ? "task-form-error" : undefined}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="What are you working on?"
					className="w-full px-4 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
					disabled={isSubmitting}
				/>
			</div>

			<div className="flex gap-4">
				<div className="flex-1">
					<label
						htmlFor="estimatedPomos"
						className="block text-sm font-medium text-theme-text-secondary mb-1"
					>
						Estimated Pomos
					</label>
					<input
						type="number"
						id="estimatedPomos"
						value={estimatedPomos}
						onChange={(e) => setEstimatedPomos(Number(e.target.value))}
						min={1}
						max={20}
						className="w-full px-4 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
						disabled={isSubmitting}
					/>
				</div>

				<div className="flex-1">
					<label
						htmlFor="externalLink"
						className="block text-sm font-medium text-theme-text-secondary mb-1"
					>
						External Link
					</label>
					<input
						type="url"
						id="externalLink"
						value={externalLink}
						onChange={(e) => setExternalLink(e.target.value)}
						placeholder="GitHub issue URL"
						className="w-full px-4 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
						disabled={isSubmitting}
					/>
				</div>
			</div>

			{error && (
				<p id="task-form-error" className="text-red-400 text-sm" role="alert">
					{error}
				</p>
			)}

			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-primary-foreground font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
			>
				<Plus className="w-5 h-5" aria-hidden="true" />
				{isSubmitting ? "Adding..." : "Add Task"}
			</button>
		</form>
	);
};
