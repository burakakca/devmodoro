import { Pause, Play, SkipForward } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { TimerMode } from "../machines/timerMachine";

interface TimerPipViewProps {
	timeLeft: number;
	mode: TimerMode;
	isRunning: boolean;
	onPlay: () => void;
	onPause: () => void;
	onSkip: () => void;
}

export const TimerPipView = ({
	timeLeft,
	mode,
	isRunning,
	onPlay,
	onPause,
	onSkip,
}: TimerPipViewProps) => {
	const modeLabel =
		mode === "focus"
			? "Focus"
			: mode === "shortBreak"
				? "Short Break"
				: "Long Break";

	return (
		<div className="flex flex-col items-center justify-center h-screen w-screen bg-theme-bg text-theme-text p-4">
			<div className="text-center space-y-2">
				<div className="text-sm uppercase tracking-widest text-theme-text-secondary font-medium">
					{modeLabel}
				</div>
				<div className="text-6xl font-bold font-mono tabular-nums leading-none">
					{formatTime(timeLeft)}
				</div>
			</div>

			<div className="flex items-center gap-4 mt-6">
				{!isRunning ? (
					<button
						type="button"
						onClick={onPlay}
						className="p-3 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground transition-colors shadow-lg"
						aria-label="Start timer"
					>
						<Play className="w-6 h-6 fill-current" />
					</button>
				) : (
					<button
						type="button"
						onClick={onPause}
						className="p-3 rounded-full bg-theme-bg-tertiary hover:opacity-80 transition-colors shadow-lg"
						aria-label="Pause timer"
					>
						<Pause className="w-6 h-6 fill-current" />
					</button>
				)}

				<button
					type="button"
					onClick={onSkip}
					className="p-3 rounded-full bg-theme-bg-tertiary hover:opacity-80 transition-colors shadow-lg"
					aria-label="Skip session"
				>
					<SkipForward className="w-6 h-6" />
				</button>
			</div>
		</div>
	);
};
