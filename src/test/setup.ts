import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { afterEach, beforeEach } from "vitest";

// Mock crypto.randomUUID for consistent IDs in tests
let uuidCounter = 0;
Object.defineProperty(globalThis.crypto, "randomUUID", {
	value: () => {
		uuidCounter++;
		return `test-uuid-${uuidCounter.toString().padStart(4, "0")}`;
	},
	writable: true,
});

// Reset UUID counter before each test
beforeEach(() => {
	uuidCounter = 0;
});

// Clean up any open database connections after tests
afterEach(async () => {
	// Small delay to allow transactions to complete
	await new Promise((resolve) => setTimeout(resolve, 10));
});
