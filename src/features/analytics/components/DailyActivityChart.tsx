import { memo } from "react";
import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ActivityData } from "../services/analyticsTypes";

interface ActivityChartProps {
	data: ActivityData[];
}

export const DailyActivityChart = memo(({ data }: ActivityChartProps) => {
	const reducedMotion = useReducedMotion();

	if (data.length === 0) {
		return (
			<div className="h-64 flex items-center justify-center text-theme-text-muted">
				No activity data available
			</div>
		);
	}

	return (
		<div className="h-64 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
				>
					<XAxis
						dataKey="label"
						stroke="var(--color-theme-text-secondary)"
						fontSize={12}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						stroke="var(--color-theme-text-secondary)"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => `${value}m`}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "var(--color-theme-bg-secondary)",
							border: "1px solid var(--color-theme-border)",
							borderRadius: "0.5rem",
							padding: "8px 12px",
						}}
						labelStyle={{ color: "var(--color-theme-text)", marginBottom: 4 }}
						itemStyle={{ color: "var(--color-theme-text)" }}
						formatter={(value) => [`${value} min`, "Focus Time"]}
						cursor={{ fill: "var(--color-theme-bg-tertiary)", opacity: 0.5 }}
					/>
					<Bar
						dataKey="focusMinutes"
						fill="var(--color-primary)"
						radius={[4, 4, 0, 0]}
						animationDuration={reducedMotion ? 0 : 500}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
});
