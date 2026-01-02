import { useEffect, useRef } from "react";
import { useAudio } from "@/features/audio/context/AudioContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { TimerMode } from "../machines/timerMachine";

interface UseTimerNotificationsProps {
	timeLeft: number;
	mode: TimerMode;
	taskTitle?: string;
	isRunning: boolean;
	tickingEnabled: boolean;
}

export const useTimerNotifications = ({
	timeLeft,
	mode,
	taskTitle,
	isRunning,
	tickingEnabled,
}: UseTimerNotificationsProps) => {
	const { playCountdownTick } = useAudio();
	const prevTimeLeftRef = useRef<number | null>(null);

	// Update document title
	useDocumentTitle({
		timeLeft,
		mode,
		taskTitle,
	});

	// Play countdown tick sound in last seconds (if enabled and running)
	useEffect(() => {
		const prevTimeLeft = prevTimeLeftRef.current;
		prevTimeLeftRef.current = timeLeft;

		// Only play when running and enabled and we've crossed a second boundary
		if (!isRunning || !tickingEnabled || prevTimeLeft === null) return;

		// Check if we crossed into a new second (timeLeft decreased)
		if (timeLeft < prevTimeLeft && timeLeft >= 1 && timeLeft <= 5) {
			playCountdownTick(timeLeft);
		}
	}, [timeLeft, isRunning, tickingEnabled, playCountdownTick]);
};
