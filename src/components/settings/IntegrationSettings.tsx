import { CheckCircle, ExternalLink, Webhook, XCircle } from "lucide-react";
import { useState } from "react";
import { useSettings } from "../../contexts/SettingsContext";

export function IntegrationSettings() {
	const { settings, updateSettings } = useSettings();
	const { integration } = settings;
	const [testStatus, setTestStatus] = useState<
		"idle" | "testing" | "success" | "error"
	>("idle");

	const handleChange = (
		key: keyof typeof integration,
		value: string | boolean,
	) => {
		updateSettings({
			integration: { ...integration, [key]: value },
		});
	};

	const testWebhook = async () => {
		if (!integration.webhookUrl) return;

		setTestStatus("testing");

		try {
			const response = await fetch(integration.webhookUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					event: "test",
					timestamp: Date.now(),
					message: "Test webhook from Devmodoro",
				}),
			});

			setTestStatus(response.ok ? "success" : "error");
		} catch {
			setTestStatus("error");
		}

		setTimeout(() => setTestStatus("idle"), 3000);
	};

	return (
		<div className="space-y-8">
			{/* Webhook */}
			<div>
				<div className="flex items-center gap-2 mb-4">
					<Webhook className="w-5 h-5 text-indigo-400" />
					<h3 className="text-lg font-medium text-white">Webhook</h3>
				</div>

				<div className="space-y-4">
					<ToggleRow
						label="Enable Webhook"
						description="Send HTTP POST requests when events occur"
						checked={integration.webhookEnabled}
						onChange={(checked) => handleChange("webhookEnabled", checked)}
					/>

					{integration.webhookEnabled && (
						<>
							<div>
								<label
									htmlFor="webhook-url"
									className="block text-sm text-slate-400 mb-2"
								>
									Webhook URL
								</label>
								<div className="flex gap-2">
									<input
										type="url"
										id="webhook-url"
										value={integration.webhookUrl}
										onChange={(e) => handleChange("webhookUrl", e.target.value)}
										placeholder="https://your-webhook-url.com/endpoint"
										className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
									/>
									<button
										type="button"
										onClick={testWebhook}
										disabled={
											!integration.webhookUrl || testStatus === "testing"
										}
										className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
									>
										{testStatus === "testing" ? (
											"Testing..."
										) : testStatus === "success" ? (
											<>
												<CheckCircle className="w-4 h-4 text-green-400" />
												Success
											</>
										) : testStatus === "error" ? (
											<>
												<XCircle className="w-4 h-4 text-red-400" />
												Failed
											</>
										) : (
											"Test"
										)}
									</button>
								</div>
							</div>

							{/* Payload Preview */}
							<div>
								<p className="text-sm text-slate-400 mb-2">Payload Preview</p>
								<pre className="p-4 bg-slate-800 rounded-lg text-sm text-slate-300 overflow-x-auto">
									{`{
  "event": "session_complete",
  "timestamp": 1234567890,
  "data": {
    "taskId": "abc-123",
    "taskTitle": "Task name",
    "mode": "focus",
    "duration": 1500
  }
}`}
								</pre>
							</div>

							{/* Events */}
							<div>
								<p className="text-sm text-slate-400 mb-2">Webhook fires on:</p>
								<ul className="text-sm text-slate-300 space-y-1">
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
										Session complete (focus, break)
									</li>
									<li className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
										Task completed
									</li>
								</ul>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Future Integrations */}
			<div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
				<div className="flex items-center gap-2 text-slate-400">
					<ExternalLink className="w-4 h-4" />
					<span className="text-sm">More integrations coming soon...</span>
				</div>
			</div>
		</div>
	);
}

function ToggleRow({
	label,
	description,
	checked,
	onChange,
}: {
	label: string;
	description: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<p className="text-white font-medium">{label}</p>
				<p className="text-sm text-slate-400">{description}</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={`relative w-11 h-6 rounded-full transition-colors ${
					checked ? "bg-indigo-600" : "bg-slate-700"
				}`}
			>
				<span
					className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
						checked ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}
