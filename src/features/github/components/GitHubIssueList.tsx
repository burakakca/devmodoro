import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
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
import { CollapsibleGroup } from "@/components/ui/CollapsibleGroup";
import { db } from "@/db/db";
import { getAssignedIssues } from "@/features/github/services/githubIssueService";
import type {
	GitHubIssue,
	GitHubIssuesResult,
} from "@/features/github/services/githubTypes";
import { getLabelTextColor } from "@/features/github/services/githubUtils";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { createTask } from "@/features/tasks/services/taskService";

interface GitHubIssueListProps {
	onIssueImported?: (issueUrl: string) => void;
}

function RepoGroup({
	repoName,
	issues,
	issueUrlCounts,
	importingIssueId,
	processingIds,
	estimate,
	setEstimate,
	startImport,
	cancelImport,
	confirmImport,
}: {
	repoName: string;
	issues: GitHubIssue[];
	issueUrlCounts: Map<string, number>;
	importingIssueId: number | null;
	processingIds: Set<number>;
	estimate: number;
	setEstimate: (val: number) => void;
	startImport: (id: number) => void;
	cancelImport: () => void;
	confirmImport: (issue: GitHubIssue) => void;
}) {
	return (
		<CollapsibleGroup
			title={repoName}
			count={issues.length}
			size="sm"
			headerClassName="text-theme-text-secondary font-semibold"
			defaultExpanded={false}
		>
			<ul className="space-y-2">
				{issues.map((issue) => {
					const isImporting = importingIssueId === issue.id;
					const isProcessing = processingIds.has(issue.id);
					const count = issueUrlCounts.get(issue.html_url) || 0;

					return (
						<li key={issue.id}>
							<article
								className="p-3 bg-theme-bg-tertiary rounded-lg hover:bg-theme-bg-tertiary/80 transition-colors relative"
								aria-labelledby={`issue-title-${issue.id}`}
							>
								<div className="flex items-start gap-2">
									<div className="flex-1 min-w-0">
										<h4
											id={`issue-title-${issue.id}`}
											className="text-sm font-medium text-theme-text leading-snug"
										>
											<span className="text-theme-text-secondary">
												#{issue.number}
											</span>{" "}
											{issue.title}
											{count > 0 && (
												<span className="ml-2 text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full font-bold">
													{count}
												</span>
											)}
										</h4>

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
											</div>
										)}
									</div>

									<div className="flex items-center gap-1 shrink-0">
										{isImporting ? (
											<div className="flex items-center gap-1 bg-theme-bg-secondary p-1 rounded-lg shadow-lg border border-theme-border absolute right-2 top-2 z-10">
												<input
													type="number"
													min="1"
													max="20"
													value={estimate}
													onChange={(e) =>
														setEstimate(
															Math.max(1, parseInt(e.target.value, 10) || 0),
														)
													}
													className="w-10 px-1 py-0.5 text-xs bg-theme-bg-tertiary border border-theme-border rounded text-center text-theme-text"
												/>
												<button
													type="button"
													onClick={() => confirmImport(issue)}
													className="p-1 text-green-500 hover:bg-green-500/10 rounded"
												>
													<Check className="w-3.5 h-3.5" />
												</button>
												<button
													type="button"
													onClick={() => {
														cancelImport();
													}}
													className="p-1 text-red-500 hover:bg-red-500/10 rounded"
												>
													<X className="w-3.5 h-3.5" />
												</button>
											</div>
										) : (
											<>
												<a
													href={issue.html_url}
													target="_blank"
													rel="noopener noreferrer"
													className="p-1.5 text-theme-text-muted hover:text-theme-text rounded transition-colors"
												>
													<ExternalLink className="w-4 h-4" />
												</a>
												<button
													type="button"
													onClick={() => startImport(issue.id)}
													disabled={isProcessing}
													className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
												>
													{isProcessing ? (
														<Loader2 className="w-4 h-4 animate-spin" />
													) : (
														<Plus className="w-4 h-4" />
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
		</CollapsibleGroup>
	);
}

export function GitHubIssueList({ onIssueImported }: GitHubIssueListProps) {
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
	} = useInfiniteQuery<
		GitHubIssuesResult,
		Error,
		{ pages: GitHubIssuesResult[] },
		string[],
		number
	>({
		queryKey: ["github-issues", github.token],
		queryFn: ({ pageParam }) => getAssignedIssues(github.token, pageParam),
		initialPageParam: 1,
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
			const count = issueUrlCounts.get(issue.html_url) || 0;
			const displayTitle =
				count > 0
					? `#${issue.number} ${issue.title} (${count + 1})`
					: `#${issue.number} ${issue.title}`;

			return createTask({
				title: displayTitle,
				estimatedPomos,
				externalLink: issue.html_url,
				status: "todo",
			});
		},
		onSuccess: (_, variables) => {
			onIssueImported?.(variables.issue.html_url);
		},
	});

	// Flatten all pages into a single issues array
	const allIssues = useMemo(() => {
		return data?.pages.flatMap((page) => page.issues) ?? [];
	}, [data]);

	// Group issues by repository
	const groupedIssues = useMemo(() => {
		const filtered = searchQuery.trim()
			? allIssues.filter(
					(issue) =>
						issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						issue.repository.full_name
							.toLowerCase()
							.includes(searchQuery.toLowerCase()) ||
						String(issue.number).includes(searchQuery),
				)
			: allIssues;

		const groups: Record<string, GitHubIssue[]> = {};
		for (const issue of filtered) {
			const repoName = issue.repository.full_name;
			if (!groups[repoName]) groups[repoName] = [];
			groups[repoName].push(issue);
		}
		return groups;
	}, [allIssues, searchQuery]);

	// Get existing tasks to count occurrences per URL
	const existingTasks = useLiveQuery(() => db.tasks.toArray());
	const issueUrlCounts = useMemo(() => {
		const counts = new Map<string, number>();
		existingTasks?.forEach((task) => {
			if (task.externalLink) {
				counts.set(task.externalLink, (counts.get(task.externalLink) || 0) + 1);
			}
		});
		return counts;
	}, [existingTasks]);

	const processingIds = useMemo(() => {
		const ids = new Set<number>();
		if (importMutation.isPending && importMutation.variables) {
			ids.add(importMutation.variables.issue.id);
		}
		return ids;
	}, [importMutation.isPending, importMutation.variables]);

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
					<AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
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
			{!isLoading && !error && Object.keys(groupedIssues).length === 0 && (
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

			{/* Issue list grouped by repository */}
			<div className="space-y-6">
				{Object.entries(groupedIssues).map(([repoName, issues]) => (
					<RepoGroup
						key={repoName}
						repoName={repoName}
						issues={issues}
						issueUrlCounts={issueUrlCounts}
						importingIssueId={importingIssueId}
						processingIds={processingIds}
						estimate={estimate}
						setEstimate={setEstimate}
						startImport={(id) => {
							setImportingIssueId(id);
							setEstimate(1);
						}}
						cancelImport={() => setImportingIssueId(null)}
						confirmImport={(issue) => {
							setImportingIssueId(null);
							importMutation.mutate({ issue, estimatedPomos: estimate });
						}}
					/>
				))}
			</div>

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
