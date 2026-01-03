import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/db";
import {
	createSession,
	deleteSession,
	getCompletedFocusCount,
	getSessionById,
	getSessions,
	getSessionsByDateRange,
	getSessionsByMode,
	getSessionsByTaskId,
	getTodaySessions,
	getTotalFocusTime,
} from "./sessionService";

describe("sessionService", () => {
	beforeEach(async () => {
		await db.sessions.clear();
	});

	describe("createSession", () => {
		it("creates a session with auto-generated id", async () => {
			const id = await createSession({
				taskId: "task-1",
				startTime: 1000000,
				endTime: 1001500,
				duration: 1500,
				mode: "focus",
			});

			expect(id).toBe("test-uuid-0001");

			const session = await db.sessions.get(id);
			expect(session).toBeDefined();
			expect(session?.taskId).toBe("task-1");
			expect(session?.duration).toBe(1500);
			expect(session?.mode).toBe("focus");
		});

		it("creates sessions with different modes", async () => {
			const focusId = await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2500,
				duration: 1500,
				mode: "focus",
			});

			const shortBreakId = await createSession({
				taskId: "task-1",
				startTime: 3000,
				endTime: 3300,
				duration: 300,
				mode: "short-break",
			});

			const longBreakId = await createSession({
				taskId: "task-1",
				startTime: 4000,
				endTime: 4900,
				duration: 900,
				mode: "long-break",
			});

			const focus = await db.sessions.get(focusId);
			const shortBreak = await db.sessions.get(shortBreakId);
			const longBreak = await db.sessions.get(longBreakId);

			expect(focus?.mode).toBe("focus");
			expect(shortBreak?.mode).toBe("short-break");
			expect(longBreak?.mode).toBe("long-break");
		});
	});

	describe("getSessions", () => {
		it("returns empty array when no sessions exist", async () => {
			const sessions = await getSessions();
			expect(sessions).toEqual([]);
		});

		it("returns sessions ordered by startTime (newest first)", async () => {
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2000,
				duration: 1000,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 3000,
				endTime: 4000,
				duration: 1000,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 2000,
				endTime: 3000,
				duration: 1000,
				mode: "focus",
			});

			const sessions = await getSessions();
			expect(sessions).toHaveLength(3);
			expect(sessions[0].startTime).toBe(3000);
			expect(sessions[1].startTime).toBe(2000);
			expect(sessions[2].startTime).toBe(1000);
		});
	});

	describe("getSessionById", () => {
		it("returns undefined for non-existent session", async () => {
			const session = await getSessionById("non-existent-id");
			expect(session).toBeUndefined();
		});

		it("returns the correct session", async () => {
			const id = await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2500,
				duration: 1500,
				mode: "focus",
			});

			const session = await getSessionById(id);
			expect(session).toBeDefined();
			expect(session?.taskId).toBe("task-1");
		});
	});

	describe("getSessionsByTaskId", () => {
		beforeEach(async () => {
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2000,
				duration: 1000,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 3000,
				endTime: 4000,
				duration: 1000,
				mode: "focus",
			});
			await createSession({
				taskId: "task-2",
				startTime: 5000,
				endTime: 6000,
				duration: 1000,
				mode: "focus",
			});
		});

		it("returns sessions for specific task", async () => {
			const sessions = await getSessionsByTaskId("task-1");
			expect(sessions).toHaveLength(2);
			expect(sessions.every((s) => s.taskId === "task-1")).toBe(true);
		});

		it("returns empty array for task with no sessions", async () => {
			const sessions = await getSessionsByTaskId("task-3");
			expect(sessions).toEqual([]);
		});
	});

	describe("getSessionsByDateRange", () => {
		beforeEach(async () => {
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2000,
				duration: 1000,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 5000,
				endTime: 6000,
				duration: 1000,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 10000,
				endTime: 11000,
				duration: 1000,
				mode: "focus",
			});
		});

		it("returns sessions within date range (inclusive)", async () => {
			const sessions = await getSessionsByDateRange(1000, 6000);
			expect(sessions).toHaveLength(2);
		});

		it("returns empty array when no sessions in range", async () => {
			const sessions = await getSessionsByDateRange(20000, 30000);
			expect(sessions).toEqual([]);
		});

		it("includes boundary sessions", async () => {
			const sessions = await getSessionsByDateRange(1000, 1000);
			expect(sessions).toHaveLength(1);
			expect(sessions[0].startTime).toBe(1000);
		});
	});

	describe("getSessionsByMode", () => {
		beforeEach(async () => {
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2500,
				duration: 1500,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 3000,
				endTime: 4500,
				duration: 1500,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 5000,
				endTime: 5300,
				duration: 300,
				mode: "short-break",
			});
			await createSession({
				taskId: "task-1",
				startTime: 6000,
				endTime: 6900,
				duration: 900,
				mode: "long-break",
			});
		});

		it("returns focus sessions", async () => {
			const sessions = await getSessionsByMode("focus");
			expect(sessions).toHaveLength(2);
			expect(sessions.every((s) => s.mode === "focus")).toBe(true);
		});

		it("returns short-break sessions", async () => {
			const sessions = await getSessionsByMode("short-break");
			expect(sessions).toHaveLength(1);
		});

		it("returns long-break sessions", async () => {
			const sessions = await getSessionsByMode("long-break");
			expect(sessions).toHaveLength(1);
		});
	});

	describe("deleteSession", () => {
		it("deletes an existing session", async () => {
			const id = await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2000,
				duration: 1000,
				mode: "focus",
			});

			await deleteSession(id);
			const session = await getSessionById(id);
			expect(session).toBeUndefined();
		});

		it("does not throw for non-existent session", async () => {
			await expect(deleteSession("non-existent-id")).resolves.not.toThrow();
		});
	});

	describe("getTodaySessions", () => {
		it("returns sessions from today", async () => {
			const now = new Date();
			const startOfToday = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			);

			// Session from today (middle of day)
			const todaySession = {
				taskId: "task-1",
				startTime: startOfToday.getTime() + 12 * 60 * 60 * 1000, // Noon today
				endTime: startOfToday.getTime() + 12 * 60 * 60 * 1000 + 1500000,
				duration: 1500,
				mode: "focus" as const,
			};

			await createSession(todaySession);

			// Session from yesterday
			const yesterdayStart = new Date(startOfToday);
			yesterdayStart.setDate(yesterdayStart.getDate() - 1);

			await createSession({
				taskId: "task-1",
				startTime: yesterdayStart.getTime() + 12 * 60 * 60 * 1000,
				endTime: yesterdayStart.getTime() + 12 * 60 * 60 * 1000 + 1500000,
				duration: 1500,
				mode: "focus",
			});

			const sessions = await getTodaySessions();
			expect(sessions.length).toBeGreaterThanOrEqual(1);
			// All returned sessions should be from today
			for (const session of sessions) {
				const sessionDate = new Date(session.startTime);
				expect(sessionDate.getDate()).toBe(now.getDate());
				expect(sessionDate.getMonth()).toBe(now.getMonth());
				expect(sessionDate.getFullYear()).toBe(now.getFullYear());
			}
		});
	});

	describe("getTotalFocusTime", () => {
		beforeEach(async () => {
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2500,
				duration: 1500,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 3000,
				endTime: 4500,
				duration: 1500,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 5000,
				endTime: 5300,
				duration: 300,
				mode: "short-break",
			});
		});

		it("returns total focus time for all sessions", async () => {
			const total = await getTotalFocusTime();
			expect(total).toBe(3000); // 1500 + 1500
		});

		it("returns total focus time for date range", async () => {
			const total = await getTotalFocusTime(1000, 2500);
			expect(total).toBe(1500);
		});

		it("returns 0 when no focus sessions", async () => {
			await db.sessions.clear();
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 1300,
				duration: 300,
				mode: "short-break",
			});

			const total = await getTotalFocusTime();
			expect(total).toBe(0);
		});
	});

	describe("getCompletedFocusCount", () => {
		beforeEach(async () => {
			await createSession({
				taskId: "task-1",
				startTime: 1000,
				endTime: 2500,
				duration: 1500,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 3000,
				endTime: 4500,
				duration: 1500,
				mode: "focus",
			});
			await createSession({
				taskId: "task-1",
				startTime: 5000,
				endTime: 5300,
				duration: 300,
				mode: "short-break",
			});
		});

		it("returns count of focus sessions for all time", async () => {
			const count = await getCompletedFocusCount();
			expect(count).toBe(2);
		});

		it("returns count of focus sessions for date range", async () => {
			const count = await getCompletedFocusCount(1000, 2500);
			expect(count).toBe(1);
		});

		it("returns 0 when no focus sessions", async () => {
			await db.sessions.clear();
			const count = await getCompletedFocusCount();
			expect(count).toBe(0);
		});
	});
});
