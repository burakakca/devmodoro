import { m } from "framer-motion";
import {
	Pause,
	PictureInPicture2,
	Play,
	RotateCcw,
	SkipForward,
} from "lucide-react";
import { memo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TimerControlsProps {
	isRunning: boolean;
	isPaused: boolean;
	isIdle: boolean;
	isCompleted: boolean;
	isFocus: boolean;
	hasSelectedTask: boolean;
	onPlay: () => void;
	onPause: () => void;
	onReset: () => void;
	onSkip: () => void;
	onPip?: () => void;
}

export const TimerControls = memo(
	({
		isRunning: _isRunning,
		isPaused,
		isIdle,
		isCompleted,
		isFocus,
		hasSelectedTask,
		onPlay,
		onPause,
		onReset,
		onSkip,
		onPip,
	}: TimerControlsProps) => {
		const reducedMotion = useReducedMotion();

		return (
			<div className="flex flex-col items-center gap-4">
				<div className="flex gap-4">
					{isIdle || isPaused || isCompleted ? (
						<m.button
							type="button"
							onClick={onPlay}
							disabled={isFocus && !hasSelectedTask}
							className="p-4 rounded-full transition-colors shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
							aria-label={
								isFocus && !hasSelectedTask
									? "Select a task to start"
									: isPaused
										? "Resume timer"
										: "Start timer"
							}
							whileHover={
								reducedMotion || (isFocus && !hasSelectedTask)
									? undefined
									: { scale: 1.1 }
							}
							whileTap={
								reducedMotion || (isFocus && !hasSelectedTask)
									? undefined
									: { scale: 0.95 }
							}
						>
							<Play
								className="w-8 h-8 fill-current text-primary-foreground"
								aria-hidden="true"
							/>
						</m.button>
					) : (
						<m.button
							type="button"
							onClick={onPause}
							className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors shadow-lg text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							aria-label="Pause timer"
							whileHover={reducedMotion ? undefined : { scale: 1.1 }}
							whileTap={reducedMotion ? undefined : { scale: 0.95 }}
						>
							<Pause className="w-8 h-8 fill-current" aria-hidden="true" />
						</m.button>
					)}

					<m.button
						type="button"
						onClick={onReset}
						className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						aria-label="Reset timer"
						whileHover={reducedMotion ? undefined : { scale: 1.1 }}
						whileTap={reducedMotion ? undefined : { scale: 0.95 }}
					>
						<RotateCcw className="w-8 h-8" aria-hidden="true" />
					</m.button>

					<m.button
						type="button"
						onClick={onSkip}
						className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						aria-label="Skip session"
						whileHover={reducedMotion ? undefined : { scale: 1.1 }}
						whileTap={reducedMotion ? undefined : { scale: 0.95 }}
					>
						<SkipForward className="w-8 h-8" aria-hidden="true" />
					</m.button>

					{onPip && (
						<m.button
							type="button"
							onClick={onPip}
							className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							aria-label="Open mini player"
							whileHover={reducedMotion ? undefined : { scale: 1.1 }}
							whileTap={reducedMotion ? undefined : { scale: 0.95 }}
						>
							<PictureInPicture2 className="w-8 h-8" aria-hidden="true" />
						</m.button>
					)}
				</div>

				{isFocus && !hasSelectedTask && !isCompleted && (
					<p className="text-xs text-theme-text-secondary font-medium">
						Select a task to start focusing
					</p>
				)}
			</div>
		);
	},
);
