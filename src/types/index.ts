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

export type ColorTheme =
	| "default"
	| "red"
	| "blue"
	| "green"
	| "purple"
	| "orange"
	| "cyan"
	| "pink";

export type HourFormat = "12h" | "24h";

export interface TimerSettings {
	pomodoro: number; // minutes, default 25
	shortBreak: number; // minutes, default 5
	longBreak: number; // minutes, default 15
	autoStartBreaks: boolean;
	autoStartPomodoros: boolean;
	longBreakInterval: number; // default 4
}

export interface TaskSettings {
	autoCheckTasks: boolean; // auto-mark done when pomos complete
	checkToBottom: boolean; // move completed to bottom
}

export interface SoundSettings {
	alarmVolume: number; // 0-100
	alarmRepeat: number; // times to repeat, default 1
	tickingVolume: number; // 0-100
	tickingEnabled: boolean;
	// Ambient sound mix
	ambientMix: {
		rain: number; // 0-100
		fire: number; // 0-100
		coffee: number; // 0-100
	};
}

export interface ThemeSettings {
	colorTheme: ColorTheme;
	hourFormat: HourFormat;
	darkModeWhenRunning: boolean;
	compactMode: boolean;
}

export interface NotificationSettings {
	reminderMinutes: number; // 0 = disabled
	browserNotifications: boolean;
}

export interface IntegrationSettings {
	webhookUrl: string;
	webhookEnabled: boolean;
}

export interface Settings {
	id: string; // always 'default' for single-row storage
	timer: TimerSettings;
	task: TaskSettings;
	sound: SoundSettings;
	theme: ThemeSettings;
	notification: NotificationSettings;
	integration: IntegrationSettings;
}
