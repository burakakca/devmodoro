import type { SessionMode } from "@/types";
import type { TimerMode } from "../machines/timerMachine";

/**
 * Convert timer machine mode to session storage mode format.
 * Timer uses camelCase (shortBreak), sessions use kebab-case (short-break).
 */
export const timerModeToSessionMode = (mode: TimerMode): SessionMode => {
	if (mode === "shortBreak") return "short-break";
	if (mode === "longBreak") return "long-break";
	return "focus";
};
