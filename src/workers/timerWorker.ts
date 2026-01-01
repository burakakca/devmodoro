let intervalId: number | null = null;

self.onmessage = (event: MessageEvent) => {
	const { type } = event.data;

	switch (type) {
		case "START":
			if (intervalId) return;
			intervalId = self.setInterval(() => {
				self.postMessage({ type: "TICK" });
			}, 1000);
			break;
		case "STOP":
			if (intervalId) {
				self.clearInterval(intervalId);
				intervalId = null;
			}
			break;
		case "RESET":
			if (intervalId) {
				self.clearInterval(intervalId);
				intervalId = null;
			}
			break;
	}
};
