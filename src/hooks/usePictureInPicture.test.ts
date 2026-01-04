import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePictureInPicture } from "./usePictureInPicture";

describe("usePictureInPicture", () => {
	const mockRequestWindow = vi.fn();
	const mockClose = vi.fn();
	const mockAddEventListener = vi.fn();

	beforeEach(() => {
		// Mock documentPictureInPicture API using stubGlobal
		vi.stubGlobal("documentPictureInPicture", {
			requestWindow: mockRequestWindow,
		});

		// Mock styles
		Object.defineProperty(document, "styleSheets", {
			writable: true,
			value: [],
		});
	});

	afterEach(() => {
		vi.resetAllMocks();
		vi.unstubAllGlobals();
	});

	it("should detect support for documentPictureInPicture", () => {
		const { result } = renderHook(() => usePictureInPicture());
		expect(result.current.isSupported).toBe(true);
	});

	it("should return isSupported false when API is missing", () => {
		vi.unstubAllGlobals();
		// @ts-expect-error - strictly deleting for test
		delete window.documentPictureInPicture;

		const { result } = renderHook(() => usePictureInPicture());
		expect(result.current.isSupported).toBe(false);
	});

	it("should request PiP window when requestPip is called", async () => {
		const mockWindow = {
			document: {
				createElement: vi.fn(),
				head: { appendChild: vi.fn() },
				body: {},
				documentElement: { className: "" },
				createTextNode: vi.fn(),
			},
			addEventListener: mockAddEventListener,
			close: mockClose,
		};
		// Return a fake window object
		mockRequestWindow.mockResolvedValue(mockWindow);

		const { result } = renderHook(() => usePictureInPicture());

		await act(async () => {
			await result.current.requestPip({ width: 400, height: 400 });
		});

		expect(mockRequestWindow).toHaveBeenCalledWith({
			width: 400,
			height: 400,
			disallowReturnToOpener: undefined,
		});
		expect(result.current.isActive).toBe(true);
		expect(result.current.window).toBe(mockWindow);
	});

	it("should close PiP window when closePip is called", async () => {
		const mockWindow = {
			document: {
				createElement: vi.fn(),
				head: { appendChild: vi.fn() },
				body: {},
				documentElement: { className: "" },
				createTextNode: vi.fn(),
			},
			addEventListener: mockAddEventListener,
			close: mockClose,
		};
		mockRequestWindow.mockResolvedValue(mockWindow);

		const { result } = renderHook(() => usePictureInPicture());

		// Open it first
		await act(async () => {
			await result.current.requestPip();
		});

		// Then close it
		act(() => {
			result.current.closePip();
		});

		expect(mockClose).toHaveBeenCalled();
		expect(result.current.isActive).toBe(false);
		expect(result.current.window).toBe(null);
	});

	it("should handle auto-close event from window", async () => {
		const handlers: (() => void)[] = [];

		mockAddEventListener.mockImplementation((event, handler) => {
			if (event === "pagehide") {
				handlers.push(handler);
			}
		});

		const mockWindow = {
			document: {
				createElement: vi.fn(),

				head: { appendChild: vi.fn() },

				body: {},

				documentElement: { className: "" },

				createTextNode: vi.fn(),
			},

			addEventListener: mockAddEventListener,

			close: mockClose,
		};

		mockRequestWindow.mockResolvedValue(mockWindow);

		const { result } = renderHook(() => usePictureInPicture());

		await act(async () => {
			await result.current.requestPip();
		});

		expect(result.current.isActive).toBe(true);

		// Simulate user closing the window

		expect(handlers.length).toBeGreaterThan(0);

		act(() => {
			handlers.forEach((h) => {
				h();
			});
		});

		await waitFor(() => {
			expect(result.current.isActive).toBe(false);

			expect(result.current.window).toBe(null);
		});
	});
});
