import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Brain,
	CheckCircle,
	Coffee,
	Github,
	Loader2,
	Pause,
	Play,
	RotateCcw,
	SkipForward,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Celebration,
	useReducedMotion,
} from "@/components/ui/AnimatedContainer";
import { useAudio } from "@/features/audio/context/AudioContext";
import {
	generateSessionComment,
	postIssueComment,
} from "@/features/github/services/githubService";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useThemeContext } from "@/features/settings/context/ThemeContext";
import { updateStateSettings } from "@/features/settings/services/settingsService";
import { useSelectedTask } from "@/features/tasks/context/TaskContext";
import {
	incrementTaskPomos,
	updateTask,
} from "@/features/tasks/services/taskService";
import { useTimer } from "@/features/timer/hooks/useTimer";
import type { TimerMode } from "@/features/timer/machines/timerMachine";
import { createSession } from "@/features/timer/services/sessionService";
import { formatTime } from "@/lib/utils";
import type { SessionMode } from "@/types";
import { BreakSuggestionModal } from "./BreakSuggestionModal";
import { CircularProgress } from "./CircularProgress";

function timerModeToSessionMode(mode: TimerMode): SessionMode {
	if (mode === "shortBreak") return "short-break";
	if (mode === "longBreak") return "long-break";
	return "focus";
}

export function Timer() {
	const { selectedTask } = useSelectedTask();
	const { settings } = useSettings();
	const { setTimerRunning } = useThemeContext();
	const { playAlarm } = useAudio();
	const { timer: timerSettings, integration } = settings;
	const [showCelebration, setShowCelebration] = useState(false);
	const [showBreakModal, setShowBreakModal] = useState(false);
	const [showGitHubPrompt, setShowGitHubPrompt] = useState(false);

	const lastCompletedSessionRef = useRef<{
		mode: TimerMode;
		duration: number;
		taskTitle?: string;
		externalLink?: string;
	} | null>(null);
	const reducedMotion = useReducedMotion();
	const hasHandledCompletionRef = useRef(false);
	const pendingActionRef = useRef<"start" | null>(null);

	// Mutation for posting GitHub comments
	const postCommentMutation = useMutation({
		mutationFn: async ({
			token,
			issueUrl,
			comment,
		}: {
			token: string;
			issueUrl: string;
			comment: string;
		}) => {
			const result = await postIssueComment(token, issueUrl, comment);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to post comment");
			}
			return result;
		},
		onSuccess: () => {
			setTimeout(() => {
				setShowGitHubPrompt(false);
				postCommentMutation.reset();
			}, 2000);
		},
	});

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

			// Play alarm sound
			playAlarm();

			// Show celebration for focus sessions
			if (mode === "focus") {
				setShowCelebration(true);
			}

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

				// Store session info for GitHub logging
				if (selectedTask.externalLink) {
					lastCompletedSessionRef.current = {
						mode,
						duration,
						taskTitle: selectedTask.title,
						externalLink: selectedTask.externalLink,
					};

					// Auto-post if enabled
					if (integration.autoPostToGitHub && integration.github.isConnected) {
						const comment = generateSessionComment({
							duration,
							mode: sessionMode,
							taskTitle: selectedTask.title,
						});
						postCommentMutation.mutate({
							token: integration.github.token,
							issueUrl: selectedTask.externalLink,
							comment,
						});
					} else if (integration.github.isConnected) {
						// Show manual log prompt
						setShowGitHubPrompt(true);
						postCommentMutation.reset();
					}
				}
			}
		},
		[selectedTask, playAlarm, integration, postCommentMutation],
	);

	const handlePomosChange = useCallback(async (count: number) => {
		await updateStateSettings({ completedPomos: count });
	}, []);

	const { state, send } = useTimer({
		focusDuration: getDuration("focus"),
		initialCompletedPomos: settings.state.completedPomos,
		onSessionComplete: handleSessionComplete,
		onPomosChange: handlePomosChange,
	});

	const { timeLeft, mode, completedPomos } = state.context;
	const isCompleted = state.matches("completed");
	const prevTaskIdRef = useRef<string | undefined>(undefined);
	const isFirstLoadRef = useRef(true);
	const isRunning = state.matches("running");
	const isPaused = state.matches("paused");
	const isIdle = state.matches("idle");

	// Check if long break is due
	const isLongBreakDue = useCallback(() => {
		if (timerSettings.longBreakInterval === 0) return false;
		return (
			completedPomos > 0 &&
			completedPomos % timerSettings.longBreakInterval === 0
		);
	}, [completedPomos, timerSettings.longBreakInterval]);

	// Reset timer when task changes
	useEffect(() => {
		// Wait for task to load from DB
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

	// Handle mode switching after completion
	useEffect(() => {
		if (isCompleted && !hasHandledCompletionRef.current) {
			hasHandledCompletionRef.current = true;

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

				// Reset completedPomos after completing a long break
				if (mode === "longBreak") {
					send({ type: "SET_COMPLETED_POMOS", count: 0 });
				}

				// Don't auto-start if task is done
				if (selectedTask?.status === "done") {
					shouldAutoStart = false;
				}

				// Show break suggestion modal instead of auto-starting if long break is due
				if (shouldAutoStart && isLongBreakDue()) {
					shouldAutoStart = false;
					pendingActionRef.current = "start";
					setShowBreakModal(true);
				}
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
		} else if (!isCompleted) {
			// Reset the flag when we leave the completed state
			hasHandledCompletionRef.current = false;
		}
	}, [
		isCompleted,
		completedPomos,
		mode,
		timerSettings,
		getDuration,
		send,
		selectedTask,
		isLongBreakDue,
	]);

	// Update duration when settings change (only in idle state)
	useEffect(() => {
		if (isIdle) {
			const newDuration = getDuration(mode);
			if (newDuration !== state.context.duration) {
				send({ type: "SET_MODE", mode, duration: newDuration });
			}
		}
	}, [isIdle, mode, state.context.duration, getDuration, send]);

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

	// Update theme context with running state
	useEffect(() => {
		setTimerRunning(isRunning);
	}, [isRunning, setTimerRunning]);

	// Update document title
	useEffect(() => {
		const timeString = formatTime(timeLeft);
		const modeString =
			mode === "focus"
				? "Focus"
				: mode === "shortBreak"
					? "Short Break"
					: "Long Break";
		const taskString = selectedTask ? ` | ${selectedTask.title}` : "";

		document.title = `${timeString} - ${modeString}${taskString}`;

		return () => {
			document.title = "Devmodoro";
		};
	}, [timeLeft, mode, selectedTask]);

	const handlePlay = async () => {
		if (isPaused) {
			send({ type: "RESUME" });
			return;
		}

		// Check if we should suggest a break before starting focus
		if (mode === "focus" && isLongBreakDue()) {
			pendingActionRef.current = "start";
			setShowBreakModal(true);
			return;
		}

		if (mode === "focus") {
			if (!selectedTask) {
				return;
			}
			if (selectedTask.status === "todo") {
				await updateTask(selectedTask.id, { status: "in-progress" });
			}
		}

		send({ type: "START" });
	};

	// Modal action handlers
	const handleTakeLongBreak = () => {
		setShowBreakModal(false);
		pendingActionRef.current = null;
		switchToLongBreak();
		send({ type: "START" });
	};

	const handleTakeShortBreak = () => {
		setShowBreakModal(false);
		pendingActionRef.current = null;
		switchToShortBreak();
		send({ type: "START" });
	};

	const handleContinueWorking = async () => {
		setShowBreakModal(false);
		// Proceed with the pending action
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
			}
			send({ type: "START" });
		}
		pendingActionRef.current = null;
	};

	// GitHub log handler
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

	const dismissGitHubPrompt = () => {
		setShowGitHubPrompt(false);
		postCommentMutation.reset();
		lastCompletedSessionRef.current = null;
	};

	return (
		<section
			className="flex flex-col items-center justify-center p-8 bg-theme-bg-secondary rounded-3xl shadow-xl text-theme-text w-full max-w-md mx-auto"
			aria-labelledby="timer-heading"
		>
			<h2 id="timer-heading" className="sr-only">
				Timer -{" "}
				{mode === "focus"
					? "Focus Session"
					: mode === "shortBreak"
						? "Short Break"
						: "Long Break"}
			</h2>

			{/* Mode Tabs */}
			<div className="flex gap-2 mb-6" role="tablist" aria-label="Timer modes">
				<button
					type="button"
					role="tab"
					aria-selected={mode === "focus"}
					onClick={switchToFocus}
					disabled={isRunning}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
						mode === "focus"
							? "bg-primary text-primary-foreground"
							: "text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary disabled:opacity-50"
					}`}
				>
					Focus
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={mode === "shortBreak"}
					onClick={switchToShortBreak}
					disabled={isRunning}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
						mode === "shortBreak"
							? "bg-primary text-primary-foreground"
							: "text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary disabled:opacity-50"
					}`}
				>
					Short Break
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={mode === "longBreak"}
					onClick={switchToLongBreak}
					disabled={isRunning}
					className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
						mode === "longBreak"
							? "bg-primary text-primary-foreground"
							: "text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary disabled:opacity-50"
					}`}
				>
					Long Break
				</button>
			</div>

			{/* Mode Indicator */}
			<div className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-theme-text-secondary mb-2">
				{mode === "focus" ? (
					<>
						<Brain className="w-4 h-4" aria-hidden="true" />
						Focus Session
					</>
				) : (
					<>
						<Coffee className="w-4 h-4" aria-hidden="true" />
						{mode === "shortBreak" ? "Short Break" : "Long Break"}
					</>
				)}
			</div>

			{/* Selected Task */}
			{selectedTask && mode === "focus" && (
				<div
					className="text-primary text-sm mb-4 px-4 py-1 bg-primary-light rounded-full truncate max-w-full"
					title={`Current task: ${selectedTask.title}`}
				>
					{selectedTask.title}
				</div>
			)}

			{/* Circular Progress Timer */}
			<div className="mb-8" aria-live="polite" aria-atomic="true">
				<CircularProgress
					timeLeft={timeLeft}
					duration={state.context.duration}
					mode={mode}
					isRunning={isRunning}
					isCompleted={isCompleted}
					isCompact={settings.theme.compactMode}
					displayTime={formatTime(timeLeft)}
				/>
			</div>

			{/* Controls */}
			<div className="flex flex-col items-center gap-4">
				<div className="flex gap-4">
					{isIdle || isPaused || isCompleted ? (
						<motion.button
							type="button"
							onClick={handlePlay}
							disabled={mode === "focus" && !selectedTask}
							className="p-4 rounded-full transition-colors shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
							aria-label={
								mode === "focus" && !selectedTask
									? "Select a task to start"
									: isPaused
										? "Resume timer"
										: "Start timer"
							}
							whileHover={
								reducedMotion || (mode === "focus" && !selectedTask)
									? undefined
									: { scale: 1.1 }
							}
							whileTap={
								reducedMotion || (mode === "focus" && !selectedTask)
									? undefined
									: { scale: 0.95 }
							}
						>
							<Play
								className="w-8 h-8 fill-current text-primary-foreground"
								aria-hidden="true"
							/>
						</motion.button>
					) : (
						<motion.button
							type="button"
							onClick={() => send({ type: "PAUSE" })}
							className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors shadow-lg text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
							aria-label="Pause timer"
							whileHover={reducedMotion ? undefined : { scale: 1.1 }}
							whileTap={reducedMotion ? undefined : { scale: 0.95 }}
						>
							<Pause className="w-8 h-8 fill-current" aria-hidden="true" />
						</motion.button>
					)}

					<motion.button
						type="button"
						onClick={() => send({ type: "RESET" })}
						className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						aria-label="Reset timer"
						whileHover={reducedMotion ? undefined : { scale: 1.1 }}
						whileTap={reducedMotion ? undefined : { scale: 0.95 }}
					>
						<RotateCcw className="w-8 h-8" aria-hidden="true" />
					</motion.button>

					<motion.button
						type="button"
						onClick={() => send({ type: "SKIP" })}
						className="p-4 bg-theme-bg-tertiary hover:opacity-80 rounded-full transition-colors text-theme-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						aria-label="Skip session"
						whileHover={reducedMotion ? undefined : { scale: 1.1 }}
						whileTap={reducedMotion ? undefined : { scale: 0.95 }}
					>
						<SkipForward className="w-8 h-8" aria-hidden="true" />
					</motion.button>
				</div>

				{mode === "focus" && !selectedTask && (
					<p className="text-xs text-primary font-medium animate-pulse">
						Select a task to start focusing
					</p>
				)}
			</div>

			{/* Stats */}
			<div className="mt-8 flex items-center justify-center gap-4 text-theme-text-muted text-sm min-h-[1.5rem]">
				{timerSettings.longBreakInterval > 0 ? (
					<>
						<span className="font-medium">
							Pomos: {(completedPomos % timerSettings.longBreakInterval) + 1} /{" "}
							{timerSettings.longBreakInterval}
						</span>
						<span className="text-theme-text-muted opacity-70">
							(Long break in{" "}
							{timerSettings.longBreakInterval -
								(completedPomos % timerSettings.longBreakInterval)}
							)
						</span>
					</>
				) : (
					<span className="opacity-70">Focus Mode</span>
				)}
			</div>

			{/* GitHub Log Prompt */}
			{showGitHubPrompt && (
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
							onClick={dismissGitHubPrompt}
							className="p-1 text-theme-text-secondary hover:text-theme-text rounded transition-colors"
							aria-label="Dismiss"
						>
							<X className="w-4 h-4" aria-hidden="true" />
						</button>
					</div>
					<p className="text-xs text-theme-text-secondary mb-3">
						Post a session summary to the linked issue
					</p>
					{postCommentMutation.isError && (
						<p className="text-xs text-red-400 mb-2">
							{postCommentMutation.error.message}
						</p>
					)}
					<button
						type="button"
						onClick={handleLogToGitHub}
						disabled={
							postCommentMutation.isPending || postCommentMutation.isSuccess
						}
						className="w-full py-2 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
					>
						{postCommentMutation.isPending ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
								Posting...
							</>
						) : postCommentMutation.isSuccess ? (
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
			)}

			{/* Celebration animation */}
			<Celebration
				show={showCelebration}
				onComplete={() => setShowCelebration(false)}
			/>

			{/* Break suggestion modal */}
			<BreakSuggestionModal
				isOpen={showBreakModal}
				onClose={() => setShowBreakModal(false)}
				onTakeLongBreak={handleTakeLongBreak}
				onTakeShortBreak={handleTakeShortBreak}
				onContinueWorking={handleContinueWorking}
				longBreakDuration={timerSettings.longBreak}
				shortBreakDuration={timerSettings.shortBreak}
			/>
		</section>
	);
}
