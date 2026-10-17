import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DATA_DIR, DB_PATH } from "@/lib/config";
import * as schema from "./schema";

function open() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const sqlite = new Database(DB_PATH);
  // WAL: schneller und robuster bei gleichzeitigem Lesen und Schreiben.
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

// Eine einzige Verbindung für den ganzen Prozess, erst beim ersten Zugriff geöffnet
// (nicht schon beim Build). Der globalThis-Trick sorgt dafür, dass im Dev-Modus
// beim Hot Reload nicht ständig neue Verbindungen entstehen.
const g = globalThis as unknown as { __db?: ReturnType<typeof open> };
export function getDb() {
  return (g.__db ??= open());
}
export { schema };
