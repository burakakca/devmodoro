/**
 * Format seconds into human-readable duration (e.g., "2h 30m")
 */
export const formatDuration = (seconds: number): string => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
};

/**
 * Format hour number into 12-hour or 24-hour format
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
 * Format timestamp into relative date (e.g., "Today", "Yesterday", "3 days ago")
 */
export const formatRelativeDate = (timestamp: number): string => {
	const now = Date.now();
	const diff = now - timestamp;
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (days === 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 7) return `${days} days ago`;

	return new Date(timestamp).toLocaleDateString();
};

/**
 * Format timestamp into time string (e.g., "2:30 PM")
 */
export const formatTime = (timestamp: number): string => {
	return new Date(timestamp).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
	});
};
