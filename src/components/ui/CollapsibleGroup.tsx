import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useReducedMotion } from "./AnimatedContainer";

interface CollapsibleGroupProps {
	/** The title/label for the group header */
	title: ReactNode;
	/** Number of items in the group (shown in parentheses) */
	count: number;
	/** The content to show when expanded */
	children: ReactNode;
	/** Whether the group is expanded by default */
	defaultExpanded?: boolean;
	/** ID for accessibility - used in aria-labelledby */
	groupId?: string;
	/** Additional class name for the header text */
	headerClassName?: string;
	/** Size variant for styling */
	size?: "sm" | "md";
}

/**
 * Reusable collapsible group component with animation.
 * Used for grouping items in lists (tasks, issues, etc.).
 */
export function CollapsibleGroup({
	title,
	count,
	children,
	defaultExpanded = true,
	groupId,
	headerClassName = "",
	size = "md",
}: CollapsibleGroupProps) {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const reducedMotion = useReducedMotion();

	const sizeStyles = {
		sm: {
			text: "text-xs",
			chevron: "w-3.5 h-3.5",
			padding: "py-1",
		},
		md: {
			text: "text-sm",
			chevron: "w-4 h-4",
			padding: "",
		},
	};

	const styles = sizeStyles[size];

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className={`flex items-center gap-2 w-full text-left focus:outline-none group ${styles.padding}`}
				aria-expanded={isExpanded}
				aria-controls={groupId ? `${groupId}-content` : undefined}
			>
				<h3
					id={groupId}
					className={`${styles.text} font-medium uppercase tracking-wider flex-1 truncate ${headerClassName}`}
				>
					{title} ({count})
				</h3>
				<ChevronDown
					className={`${styles.chevron} transition-transform duration-200 ${
						isExpanded ? "rotate-0" : "-rotate-90"
					} text-theme-text-muted group-hover:text-theme-text`}
					aria-hidden="true"
				/>
			</button>

			<AnimatePresence initial={false}>
				{isExpanded && (
					<motion.div
						id={groupId ? `${groupId}-content` : undefined}
						initial={reducedMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<div className="pt-1">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
