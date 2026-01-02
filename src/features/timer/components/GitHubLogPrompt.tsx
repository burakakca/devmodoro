import { motion } from "framer-motion";
import { CheckCircle, Github, Loader2, X } from "lucide-react";
import { memo } from "react";

interface GitHubLogPromptProps {
	show: boolean;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string;
	onLog: () => void;
	onDismiss: () => void;
}

export const GitHubLogPrompt = memo(
	({
		show,
		isPending,
		isSuccess,
		isError,
		errorMessage,
		onLog,
		onDismiss,
	}: GitHubLogPromptProps) => {
		if (!show) return null;

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				className="mt-4 p-4 bg-theme-bg-tertiary rounded-xl w-full"
			>
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2 text-theme-text">
						<Github className="w-4 h-4" aria-hidden="true" />
						<span className="text-sm font-medium">Log to GitHub?</span>
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
				<p className="text-xs text-theme-text-secondary mb-3">
					Post a session summary to the linked issue
				</p>
				{isError && errorMessage && (
					<p className="text-xs text-red-400 mb-2">{errorMessage}</p>
				)}
				<button
					type="button"
					onClick={onLog}
					disabled={isPending || isSuccess}
					className="w-full py-2 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
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
							Log Session
						</>
					)}
				</button>
			</motion.div>
		);
	},
);
