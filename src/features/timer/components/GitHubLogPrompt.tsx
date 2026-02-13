import { m } from "framer-motion";
import { CheckCircle, Github, Loader2, X } from "lucide-react";
import { memo, useEffect, useState } from "react";

interface GitHubLogPromptProps {
	show: boolean;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string;
	defaultComment?: string;
	onLog: (comment: string) => void;
	onDismiss: () => void;
}

export const GitHubLogPrompt = memo(
	({
		show,
		isPending,
		isSuccess,
		isError,
		errorMessage,
		defaultComment = "",
		onLog,
		onDismiss,
	}: GitHubLogPromptProps) => {
		const [comment, setComment] = useState(defaultComment);

		// Reset comment when showing or when defaultComment changes
		useEffect(() => {
			if (show) {
				setComment(defaultComment);
			}
		}, [show, defaultComment]);

		if (!show) return null;

		return (
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				className="mt-4 p-4 bg-theme-bg-tertiary rounded-xl w-full border border-theme-border shadow-lg"
			>
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2 text-theme-text">
						<Github className="w-5 h-5" aria-hidden="true" />
						<span className="font-semibold">Log Session to GitHub</span>
					</div>
					<button
						type="button"
						onClick={onDismiss}
						className="p-1 text-theme-text-secondary hover:text-theme-text rounded transition-colors"
						aria-label="Dismiss"
					>
						<X className="w-4 h-4" aria-hidden="true" />
					</button>
				</div>

				<p className="text-sm text-theme-text-secondary mb-3">
					Review and edit your session summary before posting.
				</p>

				<textarea
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					disabled={isPending || isSuccess}
					className="w-full h-32 p-3 text-sm bg-theme-bg-secondary border border-theme-border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary text-theme-text resize-none font-mono"
					placeholder="Enter your comment..."
					aria-label="Comment body"
				/>

				{isError && errorMessage && (
					<p className="text-xs text-red-400 mb-2">{errorMessage}</p>
				)}

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onDismiss}
						disabled={isPending}
						className="px-4 py-2 text-sm text-theme-text-secondary hover:text-theme-text transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => onLog(comment)}
						disabled={isPending || isSuccess}
						className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
					>
						{isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
								Posting...
							</>
						) : isSuccess ? (
							<>
								<CheckCircle className="w-4 h-4" aria-hidden="true" />
								Posted!
							</>
						) : (
							<>
								<Github className="w-4 h-4" aria-hidden="true" />
								Post Comment
							</>
						)}
					</button>
				</div>
			</m.div>
		);
	},
);
