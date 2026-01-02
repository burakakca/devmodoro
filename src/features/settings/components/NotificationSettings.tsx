import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { ToggleRow } from "./ToggleRow";

export function NotificationSettings() {
	const { settings, updateSettings } = useSettings();
	const { notification } = settings;
	const [permissionStatus, setPermissionStatus] =
		useState<NotificationPermission>("default");

	useEffect(() => {
		if ("Notification" in window) {
			setPermissionStatus(Notification.permission);
		}
	}, []);

	const handleChange = (
		key: keyof typeof notification,
		value: number | boolean,
	) => {
		updateSettings({
			notification: { ...notification, [key]: value },
		});
	};

	const requestPermission = async () => {
		if ("Notification" in window) {
			const permission = await Notification.requestPermission();
			setPermissionStatus(permission);
			if (permission === "granted") {
				handleChange("browserNotifications", true);
			}
		}
	};

	const testNotification = () => {
		if (permissionStatus === "granted") {
			new Notification("Devmodoro", {
				body: "This is a test notification!",
				icon: "/favicon.ico",
			});
		}
	};

	return (
		<div className="space-y-8">
			{/* Browser Notifications */}
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Browser Notifications
				</legend>

				<div className="space-y-4">
					{/* Permission Status */}
					<div className="flex items-center gap-3 p-4 bg-theme-bg-tertiary rounded-lg">
						{permissionStatus === "granted" ? (
							<>
								<Bell className="w-5 h-5 text-green-400" aria-hidden="true" />
								<div className="flex-1">
									<p className="text-theme-text font-medium">
										Notifications Enabled
									</p>
									<p className="text-sm text-theme-text-secondary">
										You will receive notifications when timers complete
									</p>
								</div>
								<button
									type="button"
									onClick={testNotification}
									className="px-3 py-1 text-sm bg-theme-bg-tertiary hover:bg-theme-bg-secondary text-theme-text border border-theme-border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
								>
									Test
								</button>
							</>
						) : permissionStatus === "denied" ? (
							<>
								<BellOff className="w-5 h-5 text-red-400" aria-hidden="true" />
								<div>
									<p className="text-theme-text font-medium">
										Notifications Blocked
									</p>
									<p className="text-sm text-theme-text-secondary">
										Please enable notifications in your browser settings
									</p>
								</div>
							</>
						) : (
							<>
								<Bell
									className="w-5 h-5 text-theme-text-secondary"
									aria-hidden="true"
								/>
								<div className="flex-1">
									<p className="text-theme-text font-medium">
										Enable Notifications
									</p>
									<p className="text-sm text-theme-text-secondary">
										Get notified when timers complete
									</p>
								</div>
								<button
									type="button"
									onClick={requestPermission}
									className="px-3 py-1 text-sm bg-primary hover:bg-primary-hover text-primary-foreground rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
								>
									Enable
								</button>
							</>
						)}
					</div>

					{/* Toggle */}
					{permissionStatus === "granted" && (
						<ToggleRow
							label="Browser Notifications"
							description="Show notifications when timer completes"
							checked={notification.browserNotifications}
							onChange={(checked) =>
								handleChange("browserNotifications", checked)
							}
						/>
					)}
				</div>
			</fieldset>

			{/* Reminder */}
			<fieldset>
				<legend className="text-lg font-medium text-theme-text mb-4">
					Reminder
				</legend>
				<div className="flex items-center gap-3">
					<label htmlFor="reminder-minutes" className="sr-only">
						Reminder minutes before session ends
					</label>
					<input
						type="number"
						id="reminder-minutes"
						min={0}
						max={60}
						value={notification.reminderMinutes}
						onChange={(e) =>
							handleChange("reminderMinutes", Number(e.target.value))
						}
						className="w-20 px-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text text-center focus:outline-none focus:ring-2 focus:ring-primary"
					/>
					<span className="text-theme-text-secondary">
						minutes before session ends
					</span>
				</div>
				<p className="text-sm text-theme-text-muted mt-2">
					Set to 0 to disable reminders
				</p>
			</fieldset>
		</div>
	);
}
