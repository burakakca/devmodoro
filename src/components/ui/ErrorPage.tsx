import { Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorPageProps {
	error: Error;
	reset?: () => void;
}

export const ErrorPage = ({ error, reset }: ErrorPageProps) => {
	return (
		<div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center p-4 text-center">
			<div className="bg-theme-bg-secondary p-8 rounded-2xl shadow-xl max-w-md w-full border border-theme-border">
				<div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
					<AlertTriangle className="w-8 h-8 text-red-500" />
				</div>

				<h1 className="text-2xl font-bold text-theme-text mb-2">
					Something went wrong
				</h1>

				<p className="text-theme-text-secondary mb-6 text-sm">
					{error.message ||
						"An unexpected error occurred while loading this page."}
				</p>

				<div className="flex flex-col gap-3">
					{reset && (
						<button
							type="button"
							onClick={reset}
							className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
						>
							<RefreshCw className="w-4 h-4" />
							Try Again
						</button>
					)}

					<Link
						to="/"
						className="block w-full py-2.5 px-4 bg-theme-bg-tertiary text-theme-text rounded-lg hover:bg-theme-bg hover:text-primary transition-colors font-medium"
					>
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
};
