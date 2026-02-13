/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		tanstackRouter({
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
		}),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"favicon.svg",
				"robots.txt",
				"audio/*.mp3",
				"audio/*.wav",
			],
			manifest: {
				name: "Devmodoro",
				short_name: "Devmodoro",
				description:
					"A developer-focused productivity station with Pomodoro timer and GitHub integration.",
				theme_color: "#1e1b4b",
				background_color: "#1e1b4b",
				display: "standalone",
				icons: [
					{
						src: "favicon.svg",
						sizes: "any",
						type: "image/svg+xml",
						purpose: "any maskable",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,mp3,wav}"],
				maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6MB
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
		rollupOptions: {
			output: {
				manualChunks: {
					"vendor-react": ["react", "react-dom", "react/jsx-runtime"],
					"vendor-ui": ["framer-motion", "lucide-react"],
					"vendor-utils": ["howler", "dexie", "dexie-react-hooks"],
				},
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/test/"],
		},
	},
});
