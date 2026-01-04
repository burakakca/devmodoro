import { useEffect, useRef } from "react";
import { useAudio } from "@/features/audio/context/AudioContext";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { TimerMode } from "../machines/timerMachine";

interface UseTimerNotificationsProps {
	timeLeft: number;
	mode: TimerMode;
	taskTitle?: string;
	isRunning: boolean;
	isCompleted: boolean;
	tickingEnabled: boolean;
}

export const useTimerNotifications = ({
	timeLeft,
	mode,
	taskTitle,
	isRunning,
	isCompleted,
	tickingEnabled,
}: UseTimerNotificationsProps) => {
	const { playCountdownTick } = useAudio();
	const { settings } = useSettings();
	const prevTimeLeftRef = useRef<number | null>(null);

	// Update document title
	useDocumentTitle({
		timeLeft,
		mode,
		taskTitle,
	});

	// Trigger browser notification on completion
	useEffect(() => {
		if (
			isCompleted &&
			settings.notification.browserNotifications &&
			"Notification" in window &&
			Notification.permission === "granted"
		) {
			const title =
				mode === "focus"
					? "Focus Session Complete!"
					: mode === "shortBreak"
						? "Short Break Over!"
						: "Long Break Over!";
			const body =
				mode === "focus"
					? "Great job! Time for a break."
					: "Time to get back to work!";

			try {
				const n = new Notification("Devmodoro", {
					body: `${title} ${body}`,
					icon: "/favicon.ico",
					silent: false,
					// @ts-expect-error - requireInteraction is not in all TS definitions
					requireInteraction: true,
				});
				n.onclick = () => {
					window.focus();
					n.close();
				};
			} catch (error) {
				console.error("Failed to show completion notification:", error);
			}
		}
	}, [isCompleted, mode, settings.notification.browserNotifications]);

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
