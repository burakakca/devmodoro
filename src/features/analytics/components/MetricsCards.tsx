import { Calendar, Clock, Flame, Hash, Target, TrendingUp } from "lucide-react";
import { memo } from "react";
import type { ProductivityInsights } from "../services/analyticsService";
import { formatDuration, formatHour } from "../utils/formatters";
import { MetricCard } from "./MetricCard";

interface MetricsCardsProps {
	totalFocusTime: number;
	totalSessions: number;
	averageSessionLength: number;
	currentStreak: number;
	mostProductiveDay: ProductivityInsights["mostProductiveDay"];
	mostProductiveHour: ProductivityInsights["mostProductiveHour"];
}

export const MetricsCards = memo(
	({
		totalFocusTime,
		totalSessions,
		averageSessionLength,
		currentStreak,
		mostProductiveDay,
		mostProductiveHour,
	}: MetricsCardsProps) => {
		return (
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				<MetricCard
					icon={Clock}
					label="Total Focus Time"
					value={formatDuration(totalFocusTime)}
					delay={0}
				/>
				<MetricCard
					icon={Hash}
					label="Sessions Completed"
					value={totalSessions}
					delay={0.05}
				/>
				<MetricCard
					icon={Target}
					label="Avg Session Length"
					value={formatDuration(averageSessionLength)}
					delay={0.1}
				/>
				<MetricCard
					icon={Flame}
					label="Current Streak"
					value={`${currentStreak} day${currentStreak !== 1 ? "s" : ""}`}
					delay={0.15}
				/>
				<MetricCard
					icon={Calendar}
					label="Most Productive Day"
					value={mostProductiveDay?.day ?? "-"}
					subValue={
						mostProductiveDay
							? `${mostProductiveDay.minutes}m total`
							: undefined
					}
					delay={0.2}
				/>
				<MetricCard
					icon={TrendingUp}
					label="Peak Hour"
					value={mostProductiveHour ? formatHour(mostProductiveHour.hour) : "-"}
					subValue={
						mostProductiveHour
							? `${mostProductiveHour.minutes}m total`
							: undefined
					}
					delay={0.25}
				/>
			</div>
		);
	},
);
