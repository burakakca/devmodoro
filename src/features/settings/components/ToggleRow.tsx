import { memo } from "react";

interface ToggleRowProps {
	label: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export const ToggleRow = memo(function ToggleRow({
	label,
	description,
	checked,
	onChange,
}: ToggleRowProps) {
	const id = label.toLowerCase().replace(/\s+/g, "-");

	return (
		<div className="flex items-center justify-between">
			<div>
				<p id={`${id}-label`} className="text-theme-text font-medium">
					{label}
				</p>
				<p id={`${id}-desc`} className="text-sm text-theme-text-secondary">
					{description}
				</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-labelledby={`${id}-label`}
				aria-describedby={`${id}-desc`}
				onClick={() => onChange(!checked)}
				className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
					checked ? "bg-primary" : "bg-theme-bg-tertiary"
				}`}
			>
				<span
					className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
						checked ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
});
