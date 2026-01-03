import { useEffect, useState } from "react";

/**
 * Hook to check if user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
	// Initialize with false on server/initial render to match hydration
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setMatches(mediaQuery.matches);

		const listener = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		mediaQuery.addEventListener("change", listener);
		return () => mediaQuery.removeEventListener("change", listener);
	}, []);

	return matches;
};
