import Dexie, { type EntityTable } from "dexie";
import type { Session, Settings, Task } from "../types";

const db = new Dexie("DevmodoroDB") as Dexie & {
	tasks: EntityTable<Task, "id">;
	sessions: EntityTable<Session, "id">;
	settings: EntityTable<Settings, "id">;
};

// Schema declaration:
db.version(1).stores({
	tasks: "id, title, status, projectId, createdAt",
	sessions: "id, taskId, startTime, mode",
});

// Version 2: Add settings table
db.version(2).stores({
	tasks: "id, title, status, projectId, createdAt",
	sessions: "id, taskId, startTime, mode",
	settings: "id",
});

export { db };
