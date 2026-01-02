import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { useTheme } from "@/features/settings/hooks/useTheme";
import { useSettings } from "./SettingsContext";

interface ThemeContextValue {
	isTimerRunning: boolean;
	setTimerRunning: (running: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const { settings } = useSettings();
	const [isTimerRunning, setIsTimerRunning] = useState(false);

	// Apply theme based on settings
	useTheme({
		appTheme: settings.theme.appTheme,
		colorTheme: settings.theme.colorTheme,
		darkModeWhenRunning: settings.theme.darkModeWhenRunning,
		compactMode: settings.theme.compactMode,
		isRunning: isTimerRunning,
	});

	const setTimerRunning = useCallback((running: boolean) => {
		setIsTimerRunning(running);
	}, []);

	return (
		<ThemeContext.Provider value={{ isTimerRunning, setTimerRunning }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useThemeContext = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useThemeContext must be used within a ThemeProvider");
	}
	return context;
};
