import { useLiveQuery } from "dexie-react-hooks";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { db } from "@/db/db";
import {
	DEFAULT_SETTINGS,
	getSettings,
	resetSettings as resetSettingsService,
	updateSettings as updateSettingsService,
} from "@/features/settings/services/settingsService";
import type { Settings } from "@/types";

interface SettingsContextValue {
	settings: Settings;
	updateSettings: (updates: Partial<Omit<Settings, "id">>) => Promise<void>;
	resetSettings: () => Promise<void>;
	isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize settings on first load
	useEffect(() => {
		getSettings().then(() => setIsInitialized(true));
	}, []);

	// Use live query for reactive updates
	const liveSettings = useLiveQuery(() => db.settings.get("default"), []);

	// Deep merge with defaults to ensure all fields exist (handles schema upgrades)
	const settings: Settings = liveSettings
		? {
				id: DEFAULT_SETTINGS.id,
				timer: { ...DEFAULT_SETTINGS.timer, ...liveSettings.timer },
				task: { ...DEFAULT_SETTINGS.task, ...liveSettings.task },
				sound: {
					...DEFAULT_SETTINGS.sound,
					...liveSettings.sound,
					ambientMix: {
						...DEFAULT_SETTINGS.sound.ambientMix,
						...liveSettings.sound?.ambientMix,
					},
				},
				theme: { ...DEFAULT_SETTINGS.theme, ...liveSettings.theme },
				notification: {
					...DEFAULT_SETTINGS.notification,
					...liveSettings.notification,
				},
				integration: {
					...DEFAULT_SETTINGS.integration,
					...liveSettings.integration,
				},
				state: { ...DEFAULT_SETTINGS.state, ...liveSettings.state },
			}
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
};

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
