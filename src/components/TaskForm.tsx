import { Plus } from "lucide-react";
import { useState } from "react";
import { createTask } from "../services/taskService";

export function TaskForm() {
	const [title, setTitle] = useState("");
	const [estimatedPomos, setEstimatedPomos] = useState(1);
	const [externalLink, setExternalLink] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			await createTask({
				title: title.trim(),
				estimatedPomos,
				externalLink: externalLink.trim() || undefined,
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
					className="block text-sm font-medium text-slate-400 mb-1"
				>
					Task Title
				</label>
				<input
					type="text"
					id="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="What are you working on?"
					className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
					disabled={isSubmitting}
				/>
			</div>

			<div className="flex gap-4">
				<div className="flex-1">
					<label
						htmlFor="estimatedPomos"
						className="block text-sm font-medium text-slate-400 mb-1"
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
						className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
						disabled={isSubmitting}
					/>
				</div>

				<div className="flex-1">
					<label
						htmlFor="externalLink"
						className="block text-sm font-medium text-slate-400 mb-1"
					>
						External Link
					</label>
					<input
						type="url"
						id="externalLink"
						value={externalLink}
						onChange={(e) => setExternalLink(e.target.value)}
						placeholder="GitHub issue URL"
						className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
						disabled={isSubmitting}
					/>
				</div>
			</div>

			{error && <p className="text-red-400 text-sm">{error}</p>}

			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
			>
				<Plus className="w-5 h-5" />
				{isSubmitting ? "Adding..." : "Add Task"}
			</button>
		</form>
	);
}
