import { Brain, Coffee } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import { Celebration } from "@/components/ui/AnimatedContainer";
import { TabButton } from "@/components/ui/TabButton";
import { useAudio } from "@/features/audio/context/AudioContext";
import { generateSessionComment } from "@/features/github/services/githubService";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useThemeContext } from "@/features/settings/context/ThemeContext";
import { updateStateSettings } from "@/features/settings/services/settingsService";
import { useSelectedTask } from "@/features/tasks/context/TaskContext";
import { updateTask } from "@/features/tasks/services/taskService";
import { useTimer } from "@/features/timer/hooks/useTimer";
import type { TimerMode } from "@/features/timer/machines/timerMachine";
import { formatTime } from "@/lib/utils";
import { useTimerEffects } from "../hooks/useTimerEffects";
import { useTimerNotifications } from "../hooks/useTimerNotifications";
import { CircularProgress } from "./CircularProgress";
import { GitHubLogPrompt } from "./GitHubLogPrompt";
import { TimerControls } from "./TimerControls";
import { TimerStats } from "./TimerStats";

// Lazy load modal that only shows conditionally
const BreakSuggestionModal = lazy(() =>
	import("./BreakSuggestionModal").then((module) => ({
		default: module.BreakSuggestionModal,
	})),
);

const timerModeToSessionMode = (mode: TimerMode) => {
	if (mode === "shortBreak") return "short-break";
	if (mode === "longBreak") return "long-break";
	return "focus";
};

export const Timer = () => {
	const { selectedTask, clearSelectedTask } = useSelectedTask();
	const { settings } = useSettings();
	const { setTimerRunning } = useThemeContext();
	const { playFocus } = useAudio();
	const { timer: timerSettings, integration } = settings;

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

	const handlePomosChange = useCallback(async (count: number) => {
		await updateStateSettings({ completedPomos: count });
	}, []);

	// State machine setup
	const { state, send } = useTimer({
		focusDuration: getDuration("focus"),
		initialCompletedPomos: settings.state.completedPomos,
		onSessionComplete: (mode, duration) =>
			handleSessionComplete(mode, duration),
		onPomosChange: handlePomosChange,
	});

	const { timeLeft, mode, completedPomos, duration } = state.context;
	const isCompleted = state.matches("completed");
	const isRunning = state.matches("running");
	const isPaused = state.matches("paused");
	const isIdle = state.matches("idle");

	// Integrated effects and logic
	const {
		showCelebration,
		setShowCelebration,
		showBreakModal,
		setShowBreakModal,
		showGitHubPrompt,
		setShowGitHubPrompt,
		handleSessionComplete,
		isLongBreakDue,
		pendingActionRef,
		lastCompletedSessionRef,
		postCommentMutation,
	} = useTimerEffects({
		selectedTask,
		clearSelectedTask,
		completedPomos,
		mode,
		isCompleted,
		isIdle,
		duration,
		send,
		getDuration,
	});

	// Handle document title and countdown ticks
	useTimerNotifications({
		timeLeft,
		mode,
		taskTitle: selectedTask?.title,
		isRunning,
		tickingEnabled: settings.sound.tickingEnabled,
	});

	const prevTaskIdRef = useRef<string | undefined>(undefined);
	const isFirstLoadRef = useRef(true);

	// Reset timer when task changes
	useEffect(() => {
		if (selectedTask === undefined) return;
		if (isFirstLoadRef.current) {
			prevTaskIdRef.current = selectedTask?.id;
			isFirstLoadRef.current = false;
			return;
		}
		if (selectedTask?.id !== prevTaskIdRef.current) {
			prevTaskIdRef.current = selectedTask?.id;
			send({ type: "RESET" });
			send({ type: "SET_MODE", mode: "focus", duration: getDuration("focus") });
		}
	}, [selectedTask, send, getDuration]);

	// Sync running state to theme
	useEffect(() => {
		setTimerRunning(isRunning);
	}, [isRunning, setTimerRunning]);

	// Update document title
	const handlePlay = async () => {
		if (isPaused) {
			send({ type: "RESUME" });
			return;
		}
		if (mode === "focus" && isLongBreakDue()) {
			pendingActionRef.current = "start";
			setShowBreakModal(true);
			return;
		}
		if (mode === "focus") {
			if (!selectedTask) return;
			if (selectedTask.status === "done") {
				if (
					window.confirm("This task is completed. Do you want to restart it?")
				) {
					await updateTask(selectedTask.id, { status: "in-progress" });
				} else {
					clearSelectedTask();
					return;
				}
			} else if (selectedTask.status === "todo") {
				await updateTask(selectedTask.id, { status: "in-progress" });
			}
			playFocus();
			send({ type: "SET_COMPLETED_POMOS", count: 0 });
		}
		send({ type: "START" });
	};

	const handleTakeLongBreak = () => {
		setShowBreakModal(false);
		pendingActionRef.current = null;
		send({ type: "SET_COMPLETED_POMOS", count: 0 });
		send({
			type: "SET_MODE",
			mode: "longBreak",
			duration: getDuration("longBreak"),
		});
		send({ type: "START" });
	};

	const handleTakeShortBreak = () => {
		setShowBreakModal(false);
		pendingActionRef.current = null;
		send({ type: "SET_COMPLETED_POMOS", count: 0 });
		send({
			type: "SET_MODE",
			mode: "shortBreak",
			duration: getDuration("shortBreak"),
		});
		send({ type: "START" });
	};

	const handleContinueWorking = async () => {
		setShowBreakModal(false);
		if (pendingActionRef.current === "start") {
			if (mode === "focus" && selectedTask) {
				if (selectedTask.status === "done") {
					if (
						window.confirm("This task is completed. Do you want to restart it?")
					) {
						await updateTask(selectedTask.id, { status: "in-progress" });
					} else {
						pendingActionRef.current = null;
						return;
					}
				} else if (selectedTask.status === "todo") {
					await updateTask(selectedTask.id, { status: "in-progress" });
				}
				playFocus();
				send({ type: "SET_COMPLETED_POMOS", count: 0 });
			}
			send({ type: "START" });
		}
		pendingActionRef.current = null;
	};

	const handleLogToGitHub = async () => {
		const session = lastCompletedSessionRef.current;
		if (!session?.externalLink || !integration.github.token) return;
		const comment = generateSessionComment({
			duration: session.duration,
			mode: timerModeToSessionMode(session.mode),
			taskTitle: session.taskTitle,
		});
		postCommentMutation.mutate({
			token: integration.github.token,
			issueUrl: session.externalLink,
			comment,
		});
	};

	return (
		<section
			className="flex flex-col items-center justify-center p-8 bg-theme-bg-secondary rounded-3xl shadow-xl text-theme-text w-full max-w-md mx-auto"
			aria-labelledby="timer-heading"
		>
			<h2 id="timer-heading" className="sr-only">
				Timer -{" "}
				{mode === "focus"
					? "Focus"
					: mode === "shortBreak"
						? "Short Break"
						: "Long Break"}
			</h2>

			<div className="flex gap-2 mb-6" role="tablist" aria-label="Timer modes">
				{(["focus", "shortBreak", "longBreak"] as const).map((m) => (
					<TabButton
						key={m}
						isSelected={mode === m}
						onClick={() =>
							send({ type: "SET_MODE", mode: m, duration: getDuration(m) })
						}
						disabled={isRunning}
						fullWidth={false}
					>
						{m === "focus"
							? "Focus"
							: m === "shortBreak"
								? "Short Break"
								: "Long Break"}
					</TabButton>
				))}
			</div>

			<div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-theme-text-secondary mb-2">
				{mode === "focus" ? (
					<>
						<Brain className="w-4 h-4" /> Focus Session
					</>
				) : (
					<>
						<Coffee className="w-4 h-4" />{" "}
						{mode === "shortBreak" ? "Short Break" : "Long Break"}
					</>
				)}
			</div>

			{selectedTask && mode === "focus" && (
				<div className="text-primary text-sm mb-4 px-4 py-1 bg-primary-light rounded-full truncate max-w-full">
					{selectedTask.title}
				</div>
			)}

			<div className="mb-8" aria-live="polite" aria-atomic="true">
				<CircularProgress
					timeLeft={timeLeft}
					duration={duration}
					mode={mode}
					isRunning={isRunning}
					isCompleted={isCompleted}
					isCompact={settings.theme.compactMode}
					displayTime={formatTime(timeLeft)}
				/>
			</div>

			<TimerControls
				isRunning={isRunning}
				isPaused={isPaused}
				isIdle={isIdle}
				isCompleted={isCompleted}
				isFocus={mode === "focus"}
				hasSelectedTask={!!selectedTask}
				onPlay={handlePlay}
				onPause={() => send({ type: "PAUSE" })}
				onReset={() => send({ type: "RESET" })}
				onSkip={() => send({ type: "SKIP" })}
			/>

			<TimerStats
				completedPomos={completedPomos}
				longBreakInterval={timerSettings.longBreakInterval}
			/>

			<GitHubLogPrompt
				show={showGitHubPrompt}
				isPending={postCommentMutation.isPending}
				isSuccess={postCommentMutation.isSuccess}
				isError={postCommentMutation.isError}
				errorMessage={postCommentMutation.error?.message}
				onLog={handleLogToGitHub}
				onDismiss={() => {
					setShowGitHubPrompt(false);
					postCommentMutation.reset();
					lastCompletedSessionRef.current = null;
				}}
			/>

			<Celebration
				show={showCelebration}
				onComplete={() => setShowCelebration(false)}
			/>

			<Suspense fallback={null}>
				<BreakSuggestionModal
					isOpen={showBreakModal}
					onClose={() => setShowBreakModal(false)}
					onTakeLongBreak={handleTakeLongBreak}
					onTakeShortBreak={handleTakeShortBreak}
					onContinueWorking={handleContinueWorking}
					longBreakDuration={timerSettings.longBreak}
					shortBreakDuration={timerSettings.shortBreak}
				/>
			</Suspense>
		</section>
	);
};
