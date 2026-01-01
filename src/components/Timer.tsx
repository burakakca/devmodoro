import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { useTimer } from "../hooks/useTimer";
import { formatTime } from "../lib/utils";

interface TimerProps {
	focusDuration: number;
}

export function Timer({ focusDuration }: TimerProps) {
	const { state, send } = useTimer(focusDuration);
	const { timeLeft, mode } = state.context;

	return (
		<div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl shadow-xl text-white w-full max-w-md mx-auto">
			<div className="text-sm font-medium uppercase tracking-widest text-slate-400 mb-2">
				{mode === "focus"
					? "Focus Session"
					: mode === "shortBreak"
						? "Short Break"
						: "Long Break"}
			</div>

			<div className="text-8xl font-bold font-mono mb-8 tabular-nums">
				{formatTime(timeLeft)}
			</div>

			<div className="flex gap-4">
				{state.matches("idle") || state.matches("paused") || state.matches("completed") ? (
					<button
						type="button"
						onClick={() => send({ type: state.matches("paused") ? "RESUME" : "START" })}
						className="p-4 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors shadow-lg shadow-indigo-500/20"
						aria-label="Start"
					>
						<Play className="w-8 h-8 fill-current" />
					</button>
				) : (
					<button
						type="button"
						onClick={() => send({ type: "PAUSE" })}
						className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors shadow-lg"
						aria-label="Pause"
					>
						<Pause className="w-8 h-8 fill-current" />
					</button>
				)}

				<button
					type="button"
					onClick={() => send({ type: "RESET" })}
					className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
					aria-label="Reset"
				>
					<RotateCcw className="w-8 h-8" />
				</button>

				<button
					type="button"
					onClick={() => send({ type: "SKIP" })}
					className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
					aria-label="Skip"
				>
					<SkipForward className="w-8 h-8" />
				</button>
			</div>

			<div className="mt-8 text-slate-500 text-sm">
				Completed: {state.context.completedPomos}
			</div>
		</div>
	);
}
