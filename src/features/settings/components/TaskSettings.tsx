import { useSettings } from "@/features/settings/context/SettingsContext";
import { ToggleRow } from "./ToggleRow";

export function TaskSettings() {
	const { settings, updateSettings } = useSettings();
	const { task } = settings;

	const handleChange = (key: keyof typeof task, value: boolean) => {
		updateSettings({
			task: { ...task, [key]: value },
		});
	};

	return (
		<fieldset className="space-y-6">
			<legend className="text-lg font-medium text-theme-text mb-4">
				Task Settings
			</legend>

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
		</fieldset>
	);
}
