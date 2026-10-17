/**
 * Datenmodell der App (Briefing 5.1 und 5.3).
 *
 * Für Designer gelesen: Jede `sqliteTable` ist eine Tabelle, jede Zeile darin
 * eine Spalte. Drizzle erzeugt daraus die SQL-Migrationen (Ordner drizzle/)
 * und liefert uns TypeScript-Typen, damit Tippfehler schon im Editor auffallen.
 *
 * Aufbau:  household ─┬─ member ─┬─ items
 *                     │          ├─ style_profile (genau eins pro Person)
 *                     │          ├─ outfits ── outfit_items ── items
 *                     │          ├─ wear_log   (was wann getragen wurde)
 *                     │          ├─ feedback   (Daumen hoch/runter)
 *                     │          └─ sessions   (Login-Cookies)
 */
import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

// Feste Wertelisten. Als Konstanten exportiert, damit UI und KI-Prompt
// dieselben Werte verwenden.
export const SLOTS = ["top", "bottom", "onepiece", "outerwear", "shoes", "bag", "accessory"] as const;
export type Slot = (typeof SLOTS)[number];

export const ITEM_STATUS = ["available", "laundry", "archived"] as const;
export type ItemStatus = (typeof ITEM_STATUS)[number];

export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export type Season = (typeof SEASONS)[number];

export type ItemColor = { hex: string; name: string };

const createdAt = () =>
  integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`);

export const households = sqliteTable("households", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: createdAt(),
});

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  householdId: integer("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Gehashte PIN bzw. Passwort. Leer, solange noch keine gesetzt wurde (Schritt 2).
  pinHash: text("pin_hash"),
  createdAt: createdAt(),
});

export const items = sqliteTable(
  "items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    // Standard privat. true = alle im Haushalt dürfen das Teil verwenden (z. B. ein Schal).
    sharedInHousehold: integer("shared_in_household", { mode: "boolean" }).notNull().default(false),

    slot: text("slot", { enum: SLOTS }).notNull(),
    subcategory: text("subcategory"),
    colors: text("colors", { mode: "json" }).$type<ItemColor[]>().notNull().default(sql`'[]'`),
    pattern: text("pattern"),
    material: text("material"),
    formality: integer("formality"), // 1 (sehr leger) bis 5 (sehr formell)
    warmth: integer("warmth"), // 1 (sehr leicht) bis 5 (sehr warm)
    seasons: text("seasons", { mode: "json" }).$type<Season[]>().notNull().default(sql`'[]'`),
    styleTags: text("style_tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    status: text("status", { enum: ITEM_STATUS }).notNull().default("available"),

    // Dateien liegen im Bilder-Ordner (Docker Volume), hier nur der relative Pfad.
    imagePath: text("image_path").notNull(),
    thumbPath: text("thumb_path").notNull(),
    // Pixelmaße nach dem Trimmen. Die Collage braucht das Seitenverhältnis.
    width: integer("width").notNull(),
    height: integer("height").notNull(),

    aiTaggedAt: integer("ai_tagged_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => [index("items_member_idx").on(t.memberId), index("items_slot_idx").on(t.slot)],
);

export type StyleRule = { text: string };

export const styleProfiles = sqliteTable("style_profiles", {
  memberId: integer("member_id").primaryKey().references(() => members.id, { onDelete: "cascade" }),
  // Antworten aus dem Onboarding, frei strukturiert (Frage-ID -> Antwort).
  answers: text("answers", { mode: "json" }).$type<Record<string, string | string[]>>().notNull().default(sql`'{}'`),
  // Harte Regeln, z. B. "keine Sneaker bei Kundenterminen".
  rules: text("rules", { mode: "json" }).$type<StyleRule[]>().notNull().default(sql`'[]'`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const outfits = sqliteTable(
  "outfits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    // Für welchen Tag der Vorschlag gedacht war, als YYYY-MM-DD.
    forDate: text("for_date").notNull(),
    occasion: text("occasion"),
    // Ein Satz Begründung von der KI.
    reason: text("reason"),
    source: text("source", { enum: ["ai", "manual"] }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("outfits_member_date_idx").on(t.memberId, t.forDate)],
);

export const outfitItems = sqliteTable(
  "outfit_items",
  {
    outfitId: integer("outfit_id").notNull().references(() => outfits.id, { onDelete: "cascade" }),
    itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
    slot: text("slot", { enum: SLOTS }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.outfitId, t.itemId] })],
);

export const wearLog = sqliteTable(
  "wear_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
    outfitId: integer("outfit_id").notNull().references(() => outfits.id, { onDelete: "cascade" }),
    wornOn: text("worn_on").notNull(), // YYYY-MM-DD
    createdAt: createdAt(),
  },
  (t) => [index("wear_log_member_date_idx").on(t.memberId, t.wornOn)],
);

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  outfitId: integer("outfit_id").notNull().references(() => outfits.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // +1 Daumen hoch, -1 Daumen runter
  createdAt: createdAt(),
});

export const sessions = sqliteTable("sessions", {
  // Zufälliger Token, steckt im Session-Cookie.
  id: text("id").primaryKey(),
  memberId: integer("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: createdAt(),
});
