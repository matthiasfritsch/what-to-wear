// Next.js ruft register() genau einmal beim Serverstart auf.
// Wir nutzen das, um die Datenbank vorzubereiten, bevor die erste Anfrage kommt.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrateAndSeed } = await import("./db/migrate");
    migrateAndSeed();
  }
}
