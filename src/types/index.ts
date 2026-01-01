export type TaskStatus = "todo" | "in-progress" | "done";
export type SessionMode = "focus" | "short-break" | "long-break";

export interface Task {
	id: string;
	title: string;
	projectId?: string;
	estimatedPomos: number;
	completedPomos: number;
	externalLink?: string; // e.g., GitHub Issue URL
	status: TaskStatus;
	createdAt: number;
}

export interface Session {
	id: string;
	taskId: string;
	startTime: number; // Timestamp
	endTime: number;
	duration: number; // Seconds
	mode: SessionMode;
}

export interface Settings {
	timers: {
		focus: number;
		short: number;
		long: number;
	};
	sound: {
		volume: number;
		mix: {
			rain: number;
			fire: number;
			coffee: number;
		};
	};
	theme: "dark" | "light" | "cyberpunk";
}
