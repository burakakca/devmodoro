import { useSettings } from "../../contexts/SettingsContext";

export function TaskSettings() {
	const { settings, updateSettings } = useSettings();
	const { task } = settings;

	const handleChange = (key: keyof typeof task, value: boolean) => {
		updateSettings({
			task: { ...task, [key]: value },
		});
	};

	return (
		<div className="space-y-6">
			<h3 className="text-lg font-medium text-white mb-4">Task Settings</h3>

			<div className="space-y-4">
				<ToggleRow
					label="Auto Check Tasks"
					description="Automatically mark tasks as done when all pomodoros are completed"
					checked={task.autoCheckTasks}
					onChange={(checked) => handleChange("autoCheckTasks", checked)}
				/>
				<ToggleRow
					label="Move Completed to Bottom"
					description="Move completed tasks to the bottom of the list"
					checked={task.checkToBottom}
					onChange={(checked) => handleChange("checkToBottom", checked)}
				/>
			</div>
		</div>
	);
}

function ToggleRow({
	label,
	description,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<p className="text-white font-medium">{label}</p>
				<p className="text-sm text-slate-400">{description}</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative w-11 h-6 rounded-full transition-colors ${
					checked ? "bg-indigo-600" : "bg-slate-700"
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
}
