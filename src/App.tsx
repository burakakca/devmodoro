import { Settings } from "lucide-react";
import { useState } from "react";
import { SettingsModal } from "./components/settings/SettingsModal";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { Timer } from "./components/Timer";
import { SettingsProvider } from "./contexts/SettingsContext";
import { TaskProvider, useSelectedTask } from "./contexts/TaskContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function AppContent() {
	const { selectTask, selectedTask } = useSelectedTask();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	return (
		<div className="min-h-screen bg-slate-950 p-4 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<header className="mb-8 flex items-center justify-between">
					<div className="text-center lg:text-left flex-1">
						<h1 className="text-3xl lg:text-4xl font-bold text-white mb-1 tracking-tight">
							Devmodoro
						</h1>
						<p className="text-slate-400 text-sm">
							Developer Productivity Station
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsSettingsOpen(true)}
						className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
						aria-label="Open settings"
					>
						<Settings className="w-6 h-6" />
					</button>
				</header>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Sidebar - Tasks */}
					<aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 order-2 lg:order-1">
						<div className="bg-slate-900 rounded-2xl p-6 space-y-6">
							<div>
								<h2 className="text-lg font-semibold text-white mb-4">
									Add Task
								</h2>
								<TaskForm />
							</div>

							<div className="border-t border-slate-800 pt-6">
								<h2 className="text-lg font-semibold text-white mb-4">Tasks</h2>
								<TaskList
									onSelectTask={selectTask}
									selectedTaskId={selectedTask?.id}
								/>
							</div>
						</div>
					</aside>

					{/* Main - Timer */}
					<main className="flex-1 flex items-start justify-center order-1 lg:order-2">
						<div className="sticky top-8">
							<Timer />
						</div>
					</main>
				</div>
			</div>

			<SettingsModal
				isOpen={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
			/>
		</div>
	);
}

function App() {
	return (
		<SettingsProvider>
			<ThemeProvider>
				<TaskProvider>
					<AppContent />
				</TaskProvider>
			</ThemeProvider>
		</SettingsProvider>
	);
}

export default App;
