import { useLiveQuery } from "dexie-react-hooks";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { db } from "../db/db";
import {
	DEFAULT_SETTINGS,
	getSettings,
	resetSettings as resetSettingsService,
	updateSettings as updateSettingsService,
} from "../services/settingsService";
import type { Settings } from "../types";

interface SettingsContextValue {
	settings: Settings;
	updateSettings: (updates: Partial<Omit<Settings, "id">>) => Promise<void>;
	resetSettings: () => Promise<void>;
	isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize settings on first load
	useEffect(() => {
		getSettings().then(() => setIsInitialized(true));
	}, []);

	// Use live query for reactive updates
	const liveSettings = useLiveQuery(() => db.settings.get("default"), []);

	// Merge with defaults to ensure all fields exist
	const settings: Settings = liveSettings
		? { ...DEFAULT_SETTINGS, ...liveSettings }
		: DEFAULT_SETTINGS;

	const updateSettings = useCallback(
		async (updates: Partial<Omit<Settings, "id">>) => {
			await updateSettingsService(updates);
		},
		[],
	);

	const resetSettings = useCallback(async () => {
		await resetSettingsService();
	}, []);

	const isLoading = !isInitialized || liveSettings === undefined;

	return (
		<SettingsContext.Provider
			value={{ settings, updateSettings, resetSettings, isLoading }}
		>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
}
