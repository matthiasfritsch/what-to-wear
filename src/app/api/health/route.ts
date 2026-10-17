import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

// Für den Docker-Healthcheck: antwortet nur mit 200, wenn auch die Datenbank erreichbar ist.
export function GET() {
  getDb().run(sql`select 1`);
  return Response.json({ ok: true });
}
