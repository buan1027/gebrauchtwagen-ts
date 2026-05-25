# Projektplan

Dieser Plan strukturiert die Umsetzung des Gebrauchtwagen-Appservers mit Bun,
Hono, Prisma, PostgreSQL, GraphQL Yoga, Keycloak, Docker, GitHub Actions,
Bruno, k6, Pino, AsciiDoctor und OWASP Dependency Check.

## Team und Arbeitsweise

| Person | Schwerpunkt                                       |
| ------ | ------------------------------------------------- |
| Anna   | Hono-App, REST, GraphQL, Doku, Docker             |
| Mo     | Prisma/PostgreSQL, Keycloak, Tests, CI, Lasttests |

## GitHub Project

Das GitHub Project `Gebrauchtwagen-Appserver` enthaelt eine Table- und eine
Board-Ansicht. Die Table-Ansicht dient als Planungsuebersicht, die Board-Ansicht
als taeglicher Arbeitsstand.

### Status

| Status        | Bedeutung                                         |
| ------------- | ------------------------------------------------- |
| `Backlog`     | Geplant, aber noch nicht startklar                |
| `Ready`       | Als Naechstes machbar und ausreichend beschrieben |
| `In Progress` | Anna oder Mo arbeitet gerade daran                |
| `Review`      | Pull Request offen oder Kontrolle erforderlich    |
| `Done`        | Gemerged und abgeschlossen                        |

### Zusatzfelder

| Feld         | Werte                       | Bedeutung                                   |
| ------------ | --------------------------- | ------------------------------------------- |
| `Woche`      | `Woche 1` bis `Woche 4`     | Zeitliche Einordnung im Vier-Wochen-Plan    |
| `Prioritaet` | `Hoch`, `Mittel`, `Niedrig` | Bewertungsrelevanz oder Blockerwirkung      |
| `Aufwand`    | `S`, `M`, `L`               | Grobe Einschaetzung fuer die Planung        |
| `Ergebnis`   | Freitext                    | Kurzbeschreibung des erwarteten Ergebnisses |

## Teamregeln

- Jede Aufgabe wird ueber ein GitHub Issue geplant.
- Jede Umsetzung erfolgt auf einem Branch nach dem Muster
  `feature/<issue-nr>-<kurzer-name>`.
- Pro Person ist hoechstens ein Issue gleichzeitig `In Progress`.
- Committexte sind Deutsch, kurz, fachlich und ohne Punkt am Ende.
- Pull Requests verlinken das Issue und enthalten eine kurze Testnotiz.
- Anna und Mo reviewen Pull Requests gegenseitig oder schauen sie gemeinsam an.
- Ein Issue wird erst geschlossen, wenn Code, Tests bzw. Pruefung und relevante
  Dokumentation erledigt sind.

## Arbeiten mit Branches

Da im Team noch wenig Erfahrung mit Branches vorhanden ist, wird fuer jedes
Issue derselbe Ablauf verwendet.

Bisher wurde direkt auf `main` gearbeitet: Datei aendern, `git add`,
`git commit`, `git push` und damit war die Aufgabe erledigt. Fuer dieses Projekt
wird die Arbeit staerker getrennt. `main` bleibt der gemeinsame, gepruefte
Projektstand. Neue Arbeit findet zuerst auf einem eigenen Branch statt. Erst
nach einem Pull Request, einem Review und erfolgreichen Checks wird sie nach
`main` uebernommen.

Merksatz:

- Issue = Aufgabe.
- Branch = Arbeitsbereich fuer diese Aufgabe.
- Commit = kleiner gespeicherter Fortschritt.
- Push = Branch online stellen.
- Pull Request = Bitte, diese Arbeit in `main` zu uebernehmen.
- Review = Kontrolle durch die andere Person vor dem Abschluss.

1. Issue im Project von `Ready` nach `In Progress` verschieben.
2. Lokalen Stand aktualisieren: `git pull`.
3. Branch fuer das Issue anlegen, z.B.
   `git switch -c feature/3-rest-lesezugriffe`.
4. Kleine, lauffaehige Zwischenschritte umsetzen.
5. Aenderungen pruefen: `git status`, danach passende Checks ausfuehren.
6. Sinnvolle Dateien stagen: `git add <datei>`.
7. Mit deutschem Committext committen, z.B.
   `git commit -m "REST-Lesezugriffe vorbereiten #3"`.
8. Branch pushen: `git push -u origin feature/3-rest-lesezugriffe`.
9. Pull Request gegen `main` erstellen und das Issue verlinken.
10. PR nach Review und erfolgreichen Checks mergen.
11. Issue im Project nach `Done` verschieben.

Auf `main` wird nur direkt gearbeitet, wenn es sich um reine
Projektorganisation ohne Codeaenderung handelt oder Anna und Mo dies gemeinsam
absprechen. Bei Unsicherheit wird ein Branch verwendet.

### Befehlsuebersicht

Neues Issue beginnen:

```powershell
git switch main
git pull
git switch -c feature/16-projektorganisation
```

Aenderungen pruefen:

```powershell
git status
git diff
```

Kleinen Zwischenstand committen:

```powershell
git add docs/projektplan.md
git commit -m "Branch- und Commitregeln dokumentieren #16"
```

Branch nach GitHub pushen:

```powershell
git push -u origin feature/16-projektorganisation
```

Weitere Commits auf demselben Branch pushen:

```powershell
git push
```

Nach dem Merge wieder auf `main` wechseln und aktualisieren:

```powershell
git switch main
git pull
```

### Kopplung mit Issues

Commits koennen eine Issue-Nummer enthalten, z.B.
`Branch- und Commitregeln dokumentieren #16`. Dadurch ist im Issue sichtbar,
dass ein Commit dazu gehoert.

Der Pull Request verlinkt das Issue ebenfalls. Soll das Issue beim Merge
automatisch geschlossen werden, steht in der PR-Beschreibung z.B.:

```md
Closes #16
```

Wenn das Issue nur erwaehnt, aber noch nicht geschlossen werden soll, wird
stattdessen z.B. `Refs #16` verwendet.

### Commit-Regeln

- Es wird regelmaessig in kleinen, nachvollziehbaren Zwischenschritten
  committed.
- Ein Commit soll einen lauffaehigen oder zumindest klar pruefbaren
  Zwischenstand enthalten.
- Committexte sind deutsch, kurz und fachlich.
- Wenn passend, wird die Issue-Nummer am Ende genannt, z.B.
  `Projektplan fuer Teamarbeit ergaenzen #16`.
- Grosse Sammelcommits werden vermieden.
- Unabhaengige Themen werden nicht in demselben Commit gemischt.

## Zeiterfassung

Die Zeiterfassung erfolgt in Excel. Jede Zeile dokumentiert eine konkrete
Taetigkeit.

## Issue-Backlog

| Nr. | Titel                                                  | Labels           | Person   | Ergebnis                                                                  |
| --- | ------------------------------------------------------ | ---------------- | -------- | ------------------------------------------------------------------------- |
| 1   | Hono-Grundstruktur fuer Appserver portieren            | backend, logging | Anna     | App startet mit Config, Health, Pino, CORS, Security Headers              |
| 2   | Prisma-Client und DB-Konfiguration integrieren         | db               | Mo       | Gemeinsame Prisma-Factory mit PostgreSQL-Verbindung                       |
| 3   | REST-Lesezugriffe fuer Gebrauchtwagen implementieren   | rest, test       | Anna     | `GET /rest/gebrauchtwagen` und `GET /rest/gebrauchtwagen/:id`             |
| 4   | REST-Schreibzugriffe mit Zod validieren                | rest, test       | Anna     | `POST`, `PUT`, `DELETE`, Problem Details                                  |
| 5   | Suchfilter und Pagination umsetzen                     | rest, db         | Mo       | Filter fuer Marke, Modell, Fahrzeugklasse, Kraftstoffart, Schadenfreiheit |
| 6   | Vitest-Integrationstests mit Fetch API aufbauen        | test             | Mo       | REST-CRUD, Fehlerfaelle und Auth-Basistests                               |
| 7   | GraphQL Yoga integrieren                               | graphql          | Anna     | Queries und Mutations ueber dieselbe Service-Schicht                      |
| 8   | Keycloak mit OIDC und OAuth2 anbinden                  | auth, security   | Mo       | Tokenpruefung, Rollen `user` und `admin`                                  |
| 9   | Bruno Collection erstellen                             | bruno            | Anna     | REST, GraphQL, Auth, Health, Prometheus, DB Reload                        |
| 10  | GitHub Actions fuer Qualitaetssicherung einrichten     | ci               | Mo       | `tsc`, Oxlint, ESLint, Oxfmt, Tests, Prisma Generate                       |
| 11  | Docker-Image und Compose-Setup finalisieren            | docker           | Anna     | App, DB und Keycloak starten reproduzierbar                               |
| 12  | Monitoring und Pino-Logging abrunden                   | logging          | Anna     | Request Logs, Response Time, Prometheus-Endpunkt                          |
| 13  | k6-Lasttests vorbereiten                               | k6               | Mo       | Lasttest-Skript fuer REST und GraphQL                                     |
| 14  | Projekthandbuch mit AsciiDoctor und PlantUML erstellen | docs             | Anna     | Architektur, ER, Sequenz, Tests, CI, Security, Lasttests                  |
| 15  | Abschlussreview und Abgabecheck durchfuehren           | docs, test       | Anna, Mo | Bewertungspunkte pruefen und Risiken dokumentieren                        |
| 16  | Projektorganisation und Zeiterfassung einrichten       | ci, docs         | Anna     | Project, Excel-Zeiterfassung und Arbeitsregeln                            |
| 17  | OWASP Dependency Check und bun audit dokumentieren     | security, docs   | Mo       | Skript, Aufruf und Ergebnisdokumentation                                  |
| 18  | Package-Scripts an technische Vorlage angleichen       | ci, backend      | Anna     | Einheitliche Scripts fuer lokale Checks und CI                            |

## Erste Umsetzungsreihenfolge

1. Issues 16, 18, 1, 2 und 10 fuer Organisation, Scripts, App-Basis, DB und CI.
2. Issues 3 bis 6 fuer REST, Suchfilter, Zod und Testbarkeit.
3. Issues 7, 8, 9 und 12 fuer GraphQL, Keycloak, Bruno und Monitoring.
4. Issues 11, 13, 14 und 17 fuer Docker, Lasttests, Projekthandbuch und
   Security Checks.
5. Issue 15 fuer Abschlussreview und Abgabecheck.

## Akzeptanzkriterien

- `bun run tsc`, `bun run lint`, `bun run eslint`, `bun run fmt:check` und
  `bun run test` laufen lokal und in GitHub Actions.
- Docker Compose startet PostgreSQL, Keycloak und Appserver reproduzierbar.
- REST, GraphQL, Bruno, k6, Security Checks und Doku sind im README oder
  Projekthandbuch nachvollziehbar beschrieben.
- GitHub Project, Issues, PRs, Commits und Excel-Zeiterfassung dokumentieren
  die Arbeit von Anna und Mo.

## Definition of Done

Ein Issue gilt als erledigt, wenn:

- die fachliche oder organisatorische Aufgabe umgesetzt ist,
- die Akzeptanzkriterien im Issue geprueft wurden,
- relevante Checks lokal oder in CI gelaufen sind,
- die Testnotiz im Pull Request oder Issue ergaenzt wurde,
- noetige Dokumentation aktualisiert wurde,
- der Pull Request gemerged oder die organisatorische Aufgabe nachvollziehbar
  abgeschlossen ist.
