import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "../../contexts/SettingsContext";

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
			<div>
				<h3 className="text-lg font-medium text-white mb-4">
					Browser Notifications
				</h3>

				<div className="space-y-4">
					{/* Permission Status */}
					<div className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg">
						{permissionStatus === "granted" ? (
							<>
								<Bell className="w-5 h-5 text-green-400" />
								<div className="flex-1">
									<p className="text-white font-medium">
										Notifications Enabled
									</p>
									<p className="text-sm text-slate-400">
										You will receive notifications when timers complete
									</p>
								</div>
								<button
									type="button"
									onClick={testNotification}
									className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
								>
									Test
								</button>
							</>
						) : permissionStatus === "denied" ? (
							<>
								<BellOff className="w-5 h-5 text-red-400" />
								<div>
									<p className="text-white font-medium">
										Notifications Blocked
									</p>
									<p className="text-sm text-slate-400">
										Please enable notifications in your browser settings
									</p>
								</div>
							</>
						) : (
							<>
								<Bell className="w-5 h-5 text-slate-400" />
								<div className="flex-1">
									<p className="text-white font-medium">Enable Notifications</p>
									<p className="text-sm text-slate-400">
										Get notified when timers complete
									</p>
								</div>
								<button
									type="button"
									onClick={requestPermission}
									className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors"
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
			</div>

			{/* Reminder */}
			<div>
				<h3 className="text-lg font-medium text-white mb-4">Reminder</h3>
				<div className="flex items-center gap-3">
					<input
						type="number"
						min={0}
						max={60}
						value={notification.reminderMinutes}
						onChange={(e) =>
							handleChange("reminderMinutes", Number(e.target.value))
						}
						className="w-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<span className="text-slate-400">minutes before session ends</span>
				</div>
				<p className="text-sm text-slate-500 mt-2">
					Set to 0 to disable reminders
				</p>
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
