import { useCallback } from "react";
import { incrementTaskPomos } from "@/features/tasks/services/taskService";
import type { TimerMode } from "@/features/timer/machines/timerMachine";
import { createSession } from "@/features/timer/services/sessionService";
import type { SessionMode, Task } from "@/types";

interface UseSessionLoggerOptions {
	selectedTask: Task | null;
	playAlarm: () => void;
	onCelebrate: () => void;
	onGitHubLog?: (data: {
		mode: TimerMode;
		duration: number;
		taskTitle?: string;
		externalLink?: string;
	}) => void;
}

const timerModeToSessionMode = (mode: TimerMode): SessionMode => {
	if (mode === "shortBreak") return "short-break";
	if (mode === "longBreak") return "long-break";
	return "focus";
};

export const useSessionLogger = ({
	selectedTask,
	playAlarm,
	onCelebrate,
	onGitHubLog,
}: UseSessionLoggerOptions) => {
	const handleSessionComplete = useCallback(
		async (mode: TimerMode, duration: number) => {
			const now = Date.now();
			const sessionMode = timerModeToSessionMode(mode);

			// Play alarm sound
			playAlarm();

			// Show celebration for focus sessions
			if (mode === "focus") {
				onCelebrate();
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

				// Trigger GitHub logging if task has external link
				if (selectedTask.externalLink && onGitHubLog) {
					onGitHubLog({
						mode,
						duration,
						taskTitle: selectedTask.title,
						externalLink: selectedTask.externalLink,
					});
				}
			}
		},
		[selectedTask, playAlarm, onCelebrate, onGitHubLog],
	);

	return { handleSessionComplete };
};
