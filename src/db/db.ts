import Dexie, { type EntityTable } from "dexie";
import type { Session, Task } from "../types";

const db = new Dexie("FlowBaseDB") as Dexie & {
	tasks: EntityTable<Task, "id">;
	sessions: EntityTable<Session, "id">;
};

// Schema declaration:
db.version(1).stores({
	tasks: "id, title, status, projectId, createdAt",
	sessions: "id, taskId, startTime, mode",
});

export { db };