import { Brain, Coffee, Moon } from "lucide-react";
import { memo } from "react";
import type { Session } from "@/types";
import {
	formatDuration,
	formatRelativeDate,
	formatTime,
} from "../utils/formatters";

interface SessionHistoryItemProps {
	session: Session & { taskTitle: string };
}

const modeConfig = {
	focus: {
		icon: Brain,
		label: "Focus",
		bgClass: "bg-primary/10",
		textClass: "text-primary",
	},
	"short-break": {
		icon: Coffee,
		label: "Short Break",
		bgClass: "bg-success/10",
		textClass: "text-success",
	},
	"long-break": {
		icon: Moon,
		label: "Long Break",
		bgClass: "bg-warning/10",
		textClass: "text-warning",
	},
};

export const SessionHistoryItem = memo(
	({ session }: SessionHistoryItemProps) => {
		const config = modeConfig[session.mode];
		const Icon = config.icon;

		return (
			<div className="flex items-center gap-4 p-3 rounded-lg hover:bg-theme-bg-tertiary transition-colors">
				<div className={`p-2 rounded-lg ${config.bgClass}`}>
					<Icon className={`w-4 h-4 ${config.textClass}`} aria-hidden="true" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-medium text-theme-text truncate">
						{session.taskTitle}
					</p>
					<p className="text-xs text-theme-text-muted">
						{config.label} &middot; {formatDuration(session.duration)}
					</p>
				</div>
				<div className="text-right flex-shrink-0">
					<p className="text-sm text-theme-text-secondary">
						{formatTime(session.startTime)}
					</p>
					<p className="text-xs text-theme-text-muted">
						{formatRelativeDate(session.startTime)}
					</p>
				</div>
			</div>
		);
	},
);
