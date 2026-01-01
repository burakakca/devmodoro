import {
	Brain,
	Coffee,
	Pause,
	Play,
	RotateCcw,
	SkipForward,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useSelectedTask } from "../contexts/TaskContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { useTimer } from "../hooks/useTimer";
import { formatTime } from "../lib/utils";
import type { TimerMode } from "../machines/timerMachine";
import { createSession } from "../services/sessionService";
import { incrementTaskPomos } from "../services/taskService";
import type { SessionMode } from "../types";

function timerModeToSessionMode(mode: TimerMode): SessionMode {
	if (mode === "shortBreak") return "short-break";
	if (mode === "longBreak") return "long-break";
	return "focus";
}

export function Timer() {
	const { selectedTask } = useSelectedTask();
	const { settings } = useSettings();
	const { setTimerRunning } = useThemeContext();
	const { timer: timerSettings } = settings;
	const prevCompletedRef = useRef(0);

	// Calculate duration based on current mode
	const getDuration = useCallback(
		(mode: TimerMode): number => {
			switch (mode) {
				case "focus":
					return timerSettings.pomodoro * 60;
				case "shortBreak":
					return timerSettings.shortBreak * 60;
				case "longBreak":
					return timerSettings.longBreak * 60;
			}
		},
		[timerSettings],
	);

	const handleSessionComplete = useCallback(
		async (mode: TimerMode, duration: number) => {
			const now = Date.now();
			const sessionMode = timerModeToSessionMode(mode);

			// Log session to database
			await createSession({
				taskId: selectedTask?.id ?? "no-task",
				startTime: now - duration * 1000,
				endTime: now,
				duration,
				mode: sessionMode,
			});

			// Increment task pomos if this was a focus session with a selected task
			if (mode === "focus" && selectedTask) {
				await incrementTaskPomos(selectedTask.id);
			}
		},
		[selectedTask],
	);

	const { state, send } = useTimer({
		focusDuration: getDuration("focus"),
		onSessionComplete: handleSessionComplete,
	});

	const { timeLeft, mode, completedPomos } = state.context;

	// Handle mode switching after completion
	useEffect(() => {
		if (
			state.matches("completed") &&
			completedPomos !== prevCompletedRef.current
		) {
			prevCompletedRef.current = completedPomos;

			// Determine next mode
			let nextMode: TimerMode;
			let shouldAutoStart = false;

			if (mode === "focus") {
				// After focus, go to break
				// Check if it's time for a long break
				if (
					timerSettings.longBreakInterval > 0 &&
					completedPomos % timerSettings.longBreakInterval === 0
				) {
					nextMode = "longBreak";
				} else {
					nextMode = "shortBreak";
				}
				shouldAutoStart = timerSettings.autoStartBreaks;
			} else {
				// After break, go to focus
				nextMode = "focus";
				shouldAutoStart = timerSettings.autoStartPomodoros;
			}

			const nextDuration = getDuration(nextMode);

			// Switch to next mode
			send({ type: "SET_MODE", mode: nextMode, duration: nextDuration });

			// Auto-start if enabled
			if (shouldAutoStart) {
				setTimeout(() => {
					send({ type: "START" });
				}, 500);
			}
		}
	}, [completedPomos, mode, timerSettings, getDuration, send, state.matches]);

	// Update duration when settings change (only in idle state)
	useEffect(() => {
		if (state.matches("idle")) {
			const newDuration = getDuration(mode);
			if (newDuration !== state.context.duration) {
				send({ type: "SET_MODE", mode, duration: newDuration });
			}
		}
	}, [mode, state.context.duration, getDuration, send, state.matches]);

	// Mode switch handlers
	const switchToFocus = () => {
		send({ type: "SET_MODE", mode: "focus", duration: getDuration("focus") });
	};

	const switchToShortBreak = () => {
		send({
			type: "SET_MODE",
			mode: "shortBreak",
			duration: getDuration("shortBreak"),
		});
	};

	const switchToLongBreak = () => {
		send({
			type: "SET_MODE",
			mode: "longBreak",
			duration: getDuration("longBreak"),
		});
	};

	const isRunning = state.matches("running");
	const isIdle = state.matches("idle");
	const isPaused = state.matches("paused");
	const isCompleted = state.matches("completed");

	// Update theme context with running state
	useEffect(() => {
		setTimerRunning(isRunning);
	}, [isRunning, setTimerRunning]);

	return (
		<div className="flex flex-col items-center justify-center p-8 bg-slate-900 rounded-3xl shadow-xl text-white w-full max-w-md mx-auto">
			{/* Mode Tabs */}
			<div className="flex gap-2 mb-6">
				<button
					type="button"
					onClick={switchToFocus}
					disabled={isRunning}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
						mode === "focus"
							? "bg-indigo-600 text-white"
							: "text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
					}`}
				>
					Focus
				</button>
				<button
					type="button"
					onClick={switchToShortBreak}
					disabled={isRunning}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
						mode === "shortBreak"
							? "bg-green-600 text-white"
							: "text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
					}`}
				>
					Short Break
				</button>
				<button
					type="button"
					onClick={switchToLongBreak}
					disabled={isRunning}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
						mode === "longBreak"
							? "bg-emerald-600 text-white"
							: "text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50"
					}`}
				>
					Long Break
				</button>
			</div>

			{/* Mode Indicator */}
			<div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-400 mb-2">
				{mode === "focus" ? (
					<>
						<Brain className="w-4 h-4" />
						Focus Session
					</>
				) : (
					<>
						<Coffee className="w-4 h-4" />
						{mode === "shortBreak" ? "Short Break" : "Long Break"}
					</>
				)}
			</div>

			{/* Selected Task */}
			{selectedTask && mode === "focus" && (
				<div className="text-indigo-400 text-sm mb-4 px-4 py-1 bg-indigo-500/10 rounded-full truncate max-w-full">
					{selectedTask.title}
				</div>
			)}

			{/* Timer Display */}
			<div className="text-8xl font-bold font-mono mb-8 tabular-nums">
				{formatTime(timeLeft)}
			</div>

			{/* Controls */}
			<div className="flex gap-4">
				{isIdle || isPaused || isCompleted ? (
					<button
						type="button"
						onClick={() => send({ type: isPaused ? "RESUME" : "START" })}
						className={`p-4 rounded-full transition-colors shadow-lg ${
							mode === "focus"
								? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
								: "bg-green-600 hover:bg-green-500 shadow-green-500/20"
						}`}
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

			{/* Stats */}
			<div className="mt-8 flex items-center gap-4 text-slate-500 text-sm">
				<span>Completed: {completedPomos}</span>
				{timerSettings.longBreakInterval > 0 && (
					<span className="text-slate-600">
						(Long break in{" "}
						{timerSettings.longBreakInterval -
							(completedPomos % timerSettings.longBreakInterval)}
						)
					</span>
				)}
			</div>
		</div>
	);
}
