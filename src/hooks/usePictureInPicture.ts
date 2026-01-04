import { useCallback, useEffect, useState } from "react";

interface PictureInPictureOptions {
	width?: number;
	height?: number;
	disallowReturnToOpener?: boolean;
}

interface UsePictureInPictureReturn {
	isSupported: boolean;
	isActive: boolean;
	window: Window | null;
	requestPip: (options?: PictureInPictureOptions) => Promise<void>;
	closePip: () => void;
}

export const usePictureInPicture = (): UsePictureInPictureReturn => {
	const [isActive, setIsActive] = useState(false);
	const [pipWindow, setPipWindow] = useState<Window | null>(null);

	// Check if the API is supported
	const isSupported =
		typeof window !== "undefined" && "documentPictureInPicture" in window;

	const closePip = useCallback(() => {
		if (pipWindow) {
			pipWindow.close();
			setPipWindow(null);
			setIsActive(false);
		}
	}, [pipWindow]);

	const requestPip = useCallback(
		async (options: PictureInPictureOptions = {}) => {
			if (!isSupported) {
				console.warn("Document Picture-in-Picture API is not supported.");
				return;
			}

			// If already active, don't open another one
			if (isActive) {
				return;
			}

			try {
				// @ts-expect-error - documentPictureInPicture is not yet in standard types
				const win = await window.documentPictureInPicture.requestWindow({
					width: options.width ?? 300,
					height: options.height ?? 300,
					disallowReturnToOpener: options.disallowReturnToOpener,
				});

				setPipWindow(win);
				setIsActive(true);

				// Handle user closing the PiP window via the "X" button
				win.addEventListener("pagehide", () => {
					setPipWindow(null);
					setIsActive(false);
				});

				// Copy styles from main window to PiP window
				// This is crucial for Tailwind/CSS to work in the new window
				[...document.styleSheets].forEach((styleSheet) => {
					try {
						if (styleSheet.href) {
							const link = win.document.createElement("link");
							link.rel = "stylesheet";
							link.type = "text/css";
							link.href = styleSheet.href;
							win.document.head.appendChild(link);
						} else if (styleSheet.cssRules) {
							const style = win.document.createElement("style");
							[...styleSheet.cssRules].forEach((rule) => {
								style.appendChild(win.document.createTextNode(rule.cssText));
							});
							win.document.head.appendChild(style);
						}
					} catch (e) {
						console.error("Error copying stylesheet to PiP window:", e);
					}
				});

				// Sync document classes (for themes)
				win.document.documentElement.className =
					document.documentElement.className;
				const observer = new MutationObserver((mutations) => {
					for (const mutation of mutations) {
						if (
							mutation.type === "attributes" &&
							mutation.attributeName === "class"
						) {
							win.document.documentElement.className =
								document.documentElement.className;
						}
					}
				});
				observer.observe(document.documentElement, {
					attributes: true,
					attributeFilter: ["class"],
				});

				// Clean up observer when window closes
				win.addEventListener("pagehide", () => {
					observer.disconnect();
				});
			} catch (error) {
				console.error("Failed to open Picture-in-Picture window:", error);
			}
		},
		[isSupported, isActive],
	);

	// Automatically close PiP when the component unmounts
	useEffect(() => {
		return () => {
			if (pipWindow) {
				pipWindow.close();
			}
		};
	}, [pipWindow]);

	return {
		isSupported,
		isActive,
		window: pipWindow,
		requestPip,
		closePip,
	};
};
