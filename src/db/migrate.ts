import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { getDb, schema } from "./index";

/**
 * Wird einmal beim Serverstart aufgerufen (siehe src/instrumentation.ts):
 * 1. Spielt neue Migrationen aus drizzle/ ein, die DB ist danach immer aktuell.
 * 2. Legt beim allerersten Start den Haushalt und die Mitglieder an.
 */
export function migrateAndSeed() {
  const db = getDb();
  migrate(db, { migrationsFolder: path.join(/*turbopackIgnore: true*/ process.cwd(), "drizzle") });

  const existing = db.select().from(schema.households).limit(1).all();
  if (existing.length > 0) return;

  const names = (process.env.SEED_MEMBERS ?? "Matthias,Lisa")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);

  db.transaction((tx) => {
    const [household] = tx.insert(schema.households).values({ name: "Zuhause" }).returning().all();
    for (const name of names) {
      const [member] = tx.insert(schema.members).values({ householdId: household.id, name }).returning().all();
      tx.insert(schema.styleProfiles).values({ memberId: member.id }).run();
    }
  });
  console.log(`[db] Haushalt angelegt mit: ${names.join(", ")}`);
}
