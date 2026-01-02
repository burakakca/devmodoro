import type { ReactNode } from "react";
import { AudioProvider } from "@/features/audio/context/AudioContext";
import { SettingsProvider } from "@/features/settings/context/SettingsContext";
import { ThemeProvider } from "@/features/settings/context/ThemeContext";
import { TaskProvider } from "@/features/tasks/context/TaskContext";

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<SettingsProvider>
			<AudioProvider>
				<ThemeProvider>
					<TaskProvider>{children}</TaskProvider>
				</ThemeProvider>
			</AudioProvider>
		</SettingsProvider>
	);
}
