import { Coffee, Zap } from "lucide-react";
import { useCallback, useEffect } from "react";

interface BreakSuggestionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onTakeLongBreak: () => void;
	onTakeShortBreak: () => void;
	onContinueWorking: () => void;
	longBreakDuration: number;
	shortBreakDuration: number;
}

export function BreakSuggestionModal({
	isOpen,
	onClose,
	onTakeLongBreak,
	onTakeShortBreak,
	onContinueWorking,
	longBreakDuration,
	shortBreakDuration,
}: BreakSuggestionModalProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, handleKeyDown]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center"
			role="dialog"
			aria-modal="true"
			aria-labelledby="break-suggestion-title"
		>
			<button
				type="button"
				className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
				onClick={onClose}
				aria-label="Close modal"
			/>

			<div className="relative w-full max-w-md bg-theme-bg-secondary rounded-2xl shadow-2xl p-6 m-4">
				<div className="text-center mb-6">
					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
						<Coffee className="w-8 h-8 text-primary" aria-hidden="true" />
					</div>
					<h2
						id="break-suggestion-title"
						className="text-xl font-semibold text-theme-text mb-2"
					>
						Time for a Long Break!
					</h2>
					<p className="text-theme-text-secondary">
						You've earned a {longBreakDuration} minute break. Taking regular
						breaks improves focus and productivity.
					</p>
				</div>

				<div className="space-y-3">
					<button
						type="button"
						onClick={onTakeLongBreak}
						className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
					>
						Take Long Break ({longBreakDuration} min)
					</button>

					<button
						type="button"
						onClick={onTakeShortBreak}
						className="w-full py-3 px-4 bg-theme-bg-tertiary hover:opacity-80 text-theme-text rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
					>
						Just a Short Break ({shortBreakDuration} min)
					</button>

					<button
						type="button"
						onClick={onContinueWorking}
						className="w-full py-2 px-4 text-theme-text-secondary hover:text-theme-text text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-lg flex items-center justify-center gap-2"
					>
						<Zap className="w-4 h-4" aria-hidden="true" />
						Continue Working (not recommended)
					</button>
				</div>
			</div>
		</div>
	);
}
