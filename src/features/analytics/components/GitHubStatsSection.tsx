import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	Clock,
	GitBranch,
	Github,
	Hash,
	LinkIcon,
	Unlink,
} from "lucide-react";
import { memo } from "react";
import type { GitHubRepoStats } from "../services/analyticsTypes";
import { formatDuration } from "../utils/formatters";
import { MetricCard } from "./MetricCard";

interface GitHubStatsSectionProps {
	isConnected: boolean;
	totalGitHubTasks: number;
	totalNonGitHubTasks: number;
	gitHubFocusTime: number;
	nonGitHubFocusTime: number;
	gitHubSessions: number;
	nonGitHubSessions: number;
	repoStats: GitHubRepoStats[];
	isLoading: boolean;
}

export const GitHubStatsSection = memo(
	({
		isConnected,
		totalGitHubTasks,
		gitHubFocusTime,
		gitHubSessions,
		repoStats,
		isLoading,
	}: GitHubStatsSectionProps) => {
		if (isLoading) {
			return (
				<section className="bg-theme-bg-secondary rounded-2xl p-6 border border-theme-border shadow-sm">
					<div className="h-32 bg-theme-bg-tertiary rounded-xl animate-pulse" />
				</section>
			);
		}

		// Show connect prompt if GitHub is not connected
		if (!isConnected) {
			return (
				<section
					className="bg-theme-bg-secondary rounded-2xl p-6 border border-theme-border shadow-sm"
					aria-labelledby="github-heading"
				>
					<h2
						id="github-heading"
						className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2"
					>
						<Github className="w-5 h-5" aria-hidden="true" />
						GitHub Integration
					</h2>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="p-3 bg-theme-bg-tertiary rounded-full mb-4">
							<Unlink
								className="w-8 h-8 text-theme-text-muted"
								aria-hidden="true"
							/>
						</div>
						<p className="text-theme-text-secondary mb-2">
							GitHub is not connected
						</p>
						<p className="text-sm text-theme-text-muted mb-4 max-w-sm">
							Connect your GitHub account to track time spent on issues and see
							detailed analytics per repository.
						</p>
						<Link
							to="/"
							search={{ settings: "integration" }}
							className="text-primary hover:underline text-sm font-medium"
						>
							Connect GitHub
						</Link>
					</div>
				</section>
			);
		}

		const hasGitHubData = totalGitHubTasks > 0 || gitHubSessions > 0;

		return (
			<section
				className="bg-theme-bg-secondary rounded-2xl p-6 border border-theme-border shadow-sm"
				aria-labelledby="github-heading"
			>
				<h2
					id="github-heading"
					className="text-lg font-semibold text-theme-text mb-4 flex items-center gap-2"
				>
					<Github className="w-5 h-5" aria-hidden="true" />
					GitHub Analytics
				</h2>

				{!hasGitHubData ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="p-3 bg-theme-bg-tertiary rounded-full mb-4">
							<LinkIcon
								className="w-8 h-8 text-theme-text-muted"
								aria-hidden="true"
							/>
						</div>
						<p className="text-theme-text-secondary mb-2">
							No GitHub tasks tracked yet
						</p>
						<p className="text-sm text-theme-text-muted max-w-sm">
							Import issues from GitHub to start tracking time spent on them.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{/* GitHub Metrics */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							<MetricCard
								icon={BookOpen}
								label="GitHub Tasks"
								value={totalGitHubTasks}
								delay={0}
							/>
							<MetricCard
								icon={Hash}
								label="GitHub Sessions"
								value={gitHubSessions}
								delay={0.05}
							/>
							<MetricCard
								icon={Clock}
								label="GitHub Focus Time"
								value={formatDuration(gitHubFocusTime)}
								delay={0.1}
							/>
						</div>

						{/* Repository Breakdown */}
						{repoStats.length > 0 && (
							<div>
								<h3 className="text-sm font-medium text-theme-text-secondary mb-3 flex items-center gap-2">
									<GitBranch className="w-4 h-4" aria-hidden="true" />
									Top Repositories
								</h3>
								<div className="space-y-2">
									{repoStats.map((repo) => (
										<div
											key={repo.repoName}
											className="flex items-center justify-between p-3 bg-theme-bg-tertiary rounded-lg"
										>
											<div className="flex items-center gap-2 min-w-0 flex-1">
												<Github
													className="w-4 h-4 text-theme-text-muted flex-shrink-0"
													aria-hidden="true"
												/>
												<span className="text-sm text-theme-text truncate">
													{repo.repoName}
												</span>
											</div>
											<div className="flex items-center gap-4 text-sm text-theme-text-secondary flex-shrink-0">
												<span className="tabular-nums">
													{repo.taskCount} task{repo.taskCount !== 1 ? "s" : ""}
												</span>
												<span className="tabular-nums">
													{repo.sessionCount} session
													{repo.sessionCount !== 1 ? "s" : ""}
												</span>
												<span className="tabular-nums font-medium text-theme-text">
													{formatDuration(repo.focusMinutes * 60)}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</section>
		);
	},
);
