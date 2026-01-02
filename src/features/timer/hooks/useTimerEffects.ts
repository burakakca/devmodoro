import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "@/features/audio/context/AudioContext";
import {
	generateSessionComment,
	postIssueComment,
} from "@/features/github/services/githubService";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { incrementTaskPomos } from "@/features/tasks/services/taskService";
import type { Task } from "@/types";
import type { TimerEvent, TimerMode } from "../machines/timerMachine";
import { createSession } from "../services/sessionService";

interface UseTimerEffectsProps {
	selectedTask: Task | null;
	clearSelectedTask: () => void;
	completedPomos: number;
	mode: TimerMode;
	isCompleted: boolean;
	isIdle: boolean;
	duration: number;
	send: (event: TimerEvent) => void;
	getDuration: (mode: TimerMode) => number;
}

const timerModeToSessionMode = (mode: TimerMode) => {
	if (mode === "shortBreak") return "short-break";
	if (mode === "longBreak") return "long-break";
	return "focus";
};

export const useTimerEffects = ({
	selectedTask,
	clearSelectedTask,
	completedPomos,
	mode,
	isCompleted,
	isIdle,
	duration,
	send,
	getDuration,
}: UseTimerEffectsProps) => {
	const { settings } = useSettings();
	const { playAlarm, playFocus } = useAudio();
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

	const isLongBreakDue = useCallback(() => {
		if (timerSettings.longBreakInterval === 0) return false;
		return (
			completedPomos > 0 &&
			completedPomos % timerSettings.longBreakInterval === 0
		);
	}, [completedPomos, timerSettings.longBreakInterval]);

	const handleSessionComplete = useCallback(
		async (mode: TimerMode, duration: number) => {
			const now = Date.now();
			const sessionMode = timerModeToSessionMode(mode);

			playAlarm();

			if (mode === "focus") {
				setShowCelebration(true);
			}

			await createSession({
				taskId: selectedTask?.id ?? "no-task",
				startTime: now - duration * 1000,
				endTime: now,
				duration,
				mode: sessionMode,
			});

			if (mode === "focus" && selectedTask) {
				await incrementTaskPomos(selectedTask.id);

				if (selectedTask.externalLink) {
					lastCompletedSessionRef.current = {
						mode,
						duration,
						taskTitle: selectedTask.title,
						externalLink: selectedTask.externalLink,
					};

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
						setShowGitHubPrompt(true);
						postCommentMutation.reset();
					}
				}
			}
		},
		[selectedTask, playAlarm, integration, postCommentMutation],
	);

	// Handle mode switching after completion
	useEffect(() => {
		if (isCompleted && !hasHandledCompletionRef.current) {
			hasHandledCompletionRef.current = true;

			let nextMode: TimerMode;
			let shouldAutoStart = false;

			if (mode === "focus") {
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
				nextMode = "focus";
				shouldAutoStart = timerSettings.autoStartPomodoros;

				if (selectedTask?.status === "done") {
					clearSelectedTask();
					shouldAutoStart = false;
				} else if (!selectedTask) {
					shouldAutoStart = false;
				}

				if (mode === "longBreak") {
					send({ type: "SET_COMPLETED_POMOS", count: 0 });
				} else if (shouldAutoStart && isLongBreakDue()) {
					shouldAutoStart = false;
					pendingActionRef.current = "start";
					setShowBreakModal(true);
				}
			}

			const nextDuration = getDuration(nextMode);
			send({ type: "SET_MODE", mode: nextMode, duration: nextDuration });

			if (shouldAutoStart) {
				setTimeout(() => {
					if (nextMode === "focus") {
						playFocus();
					}
					send({ type: "START" });
				}, 500);
			}
		} else if (!isCompleted) {
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
		playFocus,
		clearSelectedTask,
	]);

	// Update duration when settings change (only in idle state)
	useEffect(() => {
		if (isIdle) {
			const newDuration = getDuration(mode);
			if (newDuration !== duration) {
				send({ type: "SET_MODE", mode, duration: newDuration });
			}
		}
	}, [isIdle, mode, duration, getDuration, send]);

	return {
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
	};
};
