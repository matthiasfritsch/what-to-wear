import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" packt nur die wirklich benötigten Dateien in .next/standalone.
  // Dadurch bleibt das Docker-Image klein (wichtig für den Pi).
  output: "standalone",
  // Native Module (C++-Addons) nicht bundeln, sondern zur Laufzeit laden.
  serverExternalPackages: ["better-sqlite3", "sharp"],
};

export default nextConfig;
