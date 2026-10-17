import path from "node:path";

// Alle Laufzeitdaten (Datenbank + Bilder) liegen unter DATA_DIR.
// Lokal ist das ./data, im Docker-Container /data (ein Volume).
// Für ein Backup reicht es, genau diesen Ordner zu sichern.
export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? "./data");
export const DB_PATH = path.join(DATA_DIR, "app.db");
export const IMAGES_DIR = path.join(DATA_DIR, "images");
