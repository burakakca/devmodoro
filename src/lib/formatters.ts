/**
 * Shared formatting utilities for duration and time.
 * Provides consistent formatting across the application.
 */

/**
 * Format seconds into human-readable duration for analytics display.
 * Shows hours and minutes only (e.g., "2h 30m", "45m").
 * Best for aggregate/summary views where seconds are not meaningful.
 */
export const formatDurationLong = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
};

/**
 * Format seconds into precise duration with seconds.
 * Shows minutes and seconds (e.g., "5m 30s", "45s").
 * Best for session logs and precise timing.
 */
export const formatDurationPrecise = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (minutes === 0) {
		return `${remainingSeconds}s`;
	}
	if (remainingSeconds === 0) {
		return `${minutes}m`;
	}
	return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Format hour number into 12-hour or 24-hour format.
 */
export const formatHour = (
	hour: number,
	format: "12h" | "24h" = "12h",
): string => {
	if (format === "24h") {
		return `${hour.toString().padStart(2, "0")}:00`;
	}
	const period = hour >= 12 ? "PM" : "AM";
	const displayHour = hour % 12 || 12;
	return `${displayHour}${period}`;
};

/**
 * Format timestamp into relative date (e.g., "Today", "Yesterday", "3 days ago").
 * Uses calendar day boundaries for accurate detection.
 */
export const formatRelativeDate = (timestamp: number): string => {
	const sessionDate = new Date(timestamp);
	const today = new Date();

	// Reset to start of day for proper calendar day comparison
	const sessionDay = new Date(
		sessionDate.getFullYear(),
		sessionDate.getMonth(),
		sessionDate.getDate(),
	);
	const todayDay = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	const diffTime = todayDay.getTime() - sessionDay.getTime();
	const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;

	return sessionDate.toLocaleDateString();
};

/**
 * Format timestamp into time string (e.g., "2:30 PM").
 */
export const formatTime = (timestamp: number): string => {
	return new Date(timestamp).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
};
