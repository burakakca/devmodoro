/// <reference types="vitest/config" />
import path from "node:path";
import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tsConfigPaths(),
		tailwindcss(),
		tanstackStart({
			router: {
				routesDirectory: "routes",
				generatedRouteTree: "./src/routeTree.gen.ts",
			},
		}),
		react(),
		netlify(),
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
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: ["node_modules/", "src/test/"],
		},
	},
});
