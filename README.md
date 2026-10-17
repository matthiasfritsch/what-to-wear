# What to wear

Eine kleine Web-App (PWA), die morgens aus dem echten Kleiderschrank Outfits vorschlägt und sie als Flat-Lay-Collage zeigt. Läuft komplett zuhause: erst am Mac, später auf einem Raspberry Pi oder Mini-PC. Das ausführliche Briefing steht in [CLAUDE.md](CLAUDE.md).

Aktueller Stand: **Schritt 1 (Setup)** ist fertig. Die App startet, legt die Datenbank an, zeigt das Grundlayout und die Tab-Navigation. Upload, Collage und KI folgen in den nächsten Schritten.

## Schnellstart mit Docker (empfohlen)

Voraussetzung ist [Docker Desktop](https://www.docker.com/products/docker-desktop/) auf dem Mac.

```bash
cp .env.example .env        # einmalig, Werte bei Bedarf anpassen
docker compose up -d --build
```

Danach läuft die App unter <http://localhost:3000>. Beim ersten Start legt sie den Ordner `data/` an, darin liegen die Datenbank (`app.db`) und später die Bilder (`images/`).

Nützliche Befehle:

| Was | Befehl |
|---|---|
| Logs anschauen | `docker compose logs -f` |
| Stoppen | `docker compose down` |
| Nach Code-Änderungen neu bauen | `docker compose up -d --build` |
| Status und Healthcheck | `docker compose ps` |

## Entwickeln ohne Docker

Für schnelles Arbeiten am UI ist der Dev-Modus angenehmer, weil Änderungen sofort im Browser erscheinen (Hot Reload). Dafür braucht es Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

Der Dev-Server nutzt ebenfalls `./data/app.db`. Am besten nicht gleichzeitig Docker und Dev-Server laufen lassen, sonst greifen beide auf dieselbe Datei zu.

## Projektstruktur

```
src/
  app/                 Seiten (jeder Ordner = eine URL)
    page.tsx           "Heute" mit den Outfit-Vorschlägen
    schrank/           Schrankansicht
    profil/            Profil und Haushalt
    api/health/        Gesundheitscheck für Docker
  components/
    layout/            App-Rahmen: TabBar, PageHeader
    ui/                Kleine wiederverwendbare Bausteine: ListRow, Card, EmptyState
  styles/tokens.css    Design Tokens (die einzige Quelle für Farben, Abstände usw.)
  app/globals.css      Mapping der Tokens auf Tailwind-Klassen
  db/schema.ts         Datenmodell
  db/migrate.ts        Spielt beim Start Migrationen ein und legt den Haushalt an
drizzle/               Generierte SQL-Migrationen (nicht von Hand ändern)
data/                  Laufzeitdaten, nicht im Git (Datenbank + Bilder)
```

## Design Tokens

Alle visuellen Werte stehen in [`src/styles/tokens.css`](src/styles/tokens.css), aufgeteilt in zwei Ebenen: **Primitives** (`--ds-neutral-100`) mit den rohen Werten und **Semantic** (`--ds-color-surface`) mit der Bedeutung. Komponenten verwenden nur semantische Tokens.

In [`src/app/globals.css`](src/app/globals.css) werden die Tokens auf Tailwind gemappt. Daraus entstehen Klassen wie:

| Token | Tailwind-Klasse |
|---|---|
| `--ds-color-surface-sunken` | `bg-surface-sunken` |
| `--ds-color-text-secondary` | `text-secondary` |
| `--ds-color-border-subtle` | `border-subtle` |
| `--ds-radius-card` | `rounded-card` |
| `--ds-text-headline` | `text-headline` |
| `--ds-shadow-card` | `shadow-card` |
| `--ds-space-gutter` | `px-gutter` |

Spacing läuft über ein 4er-Raster: `p-1` = 4px, `p-4` = 16px, `gap-3` = 12px. Tailwinds Standardfarben, Radien, Schatten und Schriftgrößen sind bewusst abgeschaltet. `bg-red-500` oder `rounded-xl` funktionieren also nicht, damit sich keine Rohwerte einschleichen. Wer einen neuen Wert braucht, legt ihn als Token an.

## Datenmodell

Ein Haushalt hat Mitglieder, jedes Mitglied hat eigene Teile, ein Style-Profil, Outfits, eine Tragehistorie und Feedback. Teile sind standardmäßig privat und lassen sich als "im Haushalt geteilt" markieren. Details mit Kommentaren in [`src/db/schema.ts`](src/db/schema.ts).

Wenn sich das Schema ändert, erzeugt `npm run db:generate` eine neue Migration im Ordner `drizzle/`. Die App spielt sie beim nächsten Start automatisch ein. Mit `npm run db:studio` lässt sich die Datenbank im Browser anschauen.

Die Mitglieder, die beim allerersten Start angelegt werden, stehen in `.env` unter `SEED_MEMBERS`. Yuna kommt später dazu, das wird eine Funktion im Profil.

## Ressourcen

Der Container braucht im Leerlauf rund 55 MB RAM und ist auf 768 MB begrenzt. Das Image ist etwa 430 MB groß. Docker baut automatisch für die Architektur des Rechners, auf dem `docker compose up --build` läuft: arm64 auf Apple Silicon und dem Pi, amd64 auf einem Intel-Mini-PC.

## Roadmap

1. ~~Setup: Docker Compose, Next.js, SQLite, Tokens, Grundlayout~~
2. Erfassen: Login, Upload, Verarbeitung mit sharp, KI-Tagging, Schrankansicht
3. Collage mit manueller Auswahl und tunebaren Layout-Templates
4. Vorschläge: Vorfilter, LLM, Validierung, 2×2-Ansicht
5. Profil, Feedback, Historie, PWA
6. Deploy auf Pi oder Mini-PC mit Tailscale, Backup-Skript, Kostenübersicht

Deploy, Backup und laufende Kosten werden in Schritt 6 hier dokumentiert.
