import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { memo, useState } from "react";
import { getSessionsWithTasks } from "../services/analyticsService";
import { type ExportFormat, exportSessions } from "../services/exportService";

export const ExportButton = memo(() => {
	const [isOpen, setIsOpen] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const handleExport = async (format: ExportFormat) => {
		setIsExporting(true);
		try {
			const sessions = await getSessionsWithTasks();
			const filename = `devmodoro-sessions-${new Date().toISOString().split("T")[0]}`;
			exportSessions(sessions, format, filename);
		} catch (error) {
			console.error("Export failed:", error);
		} finally {
			setIsExporting(false);
			setIsOpen(false);
		}
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				disabled={isExporting}
				className="flex items-center gap-2 px-3 py-2 text-sm bg-theme-bg-tertiary hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				<Download className="w-4 h-4" aria-hidden="true" />
				Export
			</button>

			{isOpen && (
				<>
					{/* Backdrop */}
					<button
						type="button"
						className="fixed inset-0 z-10 cursor-default"
						onClick={() => setIsOpen(false)}
						aria-label="Close export menu"
					/>

					{/* Menu */}
					<div
						className="absolute right-0 mt-2 w-48 bg-theme-bg-secondary rounded-lg shadow-xl border border-theme-border z-20"
						role="menu"
					>
						<button
							type="button"
							onClick={() => handleExport("json")}
							className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-theme-text hover:bg-theme-bg-tertiary rounded-t-lg transition-colors"
							role="menuitem"
						>
							<FileJson className="w-4 h-4 text-theme-text-secondary" />
							Export as JSON
						</button>
						<button
							type="button"
							onClick={() => handleExport("csv")}
							className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-theme-text hover:bg-theme-bg-tertiary rounded-b-lg transition-colors"
							role="menuitem"
						>
							<FileSpreadsheet className="w-4 h-4 text-theme-text-secondary" />
							Export as CSV
						</button>
					</div>
				</>
			)}
		</div>
	);
});
