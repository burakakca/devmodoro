import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { memo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MetricCardProps {
	label: string;
	value: string | number;
	subValue?: string;
	icon: LucideIcon;
	delay?: number;
}

export const MetricCard = memo(
	({ label, value, subValue, icon: Icon, delay = 0 }: MetricCardProps) => {
		const reducedMotion = useReducedMotion();

		const content = (
			<div className="bg-theme-bg-secondary rounded-xl p-4 flex items-start gap-3 border border-theme-border shadow-sm h-full">
				<div className="p-2 bg-primary/10 rounded-lg shrink-0">
					<Icon className="w-5 h-5 text-primary" aria-hidden="true" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm text-theme-text-secondary truncate">{label}</p>
					<p className="text-2xl font-bold text-theme-text tabular-nums">
						{value}
					</p>
					{subValue && (
						<p className="text-xs text-theme-text-muted mt-1 truncate">
							{subValue}
						</p>
					)}
				</div>
			</div>
		);

		if (reducedMotion) {
			return content;
		}

		return (
			<motion.div
				className="h-full"
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay }}
			>
				{content}
			</motion.div>
		);
	},
);
