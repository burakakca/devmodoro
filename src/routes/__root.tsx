/// <reference types="vite/client" />
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AppProviders } from "@/AppProviders";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { NotFoundPage } from "@/components/ui/NotFoundPage";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				name: "theme-color",
				content: "#1e1b4b",
			},
			{
				name: "mobile-web-app-capable",
				content: "yes",
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent",
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Devmodoro",
			},
			{
				name: "google-site-verification",
				content: "gIM3YiFIX5iMDG7VXiAhcofdD-Yw9Pv0PL4EJ6XCEhA",
			},
			{
				name: "description",
				content:
					"Free Pomodoro timer for developers. Track GitHub issues, mix ambient sounds, and boost your coding productivity with Devmodoro's focus timer.",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "Devmodoro - Free Pomodoro Timer for Developers",
			},
			{
				property: "og:description",
				content:
					"Boost your coding productivity with a free Pomodoro timer featuring GitHub integration, ambient sounds, and analytics.",
			},
			{
				property: "og:image",
				content: "https://devmodoro.netlify.app/favicon.svg",
			},
			{
				property: "og:site_name",
				content: "Devmodoro",
			},
			{
				property: "twitter:card",
				content: "summary_large_image",
			},
			{
				property: "twitter:title",
				content: "Devmodoro - Free Pomodoro Timer for Developers",
			},
			{
				property: "twitter:description",
				content:
					"Boost your coding productivity with a free Pomodoro timer featuring GitHub integration and ambient sounds.",
			},
			{
				property: "twitter:image",
				content: "https://devmodoro.netlify.app/favicon.svg",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "manifest",
				href: "/manifest.json",
			},
		],
	}),
	errorComponent: ErrorPage,
	notFoundComponent: NotFoundPage,
	shellComponent: RootShell,
	component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<title>Devmodoro - Free Pomodoro Timer for Developers</title>
			</head>
			<body>
				{children}
				<Scripts />
				<TanStackRouterDevtools position="bottom-right" />
			</body>
		</html>
	);
}

function RootComponent() {
	return (
		<AppProviders>
			<Outlet />
		</AppProviders>
	);
}
