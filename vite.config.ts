/// <reference types="vitest/config" />
import path from "node:path";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		!process.env.VITEST &&
			tanstackStart({
				router: {
					routesDirectory: "routes",
					generatedRouteTree: "./routeTree.gen.ts",
				},
			}),
		react(),
		tsConfigPaths(),
		tailwindcss(),
		netlify(),
		VitePWA({
			registerType: "autoUpdate",
			injectRegister: null,
			manifestFilename: "manifest.json",
			devOptions: {
				enabled: true,
				type: "module",
			},
			includeAssets: [
				"favicon.svg",
				"vite.svg",
				"robots.txt",
				"audio/*.mp3",
				"audio/*.wav",
			],
			manifest: {
				name: "Devmodoro - Free Pomodoro Timer",
				short_name: "Devmodoro",
				description:
					"Free Pomodoro timer for developers with GitHub integration and ambient sounds.",
				theme_color: "#1e1b4b",
				background_color: "#1e1b4b",
				display: "standalone",
				start_url: "/",
				scope: "/",
				orientation: "any",
				icons: [
					{
						src: "favicon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
				],
				categories: ["productivity", "utilities"],
				shortcuts: [
					{
						name: "Start Timer",
						short_name: "Timer",
						description: "Start a new Pomodoro session",
						url: "/",
						icons: [{ src: "favicon.svg", sizes: "any" }],
					},
					{
						name: "View Analytics",
						short_name: "Analytics",
						description: "View your productivity analytics",
						url: "/analytics",
						icons: [{ src: "favicon.svg", sizes: "any" }],
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff,woff2}"],
				navigateFallback: null,
				skipWaiting: true,
				clientsClaim: true,
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/api\.github\.com\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "github-api-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24, // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /\.(?:mp3|wav)$/i,
						handler: "CacheFirst",
						options: {
							cacheName: "audio-cache",
							expiration: {
								maxEntries: 20,
								maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: ({ request }) => request.destination === "document",
						handler: "NetworkFirst",
						options: {
							cacheName: "pages-cache",
						},
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		target: "es2022",
		minify: "esbuild" as const,
		chunkSizeWarningLimit: 500,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes("node_modules")) {
						if (id.includes("framer-motion")) {
							return "framer-motion";
						}
						if (id.includes("recharts")) {
							return "recharts";
						}
						if (id.includes("howler")) {
							return "howler";
						}
						if (id.includes("xstate") || id.includes("@xstate")) {
							return "xstate";
						}
						if (id.includes("dexie")) {
							return "dexie";
						}
						if (id.includes("lucide-react")) {
							return "lucide";
						}
						if (id.includes("@tanstack/react-query")) {
							return "react-query";
						}
					}
				},
			},
		},
	},
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/test/"],
		},
	},
});
