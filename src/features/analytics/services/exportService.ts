import type { Session } from "@/types";

export type ExportFormat = "json" | "csv";

interface ExportSession extends Session {
	taskTitle?: string;
}

/**
 * Export sessions data as JSON or CSV file
 */
export const exportSessions = (
	sessions: ExportSession[],
	format: ExportFormat,
	filename: string,
): void => {
	let content: string;
	let mimeType: string;

	if (format === "json") {
		content = JSON.stringify(sessions, null, 2);
		mimeType = "application/json";
	} else {
		// CSV format
		const headers = [
			"id",
			"taskId",
			"taskTitle",
			"mode",
			"startTime",
			"endTime",
			"duration",
		];
		const rows = sessions.map((s) => [
			s.id,
			s.taskId,
			`"${(s.taskTitle ?? "").replace(/"/g, '""')}"`, // Escape quotes in CSV
			s.mode,
			new Date(s.startTime).toISOString(),
			new Date(s.endTime).toISOString(),
			s.duration,
		]);
		content = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		mimeType = "text/csv";
	}

	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${filename}.${format}`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
