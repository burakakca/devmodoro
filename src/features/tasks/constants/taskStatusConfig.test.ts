import { CheckCircle2, Circle, Clock } from "lucide-react";
import { describe, expect, it } from "vitest";
import { TASK_STATUS_CONFIG, TASK_STATUS_ORDER } from "./taskStatusConfig";

describe("taskStatusConfig", () => {
	describe("TASK_STATUS_CONFIG", () => {
		it("has configuration for all task statuses", () => {
			expect(TASK_STATUS_CONFIG).toHaveProperty("todo");
			expect(TASK_STATUS_CONFIG).toHaveProperty("in-progress");
			expect(TASK_STATUS_CONFIG).toHaveProperty("done");
		});

		describe("todo status", () => {
			it("has correct configuration", () => {
				const config = TASK_STATUS_CONFIG.todo;
				expect(config.label).toBe("To Do");
				expect(config.icon).toBe(Circle);
				expect(config.color).toBe("text-theme-text-muted");
				expect(config.bg).toBe("bg-theme-bg-tertiary");
			});
		});

		describe("in-progress status", () => {
			it("has correct configuration", () => {
				const config = TASK_STATUS_CONFIG["in-progress"];
				expect(config.label).toBe("In Progress");
				expect(config.icon).toBe(Clock);
				expect(config.color).toBe("text-warning");
				expect(config.bg).toBe("bg-warning");
			});
		});

		describe("done status", () => {
			it("has correct configuration", () => {
				const config = TASK_STATUS_CONFIG.done;
				expect(config.label).toBe("Done");
				expect(config.icon).toBe(CheckCircle2);
				expect(config.color).toBe("text-success");
				expect(config.bg).toBe("bg-success");
			});
		});

		it("each status has all required fields", () => {
			for (const status of Object.keys(TASK_STATUS_CONFIG)) {
				const config =
					TASK_STATUS_CONFIG[status as keyof typeof TASK_STATUS_CONFIG];
				expect(config).toHaveProperty("label");
				expect(config).toHaveProperty("icon");
				expect(config).toHaveProperty("color");
				expect(config).toHaveProperty("bg");
				expect(typeof config.label).toBe("string");
				expect(typeof config.color).toBe("string");
				expect(typeof config.bg).toBe("string");
			}
		});
	});

	describe("TASK_STATUS_ORDER", () => {
		it("contains all statuses", () => {
			expect(TASK_STATUS_ORDER).toHaveLength(3);
			expect(TASK_STATUS_ORDER).toContain("todo");
			expect(TASK_STATUS_ORDER).toContain("in-progress");
			expect(TASK_STATUS_ORDER).toContain("done");
		});

		it("has correct order (todo -> in-progress -> done)", () => {
			expect(TASK_STATUS_ORDER[0]).toBe("todo");
			expect(TASK_STATUS_ORDER[1]).toBe("in-progress");
			expect(TASK_STATUS_ORDER[2]).toBe("done");
		});

		it("matches keys in TASK_STATUS_CONFIG", () => {
			const configKeys = Object.keys(TASK_STATUS_CONFIG);
			expect(TASK_STATUS_ORDER).toEqual(expect.arrayContaining(configKeys));
			expect(configKeys).toEqual(expect.arrayContaining(TASK_STATUS_ORDER));
		});
	});
});
