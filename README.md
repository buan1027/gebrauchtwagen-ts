# gebrauchtwagen-ts

Hono-, Prisma- und TypeScript-Appserver fuer die weitere Entwicklung des
Aggregats `gebrauchtwagen`.

## Zweck

Dieses Repository ist der TypeScript-Appserver fuer das Aggregat
`gebrauchtwagen`. Es kombiniert Hono fuer REST- und GraphQL-Endpunkte, Prisma
fuer den Datenbankzugriff und Vitest fuer automatisierte Tests.

Die wichtigsten Einstiegspunkte sind:

1. Lokale `.env` aus `.env.example` anlegen.
2. PostgreSQL starten und das Schema laden.
3. Prisma-Models aus der Datenbank introspektieren.
4. Appserver oder Tests starten.

## Enthalten

- Bun-, TypeScript-, Oxlint-, ESLint- und Oxfmt-Konfiguration
- Hono-Appserver unter `src/app.mts` und `src/index.mts`
- REST-Endpunkte fuer Gebrauchtwagen unter `src/rest/gebrauchtwagen-router.mts`
- GraphQL-Yoga-Endpunkt fuer Gebrauchtwagen unter `src/graphql/graphql-app.mts`
- Prisma-Konfiguration und zentrale Prisma-Factory
- Platz fuer den generierten Prisma-Client unter `src/generated/prisma`
- PostgreSQL-Compose-Setup mit DDL und CSV-Beispieldaten
- PlantUML-ER-Diagramm unter `docs/er-diagramm.md`
- Vitest-Tests fuer Query-Helfer, REST- und GraphQL-Integration
- Fixture-Service fuer HTTP-Integrationstests unter `test/fixtures`
- Prisma-Service-Unit-Tests mit `vi.mock` unter `test/service`

## ER-Diagramm

Das relationale Zielmodell ist als PlantUML-ER-Diagramm dokumentiert:

- [docs/er-diagramm.md](docs/er-diagramm.md)
- [docs/diagramme/src/er-diagramm.plantuml](docs/diagramme/src/er-diagramm.plantuml)

In VS Code kann die PlantUML-Datei mit der PlantUML-Erweiterung geoeffnet und
mit `<Alt>d` als Vorschau angezeigt werden.

## DB-Backend einrichten

```powershell
Copy-Item .env.example .env
docker compose -f extras\compose\postgres\compose.yml up -d db
```

Danach kann das Prisma-Schema aus der bestehenden Datenbank erzeugt werden:

```powershell
bun --env-file=.env prisma db pull
bun run prisma:generate
```

Beim ersten Initialisieren des PostgreSQL-Containers werden Schema und CSV-Daten
automatisch geladen. Wenn der Container schon vorher existierte, kann die

Demo-Datenbank mit folgendem Befehl neu aufgebaut werden:

```powershell
docker compose -f extras\compose\postgres\compose.yml down
docker compose -f extras\compose\postgres\compose.yml up -d db
```

## Aufruf der Beispiele

Die zentrale Prisma-Factory fuer die App liegt in
`src/config/prisma-client.mts`.
Sie kapselt Adapter, Logging und den Zugriff auf `DATABASE_URL`.
Der REST-Router ist ueber eine Service-Schnittstelle angebunden; im
Produktivpfad verwendet `src/service/prisma-gebrauchtwagen-service.mts` diese
Factory, waehrend die Integrationstests einen Fixture-Service injizieren.

Ein einfacher Verbindungscheck gegen die Compose-DB erfolgt ueber die
Beispielskripte:

```powershell
bun --env-file=.env src/beispiele.mts
```

Die Beispiel-Datei `src\beispiele.mts` zeigt lesende Prisma-Zugriffe mit
Filterbedingungen, Relationen, Mapping und Pagination:

```powershell
bun --env-file=.env src/beispiele.mts
```

Fuer Ticket 5 sind dort folgende Punkte enthalten:

- Filter nach `marke` und `modell`
- kombinierte Filter fuer `fahrzeugklasse`, `kraftstoffart`, `schadenfrei`
- reproduzierbare Pagination mit `page` und `size`
- Validierung ungueltiger Filterwerte

Die zentrale Hilfsfunktion fuer Prisma-Filter/Pagination liegt in
`src/gebrauchtwagen-query.mts`.

Die Beispiel-Datei `src\beispiele-write.mts` zeigt schreibende Prisma-Zugriffe
mit `create`, `update`, `delete`, verschachtelten Relationen und Transaktion:

```powershell
bun --env-file=.env src/beispiele-write.mts
```

Beide Beispiele koennen auch als ausfuehrbare Dateien gebaut werden:

```powershell
bun run build
bun run build:write
```

## Appserver starten

```powershell
bun run dev
```

Der Server laeuft standardmaessig auf `http://localhost:3000`. Ein einfacher
Health-Checks sind unter `/health`, `/health/liveness` und
`/health/readiness` verfuegbar, die REST-Routen liegen unter
`/api/gebrauchtwagen`, GraphQL Yoga liegt unter `/graphql`, Prometheus-Metriken
unter `/prometheus`. Beim Start und bei Requests schreibt der Appserver
Pino-Logs auf die Konsole.

Das Log-Level wird ueber `LOG_LEVEL` aus `.env` gesteuert. Request-Logs
enthalten Methode und URL, Response-Time-Logs enthalten Status und Dauer; die
Dauer wird ausserdem als Header `X-Response-Time` gesetzt.

## Docker

Das App-Image kann lokal gebaut werden:

```powershell
docker build --tag gebrauchtwagen-ts:latest .
```

Die lokale Compose-Umgebung startet App, PostgreSQL und Keycloak gemeinsam:

```powershell
docker compose -f extras\compose\postgres\compose.yml up -d --build
```

Standardmaessig werden folgende Dienste veroeffentlicht:

- App: `http://localhost:3000`
- Keycloak: `http://localhost:8080`

Wenn Ports bereits belegt sind, koennen andere Host-Ports gesetzt werden:

```powershell
$env:APP_PORT = '3100'
$env:KEYCLOAK_PORT = '8180'
$env:KEYCLOAK_ADMIN = 'admin'
$env:KEYCLOAK_ADMIN_PASSWORD = 'admin'
docker compose -f extras\compose\postgres\compose.yml up -d --build
```

Die App verwendet im Compose-Netzwerk `db:5432` und greift damit auf die beim
PostgreSQL-Start geladenen CSV-Demodaten zu. Keycloak ist als lokale
Dev-Instanz im gleichen Compose-Stack enthalten; die OIDC-Anbindung der App
bleibt weiterhin in Issue #8.

Zum Stoppen der Umgebung:

```powershell
docker compose -f extras\compose\postgres\compose.yml down
```

## Qualitaetssicherung

```powershell
bun run tsc
bun run lint
bun run eslint
bun run fmt:check
bun run test
```

Die lokale Sammelpruefung verwendet dieselben Einstiegspunkte wie GitHub
Actions:

```powershell
bun run check
```

Die HTTP-Integrationstests laufen bewusst gegen einen Fixture-Service, damit
CI ohne PostgreSQL, Docker und Keycloak reproduzierbar bleibt. Der
Prisma-Produktivpfad wird separat durch Service-Unit-Tests mit gemocktem
Prisma-Client abgesichert.

Das Linter-Tooling ist an die aktualisierte Hono-Vorlage angeglichen:
`bun run lint` und `bun run lint:fix` verwenden Oxlint mit
`oxlint-tsgolint`. ESLint bleibt zusaetzlich aktiv, weil die bestehende
Konfiguration detaillierte Projektregeln und Plugins abdeckt. Gegenueber der
Vorlage werden die Oxlint-Restriction-Regeln nicht pauschal aktiviert, damit
der vorhandene Projektstil mit `async`/`await`, Objekt-Spread und Beispiel-
Skripten stabil bleibt; diese Tiefe prueft weiterhin ESLint. Direkte
Vergleiche mit `undefined`, zum Beispiel `value === undefined`, bleiben die
vereinbarte Schreibweise; die Oxlint-Regel `no-undefined` ist deshalb wie in
der Vorlage deaktiviert.

Weitere vorbereitete Scripts:

| Script                 | Zweck                                                        |
| ---------------------- | ------------------------------------------------------------ |
| `bun run prisma:generate` | Prisma Client generieren; wird auch in CI verwendet       |
| `bun run lint`         | Schneller Hono-kompatibler Oxlint-Check mit Typinformationen |
| `bun run lint:fix`     | Automatische Oxlint-Korrekturen anwenden                     |
| `bun run fmt`          | Quelltexte mit `oxfmt` formatieren                           |
| `bun run fmt:check`    | Formatierung mit `oxfmt` pruefen; wird auch in CI verwendet  |
| `bun run asciidoctor`  | Projekthandbuch bauen, sobald Issue #14 die Quelle anlegt    |
| `bun run k6`           | Lasttest aus `test\lasttest\script.ts` fuer Issue #13        |
| `bun run sonar`        | Lokalen Sonar Scanner starten, falls installiert             |
| `bun run dependency-check` | OWASP Dependency Check vorbereiten; Details in Issue #17 |
| `bun run audit`        | Produktionsabhaengigkeiten mit Bun pruefen                   |

## Bruno Collection

Die Bruno Collection liegt unter `bruno/`. Fuer lokale Entwicklung wird das
Environment `local` verwendet; es setzt `baseUrl` auf `http://localhost:3000`
und enthaelt die aktuellen Testtokens `admin-token` und `user-token`.

Typische Aufrufe sind enthalten fuer:

- REST-Liste, Detail, Suche, Count-only, Create, Update, Delete und Fehlerfall
- GraphQL-Liste, Detail, Suche, Create, Update und Delete
- Health-Liveness, Health-Readiness und Prometheus
- vorbereitete Requests fuer Keycloak Token und Dev-DB-Reload

Keycloak/OIDC ist weiterhin durch Issue #8 abgedeckt. Der vorbereitete
DB-Reload-Request verweist auf Issue #35, weil der passende Dev-Endpunkt noch
nicht im Appserver vorhanden ist.
