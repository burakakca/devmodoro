import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
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
import { useMemo, useState } from "react";
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
	const queryClient = useQueryClient();
	const { settings } = useSettings();
	const { github } = settings.integration;

	const [searchQuery, setSearchQuery] = useState("");
	const [importingIssueId, setImportingIssueId] = useState<number | null>(null);
	const [estimate, setEstimate] = useState(1);

	// TanStack Query for fetching issues
	const {
		data,
		error,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isFetchingNextPage,
		isLoading,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["github-issues", github.token],
		queryFn: ({ pageParam = 1 }) => getAssignedIssues(github.token, pageParam),
		getNextPageParam: (lastPage, allPages) => {
			return lastPage.hasMore ? allPages.length + 1 : undefined;
		},
		enabled: github.isConnected && !!github.token,
	});

	// Mutation for importing tasks
	const importMutation = useMutation({
		mutationFn: async ({
			issue,
			estimatedPomos,
		}: {
			issue: GitHubIssue;
			estimatedPomos: number;
		}) => {
			return createTask({
				title: `#${issue.number} ${issue.title}`,
				estimatedPomos,
				externalLink: issue.html_url,
				status: "todo",
			});
		},
		onSuccess: (_, variables) => {
			onIssueImported?.(variables.issue.html_url);
			// We don't necessarily need to invalidate github-issues since we use dexie for imported status
		},
	});

	// Flatten all pages into a single issues array
	const allIssues = useMemo(() => {
		return data?.pages.flatMap((page) => page.issues) ?? [];
	}, [data]);

	// Get existing tasks to prevent duplicates (still using live query for local DB reactivity)
	const existingTasks = useLiveQuery(() => db.tasks.toArray());
	const importedUrls = useMemo(() => {
		const urls = new Set<string>();
		existingTasks?.forEach((task) => {
			if (task.externalLink) urls.add(task.externalLink);
		});
		return urls;
	}, [existingTasks]);

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
		importMutation.mutate({ issue, estimatedPomos: estimate });
	};

	// Filter issues by search query
	const filteredIssues = useMemo(() => {
		if (!searchQuery.trim()) return allIssues;

		const query = searchQuery.toLowerCase();
		return allIssues.filter(
			(issue) =>
				issue.title.toLowerCase().includes(query) ||
				issue.repository.full_name.toLowerCase().includes(query) ||
				issue.labels.some((label) =>
					label.name.toLowerCase().includes(query),
				) ||
				String(issue.number).includes(query),
		);
	}, [allIssues, searchQuery]);

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
					onClick={() => refetch()}
					disabled={isFetching}
					aria-label="Refresh issues"
					className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<RefreshCw
						className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
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
					<span>
						{error instanceof Error ? error.message : "Failed to fetch issues"}
					</span>
				</div>
			)}

			{/* Loading state */}
			{isLoading && (
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
						const isProcessing =
							importMutation.isPending &&
							importMutation.variables?.issue.id === issue.id;
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
			{hasNextPage && (
				<button
					type="button"
					onClick={() => fetchNextPage()}
					disabled={isFetchingNextPage}
					className="w-full py-2 text-sm text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
				>
					{isFetchingNextPage ? "Loading more..." : "Load more issues"}
				</button>
			)}

			{/* Loading more indicator */}
			{isFetchingNextPage && (
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
