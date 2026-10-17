# Mehrstufiger Build: In den ersten Stufen wird gebaut, ins finale Image kommt
# nur das fertige Ergebnis. Läuft auf amd64 (Mac/Mini-PC) und arm64 (Pi, Apple Silicon),
# Docker nimmt automatisch die passende Variante des Basis-Images.

# ── 1. Abhängigkeiten installieren ──────────────────────────────
FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: better-sqlite3 und sharp bringen fertige Binaries für
# amd64 und arm64 mit. Ohne den Schalter würde npm trotzdem versuchen zu
# kompilieren und dafür Python und einen C++-Compiler verlangen.
RUN npm ci --ignore-scripts

# ── 2. App bauen ────────────────────────────────────────────────
FROM node:24-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── 3. Schlankes Laufzeit-Image ─────────────────────────────────
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/drizzle ./drizzle
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
