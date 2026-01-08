import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BarChart3,
	Github,
	HelpCircle,
	ListPlus,
	Settings,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { TabButton } from "@/components/ui/TabButton";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useThemeContext } from "@/features/settings/context/ThemeContext";
import { useSelectedTask } from "@/features/tasks/context/TaskContext";
import { Timer } from "@/features/timer/components/Timer";
import type { Task } from "@/types";

export const Route = createFileRoute("/")({
	component: HomePage,
	head: () => ({
		meta: [
			{
				title:
					"Devmodoro - Pomodoro Timer for Developers with GitHub Integration",
			},
			{
				name: "description",
				content:
					"The ultimate productivity station for developers. Combine Pomodoro timer with GitHub issues, ambient sounds, and analytics. Boost your coding focus today.",
			},
			{
				name: "keywords",
				content:
					"pomodoro timer, developer tools, github integration, focus music, productivity station, coding timer, web development, time management",
			},
			{
				property: "og:title",
				content:
					"Devmodoro - Pomodoro Timer for Developers with GitHub Integration",
			},
			{
				property: "og:description",
				content:
					"The ultimate productivity station for developers. Combine Pomodoro timer with GitHub issues, ambient sounds, and analytics.",
			},
			{
				property: "og:type",
				content: "website",
			},
		],
	}),
});

// Lazy load heavy/conditional components
const GitHubIssueList = lazy(() =>
	import("@/features/github/components/GitHubIssueList").then((module) => ({
		default: module.GitHubIssueList,
	})),
);
const SettingsModal = lazy(() =>
	import("@/features/settings/components/SettingsModal").then((module) => ({
		default: module.SettingsModal,
	})),
);
const SoundMixer = lazy(() =>
	import("@/features/audio/components/SoundMixer").then((module) => ({
		default: module.SoundMixer,
	})),
);
const TaskForm = lazy(() =>
	import("@/features/tasks/components/TaskForm").then((module) => ({
		default: module.TaskForm,
	})),
);
const TaskList = lazy(() =>
	import("@/features/tasks/components/TaskList").then((module) => ({
		default: module.TaskList,
	})),
);

type SidebarTab = "addTask" | "github";

function HomePage() {
	const { selectTask, selectedTask } = useSelectedTask();
	const { settings } = useSettings();
	const { isTimerRunning } = useThemeContext();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<SidebarTab>("addTask");
	const isGitHubConnected = settings.integration.github.isConnected;

	const handleSelectTask = (task: Task) => {
		if (isTimerRunning && selectedTask && task.id !== selectedTask.id) {
			if (
				!window.confirm(
					"Timer is running. Switching tasks will reset the timer. Continue?",
				)
			) {
				return;
			}
		}
		selectTask(task);
	};

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Devmodoro",
		applicationCategory: "ProductivityApplication",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		description:
			"A developer-focused productivity station with Pomodoro timer, ambient sounds, and GitHub integration.",
		featureList:
			"Pomodoro Timer, GitHub Issues Integration, Ambient Sound Mixer, Productivity Analytics",
		image: "https://devmodoro.netlify.app/favicon.svg",
		url: "https://devmodoro.app",
	};

	return (
		<div className="min-h-screen bg-theme-bg p-4 lg:p-8">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is safe
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<a
				href="#main-timer"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
			>
				Skip to main content
			</a>
			<div className="max-w-7xl mx-auto">
				<header className="mb-8 flex items-center justify-between">
					<div className="text-center lg:text-left flex-1 flex items-center justify-center lg:justify-start gap-3">
						<img
							src="/favicon.svg"
							alt=""
							className="w-8 h-8 lg:w-10 lg:h-10"
						/>
						<div>
							<h1 className="text-3xl lg:text-4xl font-bold text-theme-text mb-0 tracking-tight leading-none">
								Devmodoro
							</h1>
							<p className="text-theme-text-secondary text-sm">
								Developer Productivity Station
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Link
							to="/about"
							className="p-3 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
							aria-label="About Devmodoro"
						>
							<HelpCircle className="w-6 h-6" aria-hidden="true" />
						</Link>
						<Link
							to="/analytics"
							className="p-3 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
							aria-label="View analytics"
						>
							<BarChart3 className="w-6 h-6" aria-hidden="true" />
						</Link>
						<button
							type="button"
							onClick={() => setIsSettingsOpen(true)}
							className="p-3 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
							aria-label="Open settings"
						>
							<Settings className="w-6 h-6" aria-hidden="true" />
						</button>
					</div>
				</header>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Sidebar - Tasks */}
					<aside
						className="w-full lg:w-80 xl:w-96 flex-shrink-0 order-2 lg:order-1"
						aria-label="Task Management"
					>
						<div className="bg-theme-bg-secondary rounded-2xl p-6 space-y-6 border border-theme-border shadow-sm">
							{/* Tabs */}
							<div
								className="flex gap-2"
								role="tablist"
								aria-label="Sidebar sections"
							>
								<TabButton
									isSelected={activeTab === "addTask"}
									onClick={() => setActiveTab("addTask")}
									controls="tab-panel-addTask"
									icon={<ListPlus className="w-4 h-4" aria-hidden="true" />}
								>
									Add Task
								</TabButton>
								{isGitHubConnected && (
									<TabButton
										isSelected={activeTab === "github"}
										onClick={() => setActiveTab("github")}
										controls="tab-panel-github"
										icon={<Github className="w-4 h-4" aria-hidden="true" />}
									>
										GitHub
									</TabButton>
								)}
							</div>

							{/* Tab Content */}
							{activeTab === "addTask" && (
								<section
									id="tab-panel-addTask"
									role="tabpanel"
									aria-labelledby="add-task-heading"
								>
									<h2 id="add-task-heading" className="sr-only">
										Add Task
									</h2>
									<Suspense
										fallback={
											<div className="space-y-4 animate-pulse">
												<div className="h-10 bg-theme-bg-tertiary rounded-lg" />
												<div className="h-10 bg-theme-bg-tertiary rounded-lg" />
											</div>
										}
									>
										<TaskForm />
									</Suspense>
								</section>
							)}

							{activeTab === "github" && isGitHubConnected && (
								<section
									id="tab-panel-github"
									role="tabpanel"
									aria-labelledby="github-issues-heading"
								>
									<h2 id="github-issues-heading" className="sr-only">
										GitHub Issues
									</h2>
									<Suspense
										fallback={
											<div className="p-4 text-center">Loading issues...</div>
										}
									>
										<GitHubIssueList />
									</Suspense>
								</section>
							)}

							{/* Tasks List - Always visible */}
							<section
								className="border-t border-theme-border pt-6"
								aria-labelledby="tasks-list-heading"
							>
								<h2
									id="tasks-list-heading"
									className="text-lg font-semibold text-theme-text mb-4"
								>
									Tasks
								</h2>
								<Suspense
									fallback={
										<div className="space-y-4 animate-pulse">
											<div className="h-16 bg-theme-bg-tertiary rounded-lg" />
											<div className="h-16 bg-theme-bg-tertiary rounded-lg" />
										</div>
									}
								>
									<TaskList
										onSelectTask={handleSelectTask}
										selectedTaskId={selectedTask?.id}
									/>
								</Suspense>
							</section>
						</div>
					</aside>

					{/* Main - Timer */}
					<main
						id="main-timer"
						className="flex-1 flex flex-col items-center gap-6 order-1 lg:order-2"
					>
						<div className="sticky top-8 flex flex-col items-center gap-6 w-full">
							<Timer />
							<Suspense
								fallback={
									<div className="w-full max-w-md mx-auto h-32 bg-theme-bg-tertiary rounded-2xl animate-pulse" />
								}
							>
								<SoundMixer />
							</Suspense>
						</div>
					</main>
				</div>
			</div>

			<Suspense fallback={null}>
				<SettingsModal
					isOpen={isSettingsOpen}
					onClose={() => setIsSettingsOpen(false)}
				/>
			</Suspense>
		</div>
	);
}
