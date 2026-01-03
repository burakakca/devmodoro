import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./useReducedMotion";

describe("useReducedMotion", () => {
	let mediaQueryMock: {
		matches: boolean;
		addEventListener: ReturnType<typeof vi.fn>;
		removeEventListener: ReturnType<typeof vi.fn>;
	};

	let originalMatchMedia: typeof window.matchMedia;

	beforeEach(() => {
		mediaQueryMock = {
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};

		// Save original and define mock
		originalMatchMedia = window.matchMedia;
		window.matchMedia = vi.fn(
			() => mediaQueryMock as unknown as MediaQueryList,
		);
	});

	afterEach(() => {
		// Restore original
		window.matchMedia = originalMatchMedia;
		vi.restoreAllMocks();
	});

	it("returns false by default", () => {
		const { result } = renderHook(() => useReducedMotion());
		expect(result.current).toBe(false);
	});

	it("returns true when prefers-reduced-motion matches", () => {
		mediaQueryMock.matches = true;

		const { result } = renderHook(() => useReducedMotion());
		expect(result.current).toBe(true);
	});

	it("queries the correct media query", () => {
		renderHook(() => useReducedMotion());

		expect(window.matchMedia).toHaveBeenCalledWith(
			"(prefers-reduced-motion: reduce)",
		);
	});

	it("adds event listener for changes", () => {
		renderHook(() => useReducedMotion());

		expect(mediaQueryMock.addEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);
	});

	it("removes event listener on unmount", () => {
		const { unmount } = renderHook(() => useReducedMotion());
		unmount();

		expect(mediaQueryMock.removeEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);
	});

	it("updates when media query changes", () => {
		const { result } = renderHook(() => useReducedMotion());

		expect(result.current).toBe(false);

		// Get the listener that was registered
		const listener = mediaQueryMock.addEventListener.mock.calls[0][1];

		// Simulate media query change
		act(() => {
			listener({ matches: true } as MediaQueryListEvent);
		});

		expect(result.current).toBe(true);
	});

	it("correctly toggles between states", () => {
		const { result } = renderHook(() => useReducedMotion());
		const listener = mediaQueryMock.addEventListener.mock.calls[0][1];

		// Initially false
		expect(result.current).toBe(false);

		// Change to true
		act(() => {
			listener({ matches: true } as MediaQueryListEvent);
		});
		expect(result.current).toBe(true);

		// Change back to false
		act(() => {
			listener({ matches: false } as MediaQueryListEvent);
		});
		expect(result.current).toBe(false);
	});
});
