import { memo, type ReactNode } from "react";

interface TabButtonProps {
	isSelected: boolean;
	onClick: () => void;
	disabled?: boolean;
	children: ReactNode;
	icon?: ReactNode;
	id?: string;
	controls?: string;
	/** Whether to expand to fill available space (default: true) */
	fullWidth?: boolean;
}

export const TabButton = memo(
	({
		isSelected,
		onClick,
		disabled,
		children,
		icon,
		id,
		controls,
		fullWidth = true,
	}: TabButtonProps) => {
		const baseClasses =
			"flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary";
		const widthClass = fullWidth ? "flex-1" : "";
		const stateClasses = isSelected
			? "bg-primary text-primary-foreground"
			: "text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary disabled:opacity-50";

		return (
			<button
				type="button"
				role="tab"
				id={id}
				aria-selected={isSelected}
				aria-controls={controls}
				tabIndex={isSelected ? 0 : -1}
				onClick={onClick}
				disabled={disabled}
				className={`${baseClasses} ${widthClass} ${stateClasses}`}
			>
				{icon}
				{children}
			</button>
		);
	},
);
