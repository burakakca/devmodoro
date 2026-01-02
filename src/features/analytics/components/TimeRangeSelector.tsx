import { memo } from "react";
import { TabButton } from "@/components/ui/TabButton";
import type { TimeRange } from "../services/analyticsService";

const RANGES: { value: TimeRange; label: string }[] = [
	{ value: "today", label: "Today" },
	{ value: "week", label: "This Week" },
	{ value: "month", label: "This Month" },
	{ value: "all", label: "All Time" },
];

interface TimeRangeSelectorProps {
	value: TimeRange;
	onChange: (range: TimeRange) => void;
}

export const TimeRangeSelector = memo(
	({ value, onChange }: TimeRangeSelectorProps) => {
		return (
			<div
				className="flex gap-2 flex-wrap"
				role="tablist"
				aria-label="Time range"
			>
				{RANGES.map((range) => (
					<TabButton
						key={range.value}
						isSelected={value === range.value}
						onClick={() => onChange(range.value)}
						fullWidth={false}
					>
						{range.label}
					</TabButton>
				))}
			</div>
		);
	},
);
