import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { timerModeToSessionMode } from "@/features/timer/lib/modeConverter";
import type { TimerMode } from "@/features/timer/machines/timerMachine";
import {
	generateSessionComment,
	postIssueComment,
} from "../services/githubCommentService";

interface SessionLogData {
	mode: TimerMode;
	duration: number;
	taskTitle?: string;
	externalLink?: string;
}

interface UseGitHubSessionLoggerOptions {
	githubToken: string;
	isConnected: boolean;
	autoPost: boolean;
}

export const useGitHubSessionLogger = ({
	githubToken,
	isConnected,
	autoPost,
}: UseGitHubSessionLoggerOptions) => {
	const [showPrompt, setShowPrompt] = useState(false);
	const lastSessionRef = useRef<SessionLogData | null>(null);

	const postCommentMutation = useMutation({
		mutationFn: async ({
			token,
			issueUrl,
			comment,
		}: {
			token: string;
			issueUrl: string;
			comment: string;
		}) => {
			const result = await postIssueComment(token, issueUrl, comment);
			if (!result.success) {
				throw new Error(result.error ?? "Failed to post comment");
			}
			return result;
		},
		onSuccess: () => {
			setTimeout(() => {
				setShowPrompt(false);
				postCommentMutation.reset();
			}, 2000);
		},
	});

	const logSession = useCallback(
		(data: SessionLogData) => {
			if (!data.externalLink || !isConnected) return;

			lastSessionRef.current = data;
			const sessionMode = timerModeToSessionMode(data.mode);

			if (autoPost) {
				const comment = generateSessionComment({
					duration: data.duration,
					mode: sessionMode,
					taskTitle: data.taskTitle,
				});
				postCommentMutation.mutate({
					token: githubToken,
					issueUrl: data.externalLink,
					comment,
				});
			} else {
				setShowPrompt(true);
				postCommentMutation.reset();
			}
		},
		[isConnected, autoPost, githubToken, postCommentMutation],
	);

	const confirmLog = useCallback(() => {
		const session = lastSessionRef.current;
		if (!session?.externalLink || !githubToken) return;

		const comment = generateSessionComment({
			duration: session.duration,
			mode: timerModeToSessionMode(session.mode),
			taskTitle: session.taskTitle,
		});

		postCommentMutation.mutate({
			token: githubToken,
			issueUrl: session.externalLink,
			comment,
		});
	}, [githubToken, postCommentMutation]);

	const dismissPrompt = useCallback(() => {
		setShowPrompt(false);
		postCommentMutation.reset();
		lastSessionRef.current = null;
	}, [postCommentMutation]);

	return {
		showPrompt,
		isPending: postCommentMutation.isPending,
		isSuccess: postCommentMutation.isSuccess,
		isError: postCommentMutation.isError,
		error: postCommentMutation.error,
		logSession,
		confirmLog,
		dismissPrompt,
	};
};
