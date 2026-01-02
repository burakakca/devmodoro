import { useLiveQuery } from "dexie-react-hooks";
import {
	AlertCircle,
	Check,
	ExternalLink,
	Github,
	Loader2,
	Plus,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/db/db";
import {
	type GitHubIssue,
	getAssignedIssues,
	getLabelTextColor,
} from "@/features/github/services/githubService";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { createTask } from "@/features/tasks/services/taskService";

interface GitHubIssueListProps {
	onIssueImported?: (issueUrl: string) => void;
}

export function GitHubIssueList({ onIssueImported }: GitHubIssueListProps) {
	const { settings } = useSettings();
	const { github } = settings.integration;

	const [issues, setIssues] = useState<GitHubIssue[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");

	// Import state
	const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
	const [importingIssueId, setImportingIssueId] = useState<number | null>(null);
	const [estimate, setEstimate] = useState(1);

	// Get existing tasks to prevent duplicates
	const existingTasks = useLiveQuery(() => db.tasks.toArray());
	const importedUrls = useMemo(() => {
		const urls = new Set<string>();
		existingTasks?.forEach((task) => {
			if (task.externalLink) urls.add(task.externalLink);
		});
		return urls;
	}, [existingTasks]);

	const fetchIssues = useCallback(
		async (pageNum: number, append = false) => {
			if (!github.isConnected || !github.token) return;

			setIsLoading(true);
			setError(null);

			const result = await getAssignedIssues(github.token, pageNum);

			if (result.error) {
				setError(result.error);
			} else {
				setIssues((prev) =>
					append ? [...prev, ...result.issues] : result.issues,
				);
				setHasMore(result.hasMore);
			}

			setIsLoading(false);
		},
		[github.isConnected, github.token],
	);

	// Fetch issues when connected
	useEffect(() => {
		if (github.isConnected) {
			fetchIssues(1);
		} else {
			setIssues([]);
			setError(null);
		}
	}, [github.isConnected, fetchIssues]);

	const handleRefresh = () => {
		setPage(1);
		fetchIssues(1);
	};

	const handleLoadMore = () => {
		const nextPage = page + 1;
		setPage(nextPage);
		fetchIssues(nextPage, true);
	};

	const startImport = (issueId: number) => {
		setImportingIssueId(issueId);
		setEstimate(1);
	};

	const cancelImport = () => {
		setImportingIssueId(null);
		setEstimate(1);
	};

	const confirmImport = async (issue: GitHubIssue) => {
		setImportingIssueId(null);
		setProcessingIds((prev) => new Set(prev).add(issue.id));

		try {
			await createTask({
				title: `#${issue.number} ${issue.title}`,
				estimatedPomos: estimate,
				externalLink: issue.html_url,
				status: "todo",
			});
			onIssueImported?.(issue.html_url);
		} catch (err) {
			console.error("Failed to import issue as task:", err);
		} finally {
			setProcessingIds((prev) => {
				const next = new Set(prev);
				next.delete(issue.id);
				return next;
			});
		}
	};

	// Filter issues by search query
	const filteredIssues = useMemo(() => {
		if (!searchQuery.trim()) return issues;

		const query = searchQuery.toLowerCase();
		return issues.filter(
			(issue) =>
				issue.title.toLowerCase().includes(query) ||
				issue.repository.full_name.toLowerCase().includes(query) ||
				issue.labels.some((label) =>
					label.name.toLowerCase().includes(query),
				) ||
				String(issue.number).includes(query),
		);
	}, [issues, searchQuery]);

	if (!github.isConnected) {
		return (
			<output
				className="block text-center py-8 text-theme-text-muted"
				aria-label="GitHub not connected"
			>
				<Github
					className="w-12 h-12 mx-auto mb-3 opacity-50"
					aria-hidden="true"
				/>
				<p className="text-sm">Connect GitHub in Settings to see your issues</p>
			</output>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header with search and refresh */}
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-muted"
						aria-hidden="true"
					/>
					<input
						type="search"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search issues..."
						aria-label="Search GitHub issues"
						className="w-full pl-9 pr-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-sm text-theme-text placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<button
					type="button"
					onClick={handleRefresh}
					disabled={isLoading}
					aria-label="Refresh issues"
					className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<RefreshCw
						className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
						aria-hidden="true"
					/>
				</button>
			</div>

			{/* Error state */}
			{error && (
				<div
					role="alert"
					className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm"
				>
					<AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
					<span>{error}</span>
				</div>
			)}

			{/* Loading state */}
			{isLoading && issues.length === 0 && (
				<output
					className="flex items-center justify-center py-8"
					aria-label="Loading issues"
				>
					<Loader2
						className="w-6 h-6 text-primary animate-spin"
						aria-hidden="true"
					/>
					<span className="sr-only">Loading GitHub issues...</span>
				</output>
			)}

			{/* Empty state */}
			{!isLoading && !error && filteredIssues.length === 0 && (
				<output
					className="block text-center py-8 text-theme-text-muted"
					aria-label="No issues found"
				>
					<p className="text-sm">
						{searchQuery
							? "No issues match your search"
							: "No assigned issues found"}
					</p>
				</output>
			)}

			{/* Issue list */}
			{filteredIssues.length > 0 && (
				<ul className="space-y-2" aria-label="GitHub assigned issues">
					{filteredIssues.map((issue) => {
						const isImporting = importingIssueId === issue.id;
						const isProcessing = processingIds.has(issue.id);
						const isImported = importedUrls.has(issue.html_url);

						return (
							<li key={issue.id}>
								<article
									className="p-3 bg-theme-bg-tertiary rounded-lg hover:bg-theme-bg-tertiary/80 transition-colors relative"
									aria-labelledby={`issue-title-${issue.id}`}
								>
									<div className="flex items-start gap-2">
										<div className="flex-1 min-w-0">
											{/* Repository */}
											<p className="text-xs text-theme-text-muted truncate mb-1">
												{issue.repository.full_name}
											</p>

											{/* Title */}
											<h4
												id={`issue-title-${issue.id}`}
												className="text-sm font-medium text-theme-text leading-snug"
											>
												<span className="text-theme-text-secondary">
													#{issue.number}
												</span>{" "}
												{issue.title}
											</h4>

											{/* Labels */}
											{issue.labels.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-2">
													{issue.labels.slice(0, 3).map((label) => (
														<span
															key={label.id}
															className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
															style={{
																backgroundColor: `#${label.color}`,
																color: getLabelTextColor(label.color),
															}}
														>
															{label.name}
														</span>
													))}
													{issue.labels.length > 3 && (
														<span className="text-xs text-theme-text-muted">
															+{issue.labels.length - 3}
														</span>
													)}
												</div>
											)}
										</div>

										{/* Actions */}
										<div className="flex items-center gap-1 flex-shrink-0">
											{isImported ? (
												<span
													className="p-1.5 text-success cursor-default"
													title="Already imported"
													role="img"
													aria-label="Task already imported"
												>
													<Check className="w-4 h-4" />
												</span>
											) : isImporting ? (
												<div className="flex items-center gap-1 bg-theme-bg-secondary p-1 rounded-lg shadow-lg border border-theme-border absolute right-2 top-2 z-10 animate-in fade-in zoom-in-95 duration-200">
													<div className="flex items-center gap-1 mr-1">
														<span className="text-xs font-medium text-theme-text-secondary">
															Est:
														</span>
														<input
															type="number"
															min="1"
															max="20"
															value={estimate}
															onChange={(e) =>
																setEstimate(
																	Math.max(
																		1,
																		parseInt(e.target.value, 10) || 0,
																	),
																)
															}
															className="w-12 px-1 py-0.5 text-sm bg-theme-bg-tertiary border border-theme-border rounded text-center focus:outline-none focus:ring-1 focus:ring-primary text-theme-text"
															onClick={(e) => e.stopPropagation()}
															onKeyDown={(e) => {
																if (e.key === "Enter") confirmImport(issue);
																if (e.key === "Escape") cancelImport();
															}}
														/>
													</div>
													<button
														type="button"
														onClick={() => confirmImport(issue)}
														className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
														aria-label="Confirm import"
													>
														<Check className="w-4 h-4" />
													</button>
													<button
														type="button"
														onClick={cancelImport}
														className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
														aria-label="Cancel import"
													>
														<X className="w-4 h-4" />
													</button>
												</div>
											) : (
												<>
													<a
														href={issue.html_url}
														target="_blank"
														rel="noopener noreferrer"
														aria-label={`Open issue #${issue.number} on GitHub`}
														className="p-1.5 text-theme-text-muted hover:text-theme-text rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
													>
														<ExternalLink
															className="w-4 h-4"
															aria-hidden="true"
														/>
													</a>
													<button
														type="button"
														onClick={() => startImport(issue.id)}
														disabled={isProcessing}
														aria-label={`Import issue #${issue.number} as task`}
														className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
													>
														{isProcessing ? (
															<Loader2
																className="w-4 h-4 animate-spin"
																aria-hidden="true"
															/>
														) : (
															<Plus className="w-4 h-4" aria-hidden="true" />
														)}
													</button>
												</>
											)}
										</div>
									</div>
								</article>
							</li>
						);
					})}
				</ul>
			)}

			{/* Load more */}
			{hasMore && !isLoading && (
				<button
					type="button"
					onClick={handleLoadMore}
					className="w-full py-2 text-sm text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
				>
					Load more issues
				</button>
			)}

			{/* Loading more indicator */}
			{isLoading && issues.length > 0 && (
				<output
					className="flex items-center justify-center py-2"
					aria-label="Loading more issues"
				>
					<Loader2
						className="w-4 h-4 text-primary animate-spin"
						aria-hidden="true"
					/>
					<span className="sr-only">Loading more issues...</span>
				</output>
			)}
		</div>
	);
}
