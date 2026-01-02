import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/analytics")({
	component: AnalyticsPage,
});

const AnalyticsDashboard = lazy(() =>
	import("@/features/analytics/components/AnalyticsDashboard").then(
		(module) => ({
			default: module.AnalyticsDashboard,
		}),
	),
);

function AnalyticsPage() {
	return (
		<div className="min-h-screen bg-theme-bg p-4 lg:p-8">
			<div className="max-w-6xl mx-auto">
				<header className="mb-8 flex items-center gap-4">
					<Link
						to="/"
						className="p-2 text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-tertiary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
						aria-label="Back to timer"
					>
						<ArrowLeft className="w-6 h-6" aria-hidden="true" />
					</Link>
					<div>
						<h1 className="text-2xl lg:text-3xl font-bold text-theme-text tracking-tight">
							Analytics
						</h1>
						<p className="text-theme-text-secondary text-sm">
							Track your productivity
						</p>
					</div>
				</header>

				<Suspense
					fallback={
						<div className="space-y-6">
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{Array.from({ length: 6 }, (_, i) => i).map((i) => (
									<div
										key={`skeleton-analytics-${i}`}
										className="h-24 bg-theme-bg-secondary rounded-xl animate-pulse"
									/>
								))}
							</div>
							<div className="h-64 bg-theme-bg-secondary rounded-xl animate-pulse" />
						</div>
					}
				>
					<AnalyticsDashboard />
				</Suspense>
			</div>
		</div>
	);
}
