import { db } from "../db/db";
import type { Session, SessionMode } from "../types";

export type CreateSessionInput = Omit<Session, "id">;

/**
 * Creates a new session in the database
 */
export async function createSession(
	input: CreateSessionInput,
): Promise<string> {
	const session: Session = {
		...input,
		id: crypto.randomUUID(),
	};

	await db.sessions.add(session);
	return session.id;
}

/**
 * Retrieves all sessions, ordered by start time (newest first)
 */
export async function getSessions(): Promise<Session[]> {
	return db.sessions.orderBy("startTime").reverse().toArray();
}

/**
 * Retrieves a single session by ID
 */
export async function getSessionById(id: string): Promise<Session | undefined> {
	return db.sessions.get(id);
}

/**
 * Retrieves all sessions for a specific task
 */
export async function getSessionsByTaskId(taskId: string): Promise<Session[]> {
	return db.sessions.where("taskId").equals(taskId).toArray();
}

/**
 * Retrieves sessions within a date range
 */
export async function getSessionsByDateRange(
	startTime: number,
	endTime: number,
): Promise<Session[]> {
	return db.sessions
		.where("startTime")
		.between(startTime, endTime, true, true)
		.toArray();
}

/**
 * Retrieves sessions by mode (focus, short-break, long-break)
 */
export async function getSessionsByMode(mode: SessionMode): Promise<Session[]> {
	return db.sessions.where("mode").equals(mode).toArray();
}

/**
 * Deletes a session by ID
 */
export async function deleteSession(id: string): Promise<void> {
	await db.sessions.delete(id);
}

/**
 * Gets today's sessions
 */
export async function getTodaySessions(): Promise<Session[]> {
	const now = new Date();
	const startOfDay = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	).getTime();
	const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

	return getSessionsByDateRange(startOfDay, endOfDay);
}

/**
 * Gets total focus time in seconds for a given date range
 */
export async function getTotalFocusTime(
	startTime?: number,
	endTime?: number,
): Promise<number> {
	let sessions: Session[];

	if (startTime !== undefined && endTime !== undefined) {
		sessions = await getSessionsByDateRange(startTime, endTime);
	} else {
		sessions = await getSessions();
	}

	return sessions
		.filter((s) => s.mode === "focus")
		.reduce((total, s) => total + s.duration, 0);
}

/**
 * Gets count of completed focus sessions
 */
export async function getCompletedFocusCount(
	startTime?: number,
	endTime?: number,
): Promise<number> {
	let sessions: Session[];

	if (startTime !== undefined && endTime !== undefined) {
		sessions = await getSessionsByDateRange(startTime, endTime);
	} else {
		sessions = await getSessions();
	}

	return sessions.filter((s) => s.mode === "focus").length;
}
