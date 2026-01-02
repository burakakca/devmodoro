import { memo } from "react";

interface TimerStatsProps {
	completedPomos: number;
	longBreakInterval: number;
}

export const TimerStats = memo(
	({ completedPomos, longBreakInterval }: TimerStatsProps) => {
		if (longBreakInterval <= 0) {
			return (
				<div className="mt-8 flex items-center justify-center gap-4 text-theme-text-muted text-sm min-h-[1.5rem]">
					<span className="opacity-70">Focus Mode</span>
				</div>
			);
		}

		const currentPomo = (completedPomos % longBreakInterval) + 1;
		const pomosUntilBreak =
			longBreakInterval - (completedPomos % longBreakInterval);

		return (
			<div className="mt-8 flex items-center justify-center gap-4 text-theme-text-muted text-sm min-h-[1.5rem]">
				<span className="font-medium">
					Pomos: {currentPomo} / {longBreakInterval}
				</span>
				<span className="text-theme-text-muted opacity-70">
					(Long break in {pomosUntilBreak})
				</span>
			</div>
		);
	},
);
