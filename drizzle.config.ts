import { defineConfig } from "drizzle-kit";

// Nur für die Entwicklung: `npm run db:generate` erzeugt aus src/db/schema.ts
// SQL-Migrationen im Ordner drizzle/. Die App spielt sie beim Start automatisch ein.
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: `${process.env.DATA_DIR ?? "./data"}/app.db` },
});
