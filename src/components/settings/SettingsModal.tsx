import {
	Bell,
	Clock,
	ListTodo,
	Palette,
	Volume2,
	Webhook,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { IntegrationSettings } from "./IntegrationSettings";
import { NotificationSettings } from "./NotificationSettings";
import { SoundSettings } from "./SoundSettings";
import { TaskSettings } from "./TaskSettings";
import { ThemeSettings } from "./ThemeSettings";
import { TimerSettings } from "./TimerSettings";

type SettingsTab =
	| "timer"
	| "task"
	| "sound"
	| "theme"
	| "notification"
	| "integration";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const TABS: { id: SettingsTab; label: string; icon: typeof Clock }[] = [
	{ id: "timer", label: "Timer", icon: Clock },
	{ id: "task", label: "Task", icon: ListTodo },
	{ id: "sound", label: "Sound", icon: Volume2 },
	{ id: "theme", label: "Theme", icon: Palette },
	{ id: "notification", label: "Notification", icon: Bell },
	{ id: "integration", label: "Integration", icon: Webhook },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
	const [activeTab, setActiveTab] = useState<SettingsTab>("timer");

	// Close on Escape key
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, handleKeyDown]);

	if (!isOpen) return null;

	const renderTabContent = () => {
		switch (activeTab) {
			case "timer":
				return <TimerSettings />;
			case "task":
				return <TaskSettings />;
			case "sound":
				return <SoundSettings />;
			case "theme":
				return <ThemeSettings />;
			case "notification":
				return <NotificationSettings />;
			case "integration":
				return <IntegrationSettings />;
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
				onClick={onClose}
				aria-label="Close settings"
			/>
			{/* Modal */}{" "}
			<div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden m-4">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
					<h2 className="text-xl font-semibold text-white">Settings</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
						aria-label="Close settings"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="flex flex-col md:flex-row h-[calc(90vh-80px)] max-h-[600px]">
					{/* Tab Navigation */}
					<nav className="flex md:flex-col gap-1 p-2 md:p-4 md:w-48 border-b md:border-b-0 md:border-r border-slate-800 overflow-x-auto md:overflow-x-visible">
						{TABS.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
										isActive
											? "bg-indigo-600 text-white"
											: "text-slate-400 hover:text-white hover:bg-slate-800"
									}`}
								>
									<Icon className="w-4 h-4 flex-shrink-0" />
									<span className="hidden md:inline">{tab.label}</span>
								</button>
							);
						})}
					</nav>

					{/* Tab Content */}
					<div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>
				</div>
			</div>
		</div>
	);
}
