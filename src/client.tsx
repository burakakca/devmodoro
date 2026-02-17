import { StartClient } from "@tanstack/react-start/client";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { requestPersistence } from "./lib/storage";

import "./index.css";

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register("/sw.js").catch(console.error);
	});
}

requestPersistence().catch(console.error);

hydrateRoot(
	document,
	<StrictMode>
		<StartClient />
	</StrictMode>,
);
