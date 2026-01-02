import { memo, useState } from "react";
import { useSessionHistory } from "../hooks/useAnalytics";
import { SessionHistoryItem } from "./SessionHistoryItem";

const MODES = [
	{ value: "all", label: "All" },
	{ value: "focus", label: "Focus" },
	{ value: "short-break", label: "Short Break" },
	{ value: "long-break", label: "Long Break" },
];

export const SessionHistory = memo(() => {
	const [modeFilter, setModeFilter] = useState("all");
	const { sessions, isLoading } = useSessionHistory(modeFilter);

	if (isLoading) {
		return (
			<div className="space-y-2">
				{Array.from({ length: 5 }, (_, i) => i).map((i) => (
					<div
						key={`skeleton-${modeFilter}-${i}`}
						className="h-16 bg-theme-bg-tertiary rounded-lg animate-pulse"
					/>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filter */}
			<div className="flex gap-2 flex-wrap">
				{MODES.map((mode) => (
					<button
						key={mode.value}
						type="button"
						onClick={() => setModeFilter(mode.value)}
						className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
							modeFilter === mode.value
								? "bg-primary text-primary-foreground"
								: "bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text"
						}`}
					>
						{mode.label}
					</button>
				))}
			</div>

			{/* List */}
			{sessions.length === 0 ? (
				<div className="py-8 text-center text-theme-text-muted">
					No sessions found
				</div>
			) : (
				<div className="space-y-1">
					{sessions.map((session) => (
						<SessionHistoryItem key={session.id} session={session} />
					))}
				</div>
			)}
		</div>
	);
});
