import { useEffect } from "react";
import type { TimerMode } from "@/features/timer/machines/timerMachine";
import { formatTime } from "@/lib/utils";

interface UseDocumentTitleOptions {
	timeLeft: number;
	mode: TimerMode;
	taskTitle?: string;
}

const MODE_LABELS: Record<TimerMode, string> = {
	focus: "Focus",
	shortBreak: "Short Break",
	longBreak: "Long Break",
};

const DEFAULT_TITLE = "Devmodoro";

export const useDocumentTitle = ({
	timeLeft,
	mode,
	taskTitle,
}: UseDocumentTitleOptions) => {
	useEffect(() => {
		const timeString = formatTime(timeLeft);
		const modeString = MODE_LABELS[mode];
		const taskString = taskTitle ? ` | ${taskTitle}` : "";

		document.title = `${timeString} - ${modeString}${taskString}`;

		return () => {
			document.title = DEFAULT_TITLE;
		};
	}, [timeLeft, mode, taskTitle]);
};
