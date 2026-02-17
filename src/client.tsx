import { registerSW } from "virtual:pwa-register";
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { requestPersistence } from "./lib/storage";

import "./index.css";

registerSW({
	immediate: true,
	onNeedRefresh() {
		window.location.reload();
	},
	onOfflineReady() {
		console.log("App ready to work offline");
	},
});

requestPersistence().catch(console.error);

hydrateRoot(
	document,
	<StrictMode>
		<StartClient />
	</StrictMode>,
);
