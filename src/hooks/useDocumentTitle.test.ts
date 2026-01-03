import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDocumentTitle } from "./useDocumentTitle";

describe("useDocumentTitle", () => {
	const originalTitle = document.title;

	beforeEach(() => {
		document.title = "Initial Title";
	});

	afterEach(() => {
		document.title = originalTitle;
	});

	it("sets document title with time and focus mode", () => {
		renderHook(() =>
			useDocumentTitle({
				timeLeft: 1500,
				mode: "focus",
			}),
		);

		expect(document.title).toBe("25:00 - Focus");
	});

	it("sets document title with shortBreak mode", () => {
		renderHook(() =>
			useDocumentTitle({
				timeLeft: 300,
				mode: "shortBreak",
			}),
		);

		expect(document.title).toBe("05:00 - Short Break");
	});

	it("sets document title with longBreak mode", () => {
		renderHook(() =>
			useDocumentTitle({
				timeLeft: 900,
				mode: "longBreak",
			}),
		);

		expect(document.title).toBe("15:00 - Long Break");
	});

	it("includes task title when provided", () => {
		renderHook(() =>
			useDocumentTitle({
				timeLeft: 1500,
				mode: "focus",
				taskTitle: "My Task",
			}),
		);

		expect(document.title).toBe("25:00 - Focus | My Task");
	});

	it("updates title when timeLeft changes", () => {
		const { rerender } = renderHook(
			({ timeLeft, mode }) => useDocumentTitle({ timeLeft, mode }),
			{
				initialProps: { timeLeft: 1500, mode: "focus" as const },
			},
		);

		expect(document.title).toBe("25:00 - Focus");

		rerender({ timeLeft: 1499, mode: "focus" as const });
		expect(document.title).toBe("24:59 - Focus");
	});

	it("updates title when mode changes", () => {
		const { rerender } = renderHook(
			({ timeLeft, mode }) => useDocumentTitle({ timeLeft, mode }),
			{
				initialProps: { timeLeft: 300, mode: "focus" as const },
			},
		);

		expect(document.title).toBe("05:00 - Focus");

		rerender({ timeLeft: 300, mode: "shortBreak" as const });
		expect(document.title).toBe("05:00 - Short Break");
	});

	it("restores default title on unmount", () => {
		const { unmount } = renderHook(() =>
			useDocumentTitle({
				timeLeft: 1500,
				mode: "focus",
			}),
		);

		expect(document.title).toBe("25:00 - Focus");

		unmount();
		expect(document.title).toBe("Devmodoro");
	});

	it("formats time with leading zeros", () => {
		renderHook(() =>
			useDocumentTitle({
				timeLeft: 65, // 1:05
				mode: "focus",
			}),
		);

		expect(document.title).toBe("01:05 - Focus");
	});

	it("handles zero time left", () => {
		renderHook(() =>
			useDocumentTitle({
				timeLeft: 0,
				mode: "focus",
			}),
		);

		expect(document.title).toBe("00:00 - Focus");
	});
});
