import { Link } from "@tanstack/react-router";
import { FileQuestion, Home } from "lucide-react";

export const NotFoundPage = () => {
	return (
		<div className="min-h-screen bg-theme-bg flex flex-col items-center justify-center p-4 text-center">
			<div className="bg-theme-bg-secondary p-8 rounded-2xl shadow-xl max-w-md w-full border border-theme-border">
				<div className="w-16 h-16 bg-theme-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
					<FileQuestion className="w-8 h-8 text-theme-text-secondary" />
				</div>

				<h1 className="text-2xl font-bold text-theme-text mb-2">
					Page Not Found
				</h1>

				<p className="text-theme-text-secondary mb-6 text-sm">
					The page you are looking for doesn't exist or has been moved.
				</p>

				<Link
					to="/"
					className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				>
					<Home className="w-4 h-4" />
					Go Home
				</Link>
			</div>
		</div>
	);
};
