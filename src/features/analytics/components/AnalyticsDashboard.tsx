import { useMemo } from "react";
import { useAnalytics } from "../hooks/useAnalytics";
import type { TimeRange } from "../services/analyticsService";
import { DailyActivityChart } from "./DailyActivityChart";
import { ExportButton } from "./ExportButton";
import { MetricsCards } from "./MetricsCards";
import { SessionHistory } from "./SessionHistory";
import { TimeRangeSelector } from "./TimeRangeSelector";

const CHART_TITLES: Record<TimeRange, string> = {
	today: "Hourly Activity",
	week: "Daily Activity",
	month: "Daily Activity",
	all: "Weekly Activity",
};

export const AnalyticsDashboard = () => {
	const {
		timeRange,
		setTimeRange,
		totalFocusTime,
		totalSessions,
		averageSessionLength,
		streak,
		activityData,
		insights,
		isLoading,
	} = useAnalytics();

	const chartTitle = useMemo(() => CHART_TITLES[timeRange], [timeRange]);

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{Array.from({ length: 6 }, (_, i) => i).map((i) => (
						<div
							key={`metric-skeleton-${timeRange}-${i}`}
							className="h-24 bg-theme-bg-secondary rounded-xl animate-pulse"
						/>
					))}
				</div>
				<div className="h-64 bg-theme-bg-secondary rounded-xl animate-pulse" />
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header Controls */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<TimeRangeSelector value={timeRange} onChange={setTimeRange} />
				<ExportButton />
			</div>

			{/* Metrics */}
			<section aria-labelledby="metrics-heading">
				<h2 id="metrics-heading" className="sr-only">
					Productivity Metrics
				</h2>
				<MetricsCards
					totalFocusTime={totalFocusTime}
					totalSessions={totalSessions}
					averageSessionLength={averageSessionLength}
					currentStreak={streak}
					mostProductiveDay={insights.mostProductiveDay}
					mostProductiveHour={insights.mostProductiveHour}
				/>
			</section>

			{/* Activity Chart */}
			<section
				className="bg-theme-bg-secondary rounded-2xl p-6"
				aria-labelledby="activity-heading"
			>
				<h2
					id="activity-heading"
					className="text-lg font-semibold text-theme-text mb-4"
				>
					{chartTitle}
				</h2>
				<DailyActivityChart data={activityData} />
			</section>

			{/* Session History */}
			<section
				className="bg-theme-bg-secondary rounded-2xl p-6"
				aria-labelledby="history-heading"
			>
				<h2
					id="history-heading"
					className="text-lg font-semibold text-theme-text mb-4"
				>
					Session History
				</h2>
				<SessionHistory />
			</section>
		</div>
	);
};
