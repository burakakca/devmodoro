import { useMutation } from "@tanstack/react-query";
import {
	CheckCircle,
	ExternalLink,
	Github,
	Loader2,
	LogOut,
	Webhook,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import {
	createDisconnectedGitHubSettings,
	createGitHubSettings,
	maskToken,
	validateGitHubToken,
} from "@/features/github/services/githubService";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { ToggleRow } from "./ToggleRow";

export function IntegrationSettings() {
	const { settings, updateSettings } = useSettings();
	const { integration } = settings;

	// GitHub state
	const [tokenInput, setTokenInput] = useState("");

	// Mutation for connecting GitHub
	const connectGitHubMutation = useMutation({
		mutationFn: async (token: string) => {
			const result = await validateGitHubToken(token);
			if (!result.isValid || !result.user) {
				throw new Error(result.error ?? "Failed to connect");
			}
			return result.user;
		},
		onSuccess: (user, token) => {
			const githubSettings = createGitHubSettings(token, user);
			updateSettings({
				integration: { ...integration, github: githubSettings },
			});
			setTokenInput("");
		},
	});

	// Mutation for testing webhook
	const testWebhookMutation = useMutation({
		mutationFn: async (webhookUrl: string) => {
			const response = await fetch(webhookUrl, {
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
			if (!response.ok) {
				throw new Error("Webhook test failed");
			}
			return response;
		},
		onSettled: () => {
			setTimeout(() => testWebhookMutation.reset(), 3000);
		},
	});

	const handleChange = (
		key: keyof typeof integration,
		value: string | boolean,
	) => {
		updateSettings({
			integration: { ...integration, [key]: value },
		});
	};

	const connectGitHub = () => {
		if (!tokenInput.trim()) return;
		connectGitHubMutation.mutate(tokenInput);
	};

	const disconnectGitHub = () => {
		updateSettings({
			integration: {
				...integration,
				github: createDisconnectedGitHubSettings(),
			},
		});
		connectGitHubMutation.reset();
	};

	const testWebhook = () => {
		if (!integration.webhookUrl) return;
		testWebhookMutation.mutate(integration.webhookUrl);
	};

	return (
		<div className="space-y-8">
			{/* GitHub */}
			<fieldset>
				<div className="flex items-center gap-2 mb-4">
					<Github className="w-5 h-5 text-primary" aria-hidden="true" />
					<legend className="text-lg font-medium text-theme-text">
						GitHub
					</legend>
				</div>

				<div className="space-y-4">
					{integration.github.isConnected ? (
						<>
							<output
								className="block p-4 bg-theme-bg-tertiary rounded-lg"
								aria-label={`Connected to GitHub as ${integration.github.username}`}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"
											aria-hidden="true"
										>
											<Github
												className="w-5 h-5 text-primary"
												aria-hidden="true"
											/>
										</div>
										<div>
											<p className="text-theme-text font-medium">
												@{integration.github.username}
											</p>
											<p className="text-sm text-theme-text-secondary">
												Token: {maskToken(integration.github.token)}
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={disconnectGitHub}
										aria-label={`Disconnect GitHub account ${integration.github.username}`}
										className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500"
									>
										<LogOut className="w-4 h-4" aria-hidden="true" />
										Disconnect
									</button>
								</div>
							</output>

							<ToggleRow
								label="Auto-post to GitHub"
								description="Automatically log session comments to linked GitHub issues"
								checked={integration.autoPostToGitHub}
								onChange={(checked) =>
									handleChange("autoPostToGitHub", checked)
								}
							/>
						</>
					) : (
						<>
							<p className="text-sm text-theme-text-secondary">
								Connect your GitHub account to sync issues and log session
								comments.
							</p>
							<div>
								<label
									htmlFor="github-token"
									className="block text-sm text-theme-text-secondary mb-2"
								>
									Personal Access Token
								</label>
								<div className="flex gap-2">
									<input
										type="password"
										id="github-token"
										value={tokenInput}
										onChange={(e) => {
											setTokenInput(e.target.value);
											if (connectGitHubMutation.isError) {
												connectGitHubMutation.reset();
											}
										}}
										placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
										className={`flex-1 px-3 py-2 bg-theme-bg-tertiary border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-primary ${
											connectGitHubMutation.isError
												? "border-red-400"
												: "border-theme-border"
										}`}
										aria-invalid={connectGitHubMutation.isError}
										aria-describedby={
											connectGitHubMutation.isError
												? "github-error github-help"
												: "github-help"
										}
									/>
									<button
										type="button"
										onClick={connectGitHub}
										disabled={
											!tokenInput.trim() || connectGitHubMutation.isPending
										}
										aria-busy={connectGitHubMutation.isPending}
										aria-label={
											connectGitHubMutation.isPending
												? "Connecting to GitHub..."
												: "Connect to GitHub"
										}
										className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
									>
										{connectGitHubMutation.isPending ? (
											<>
												<Loader2
													className="w-4 h-4 animate-spin"
													aria-hidden="true"
												/>
												Connecting...
											</>
										) : (
											"Connect"
										)}
									</button>
								</div>
								{connectGitHubMutation.isError && (
									<p
										id="github-error"
										role="alert"
										aria-live="polite"
										className="mt-2 text-sm text-red-400 flex items-center gap-1"
									>
										<XCircle className="w-4 h-4" aria-hidden="true" />
										{connectGitHubMutation.error.message}
									</p>
								)}
								<p
									id="github-help"
									className="mt-2 text-xs text-theme-text-muted"
								>
									Create a token at{" "}
									<a
										href="https://github.com/settings/tokens/new?description=Devmodoro&scopes=repo"
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										GitHub Settings
									</a>{" "}
									with{" "}
									<code className="bg-theme-bg-tertiary px-1 rounded">
										repo
									</code>{" "}
									scope.
								</p>
							</div>
						</>
					)}
				</div>
			</fieldset>

			{/* Webhook */}
			<fieldset>
				<div className="flex items-center gap-2 mb-4">
					<Webhook className="w-5 h-5 text-primary" aria-hidden="true" />
					<legend className="text-lg font-medium text-theme-text">
						Webhook
					</legend>
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
									className="block text-sm text-theme-text-secondary mb-2"
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
										className="flex-1 px-3 py-2 bg-theme-bg-tertiary border border-theme-border rounded-lg text-theme-text placeholder-theme-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
									/>
									<button
										type="button"
										onClick={testWebhook}
										disabled={
											!integration.webhookUrl || testWebhookMutation.isPending
										}
										className="px-4 py-2 bg-theme-bg-tertiary hover:bg-theme-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-theme-text rounded-lg transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
									>
										{testWebhookMutation.isPending ? (
											"Testing..."
										) : testWebhookMutation.isSuccess ? (
											<>
												<CheckCircle
													className="w-4 h-4 text-green-400"
													aria-hidden="true"
												/>
												Success
											</>
										) : testWebhookMutation.isError ? (
											<>
												<XCircle
													className="w-4 h-4 text-red-400"
													aria-hidden="true"
												/>
												Failed
											</>
										) : (
											"Test"
										)}
									</button>
								</div>
							</div>

							{/* Payload Preview */}
							<section aria-labelledby="payload-preview-title">
								<p
									id="payload-preview-title"
									className="text-sm text-theme-text-secondary mb-2"
								>
									Payload Preview
								</p>
								<pre className="p-4 bg-theme-bg-tertiary rounded-lg text-sm text-theme-text-secondary overflow-x-auto">
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
							</section>

							{/* Events */}
							<section aria-labelledby="webhook-events-title">
								<p
									id="webhook-events-title"
									className="text-sm text-theme-text-secondary mb-2"
								>
									Webhook fires on:
								</p>
								<ul className="text-sm text-theme-text-secondary space-y-1">
									<li className="flex items-center gap-2">
										<span
											className="w-1.5 h-1.5 bg-primary rounded-full"
											aria-hidden="true"
										/>
										Session complete (focus, break)
									</li>
									<li className="flex items-center gap-2">
										<span
											className="w-1.5 h-1.5 bg-primary rounded-full"
											aria-hidden="true"
										/>
										Task completed
									</li>
								</ul>
							</section>
						</>
					)}
				</div>
			</fieldset>

			{/* Future Integrations */}
			<div className="p-4 bg-theme-bg-tertiary/50 rounded-lg border border-theme-border border-dashed">
				<div className="flex items-center gap-2 text-theme-text-muted">
					<ExternalLink className="w-4 h-4" aria-hidden="true" />
					<span className="text-sm">More integrations coming soon...</span>
				</div>
			</div>
		</div>
	);
}
