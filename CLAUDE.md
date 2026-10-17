# Outfit App: Briefing für Claude Code

Owner: Matthias Fritsch (Product Design Lead mit Design-System-Hintergrund, versteht Code, ist aber kein Developer).
Bitte Entscheidungen und Code so erklären, dass ein Designer folgen kann. Kommunikation auf Deutsch, du-Form.

## 1. Ziel

Eine Web-App (PWA), die morgens auf Basis meines **echten** Kleiderschranks Outfits vorschlägt und sie als **Collage** zeigt, damit ich nicht lange überlegen muss. Vorbilder sind Fits (fits-app.com) und Ensembl. Die Referenz für die Collage-Ansicht ist der Screenshot unter `docs/reference.png`.

Nutzer sind Matthias und Lisa, später kommt Yuna dazu. Jede Person hat einen eigenen Schrank und ein eigenes Style-Profil, alle gehören zu einem Haushalt.

## 2. Harte Rahmenbedingungen

1. **Zuerst lokal bauen, danach auf den eigenen Mini-Server.** Entwickelt wird auf dem Mac. Später läuft alles auf einem Raspberry Pi 5 (4 GB) oder einem gebrauchten Mini-PC zuhause. Deshalb von Anfang an Docker Compose verwenden, mit Images für `linux/arm64` und `linux/amd64`. Lokal und auf dem Server läuft dasselbe Setup.
2. **Keine Cloud-Plattformen** wie Vercel oder Supabase. Keine native App, kein Apple Developer Account. Es wird eine PWA, die man über "Zum Home-Bildschirm" installiert.
3. **Laufende Kosten von fast null.** Einzige laufende Kosten sind KI-Aufrufe (Centbeträge). Kein Gratis-Tarif, bei dem der Anbieter die Daten fürs Training verwenden darf, denn es geht um Fotos aus dem Familienhaushalt.
4. **Klein und schlank.** Der Server muss auf 1 bis 2 GB RAM laufen. Möglichst nur ein App-Container.
5. **Bilder kommen bereits freigestellt rein.** Das Freistellen passiert außerhalb der App, zum Beispiel mit "Motiv freistellen" in iPhone Fotos oder mit rembg am Mac. Die App nimmt nur fertige PNG- oder WebP-Cutouts an.
6. **Nur echte Kleidungsstücke.** Keine generierten Teile, kein Virtual Try-on.

## 3. Stack

| Bereich | Wahl | Warum |
|---|---|---|
| App | Next.js (App Router) + TypeScript | eine Sprache für Frontend und Backend |
| UI | Tailwind + Design Tokens als CSS Variables | siehe Abschnitt 7 |
| Datenbank | SQLite (Drizzle ORM) | eine Datei, kein eigener DB-Server, einfaches Backup |
| Bilder | Dateisystem (Docker Volume), Verarbeitung mit `sharp` | kein S3 nötig |
| Login | Einfacher Login pro Haushaltsmitglied (Passwort oder PIN), Session-Cookie | Zugriff läuft ohnehin nur über Tailscale |
| KI | Günstiges Vision-Modell über OpenAI-kompatible API, zum Beispiel Gemini Flash oder OpenRouter, bezahlter Tarif | Key nur serverseitig |
| Wetter | Open-Meteo | gratis, kein Key |
| Fernzugriff | Tailscale (Personal-Plan gratis) mit `tailscale serve` für HTTPS | nichts öffentlich im Internet, HTTPS ist Pflicht für PWA und Service Worker |

Begründung: Ein Container mit einer Sprache und einer DB-Datei ist für 3 Nutzer genug. Matthias soll UI und Collage selbst anpassen können, ohne zwei Stacks zu verstehen.

## 4. Bestehende Projekte: Als Vorlage nutzen, nicht übernehmen

Stand der Recherche ist Oktober 2026. Die Angaben bitte im jeweiligen Repo prüfen.

**wardrowbe** (https://github.com/Anyesh/wardrowbe, MIT, ca. 600 Stars). Das Projekt kann funktional fast alles: KI-Tagging, Vorschläge nach Wetter und Anlass, Familienprofile, Tragehistorie. Für unseren Zweck ist es aber zu groß aufgesetzt. Es besteht aus Next.js plus FastAPI (Python), PostgreSQL, Redis und einem Worker, braucht mindestens 4 GB RAM und hat keine Collage-Ansicht.
→ **Übernehmen (MIT, mit Lizenzhinweis):** Tagging-Schema, Prompts für Tagging und Vorschläge, Vorfilter-Logik, Open-Meteo-Integration. Diese Teile in TypeScript neu schreiben.

**Libre Closet** (https://github.com/lazztech/Libre-Closet, **AGPL-3.0**). Hat eine PWA, einen Outfit-Builder, geteilte Schränke und Wochenplanung, aber keine KI.
→ Nur als Vorlage für UX und Features nutzen. **Keinen Code kopieren**, denn AGPL würde auf das ganze Projekt durchschlagen.

**closetmix** (prashith-shetty/closetmix, proprietäre Lizenz). Interessant ist die hybride Engine: Regeln für Farbharmonie kombiniert mit einem LLM. Nur die Idee übernehmen.

Optionaler Spike (max. 1 Abend): wardrowbe lokal per Docker starten, um die Qualität der Vorschläge als Vergleich zu sehen. Das ist keine Voraussetzung.

## 5. Kernfeatures (MVP)

### 5.1 Datenmodell
Ein `household` hat `members` (Matthias, Lisa, Yuna). Jedes Mitglied hat `items`, `style_profile`, `outfits`, `wear_log` und `feedback`. Items sind standardmäßig privat und lassen sich optional als "im Haushalt geteilt" markieren, zum Beispiel ein Schal.

### 5.2 Erfassen
Upload von PNG oder WebP, auch mehrere Dateien auf einmal fürs erste Befüllen. Serverseitig mit `sharp`:

1. Transparenten Rand wegschneiden (trim), damit alle Teile in der Collage gleich skaliert werden.
2. Auf maximal ca. 1000 px verkleinern.
3. Als WebP speichern und zusätzlich ein Thumbnail erzeugen.

Danach folgt ein einmaliger KI-Aufruf fürs Tagging. Die Tags lassen sich in der UI korrigieren.

### 5.3 Item-Tags
- **Slot:** top, bottom, onepiece, outerwear, shoes, bag, accessory
- **Unterkategorie**
- **Farben** (Hex und Name) und Muster
- **Material**
- **Formalität** von 1 bis 5 und **Wärmegrad** von 1 bis 5
- **Saisons**
- **Style-Tags**
- **Status:** verfügbar, Wäsche oder archiviert

### 5.4 Style-Profil
Ein kurzes Onboarding mit wenigen Fragen. Dazu harte Regeln, frei formuliert oder strukturiert, etwa "keine Sneaker bei Kundenterminen".

### 5.5 Vorschläge
1. **Deterministischer Vorfilter:** Wetter von heute, Anlass, nur verfügbare Teile, nicht in den letzten X Tagen getragen, "muss rein"-Teil, harte Regeln.
2. **LLM:** bekommt nur die gefilterte Liste als Text (keine Bilder) und liefert 4 Kombinationen als JSON mit Item-IDs, Slot-Zuordnung und einer Begründung in einem Satz.
3. **Validierung:** Jede Kombination braucht entweder top + bottom oder einen onepiece, dazu Schuhe. Ungültige IDs werden verworfen.
4. Ziel: in unter 5 Sekunden.

### 5.6 Collage-Ansicht (MUSS, Herzstück der App)
Orientierung am Referenz-Screenshot:

- Oben stehen "Datum" (Standard: Heute), "Anlass" mit Emoji und "Teile einschließen".
- Darunter ein 2×2-Grid mit 4 Vorschlagskarten, heller Hintergrund, abgerundete Karten.
- Jede Karte ist eine **Flat-Lay-Collage** aus den freigestellten Teilen, angeordnet nach festen **Layout-Templates** pro Slot:
  - Oberteil oben mittig, Hose darunter mit leichter Überlappung, Schuhe unten.
  - Outerwear leicht versetzt hinter oder neben dem Oberteil.
  - Tasche und Accessoires seitlich.
  - Für "onepiece" und für "mit/ohne Outerwear" gibt es eigene Templates.
- Gebaut wird die Collage in HTML/CSS mit absolut positionierten Bildern in einem Container mit festem Seitenverhältnis. Kein Canvas, keine Bildgenerierung. Die Templates liegen als Konfiguration (JSON oder TS) vor, damit Matthias Positionen und Skalierung selbst tunen kann.
- Keine Avatar-Köpfe.
- Tap auf eine Karte zeigt die Detailansicht mit den Einzelteilen, der Begründung und den Buttons "Heute tragen" sowie Daumen hoch und runter.
- Nice to have: die Collage als PNG exportieren, zum Beispiel zum Teilen.

### 5.7 Feedback und Historie
"Heute getragen" fließt ins wear_log, Daumen hoch und runter ins Feedback. Beides wirkt auf die Vorfilterung und auf den Prompt.

### 5.8 Schrankansicht
Grid aller Teile mit Filtern nach Slot, Farbe und Status. Schnell auf "Wäsche" setzen.

## 6. Vorgehen

1. **Setup:** Repo, Docker Compose, Next.js, SQLite, Tokens, Grundlayout mobile first. Läuft lokal mit `docker compose up`.
2. **Erfassen:** Upload, Verarbeitung mit sharp, Tagging, Schrankansicht.
3. **Collage zuerst mit manueller Auswahl:** Die Layout-Templates bauen und tunen, bevor die KI ins Spiel kommt. Die Collage ist das wichtigste UI-Stück.
4. **Vorschläge:** Vorfilter, LLM-Aufruf, Validierung, 2×2-Ansicht.
5. **Profil, Feedback, Historie, PWA:** Manifest und Service Worker.
6. **Deploy auf den Pi oder Mini-PC:** dasselbe Compose-File plus Tailscale. Backup-Skript für die SQLite-Datei und den Bilder-Ordner, zum Beispiel nachts auf eine externe Platte oder in iCloud.

Nach jedem Schritt kurz mit Matthias abstimmen.

## 7. Design

Matthias ist Design System Lead. Bitte von Anfang an Design Tokens (Farben, Spacing, Radius, Typo, Schatten) als CSS Variables definieren und im Tailwind Theme mappen. Keine hart codierten Werte. Komponenten klein und wiederverwendbar halten. Die Ästhetik ist ruhig und hell wie in der Referenz. Mobile first, mit einer Hand bedienbar.

## 8. Nicht im Scope (MVP)

Virtual Try-on, Bildgenerierung, Shopping-Empfehlungen, native Apps, Social Features und öffentlicher Internetzugang.

## 9. Später

Freistellen direkt in der App (zum Beispiel @imgly/background-removal im Browser), Lücken-Analyse, Packlisten für Reisen, Wochenplanung im Kalender.

## 10. Definition of Done MVP

- Matthias und Lisa können sich einloggen und jeweils mindestens 30 Teile hochladen.
- Morgens bekommen sie in unter 5 Sekunden 4 Vorschläge passend zu Wetter und Anlass, als Collage wie in der Referenz.
- Die App läuft lokal und auf dem Pi mit demselben `docker compose up`.
- Die laufenden Kosten sind dokumentiert.
- Ein README erklärt Setup, Deploy und Backup so, dass ein Designer es nachvollziehen kann.
