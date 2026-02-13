import { AnimatePresence, m } from "framer-motion";
import { memo } from "react";
import type { TimerMode } from "../machines/timerMachine";

interface CircularProgressProps {
	/** Current time remaining in seconds */
	timeLeft: number;
	/** Total duration in seconds */
	duration: number;
	/** Current timer mode */
	mode: TimerMode;
	/** Whether the timer is running */
	isRunning: boolean;
	/** Whether the timer just completed */
	isCompleted: boolean;
	/** Whether to show compact mode */
	isCompact?: boolean;
	/** Stroke width of the progress ring */
	strokeWidth?: number;
	/** Formatted time string to display */
	displayTime: string;
}

const MODE_THEME_VARS = {
	focus: {
		primary: "var(--color-primary)",
		secondary: "var(--color-primary)",
		glow: "color-mix(in srgb, var(--color-primary), transparent 60%)",
		track: "color-mix(in srgb, var(--color-primary), transparent 85%)",
	},
	shortBreak: {
		primary: "var(--color-theme-text-secondary)",
		secondary: "var(--color-theme-text-muted)",
		glow: "color-mix(in srgb, var(--color-theme-text-secondary), transparent 80%)",
		track:
			"color-mix(in srgb, var(--color-theme-text-secondary), transparent 90%)",
	},
	longBreak: {
		primary: "var(--color-theme-text-secondary)",
		secondary: "var(--color-theme-text-muted)",
		glow: "color-mix(in srgb, var(--color-theme-text-secondary), transparent 80%)",
		track:
			"color-mix(in srgb, var(--color-theme-text-secondary), transparent 90%)",
	},
};

export const CircularProgress = memo(
	({
		timeLeft,
		duration,
		mode,
		isRunning,
		isCompleted,
		isCompact = false,
		strokeWidth = 8,
		displayTime,
	}: CircularProgressProps) => {
		const colors = MODE_THEME_VARS[mode];
		const size = isCompact ? 192 : 280; // pixels for SVG math

		// Calculate SVG dimensions
		const center = size / 2;
		const radius = center - strokeWidth;
		const circumference = 2 * Math.PI * radius;

		// Calculate progress (0 to 1)
		const progress = duration > 0 ? timeLeft / duration : 0;
		const strokeDashoffset = circumference * (1 - progress);

		return (
			<div className={`relative ${isCompact ? "size-48" : "size-72"}`}>
				{/* Glow effect when running */}
				<AnimatePresence>
					{isRunning && (
						<m.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.9 }}
							className="absolute inset-0 rounded-full"
							style={{
								boxShadow: `0 0 60px ${colors.glow}, 0 0 100px ${colors.glow}`,
							}}
						/>
					)}
				</AnimatePresence>

				{/* Pulse effect on completion */}
				<AnimatePresence>
					{isCompleted && (
						<m.div
							initial={{ opacity: 0, scale: 1 }}
							animate={{
								opacity: [0.6, 0],
								scale: [1, 1.3],
							}}
							transition={{
								duration: 0.8,
								repeat: 3,
								repeatType: "loop",
							}}
							className="absolute inset-0 rounded-full"
							style={{
								border: `${strokeWidth}px solid ${colors.primary}`,
							}}
						/>
					)}
				</AnimatePresence>

				<svg
					width="100%"
					height="100%"
					viewBox={`0 0 ${size} ${size}`}
					className="transform -rotate-90"
					role="img"
					aria-label={`Timer progress: ${Math.round(progress * 100)}% remaining`}
				>
					{/* Gradient definition */}
					<defs>
						<linearGradient
							id={`progress-gradient-${mode}`}
							x1="0%"
							y1="0%"
							x2="100%"
							y2="0%"
						>
							<stop offset="0%" stopColor={colors.primary} />
							<stop offset="100%" stopColor={colors.secondary} />
						</linearGradient>
					</defs>

					{/* Background track */}
					<circle
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke={colors.track}
						strokeWidth={strokeWidth}
					/>

					{/* Progress ring */}
					<m.circle
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke={`url(#progress-gradient-${mode})`}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						initial={false}
						animate={{
							strokeDashoffset,
						}}
						transition={{
							duration: 0.5,
							ease: "easeOut",
						}}
					/>

					{/* Tick marks every 5 minutes for visual reference */}
					{duration >= 300 &&
						Array.from({ length: 12 }).map((_, i) => {
							const angle = (i / 12) * 360 - 90;
							const rad = (angle * Math.PI) / 180;
							const innerRadius = radius - strokeWidth / 2 - 4;
							const outerRadius = radius - strokeWidth / 2 - 12;
							const x1 = center + innerRadius * Math.cos(rad);
							const y1 = center + innerRadius * Math.sin(rad);
							const x2 = center + outerRadius * Math.cos(rad);
							const y2 = center + outerRadius * Math.sin(rad);

							return (
								<line
									key={`tick-${angle}`}
									x1={x1}
									y1={y1}
									x2={x2}
									y2={y2}
									stroke="color-mix(in srgb, var(--color-theme-text-muted), transparent 70%)"
									strokeWidth={i % 3 === 0 ? 2 : 1}
								/>
							);
						})}
				</svg>

				{/* Time display in center */}
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<m.span
						key={displayTime}
						initial={false}
						animate={{
							scale: isRunning ? [1, 1.02, 1] : 1,
						}}
						transition={{
							duration: 1,
							repeat: isRunning ? Number.POSITIVE_INFINITY : 0,
							repeatType: "loop",
						}}
						className="text-5xl font-bold font-mono tabular-nums text-theme-text"
						style={{
							textShadow: isRunning ? `0 0 20px ${colors.glow}` : "none",
						}}
					>
						{displayTime}
					</m.span>

					{/* Progress percentage */}
					<span className="text-sm text-theme-text-muted mt-1">
						{Math.round(progress * 100)}% remaining
					</span>
				</div>
			</div>
		);
	},
);
