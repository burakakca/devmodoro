import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";
import { AudioProvider } from "@/features/audio/context/AudioContext";
import { SettingsProvider } from "@/features/settings/context/SettingsContext";
import { ThemeProvider } from "@/features/settings/context/ThemeContext";
import { TaskProvider } from "@/features/tasks/context/TaskContext";

// Dynamically load Framer Motion features
const loadFeatures = () => import("framer-motion").then((res) => res.domMax);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
	},
});

interface AppProvidersProps {
	children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
	return (
		<QueryClientProvider client={queryClient}>
			<LazyMotion features={loadFeatures} strict>
				<SettingsProvider>
					<AudioProvider>
						<ThemeProvider>
							<TaskProvider>{children}</TaskProvider>
						</ThemeProvider>
					</AudioProvider>
				</SettingsProvider>
			</LazyMotion>
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
};
