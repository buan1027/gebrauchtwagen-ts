# Security Checks

Dieses Dokument beschreibt die reproduzierbaren Security-Pruefungen fuer die
Produktionsabhaengigkeiten des Projekts.

## bun audit

Der schnelle lokale Check wird mit Bun ausgefuehrt:

```powershell
bun run audit
```

Das Script ruft `bun audit --prod` auf und prueft damit nur
Produktionsabhaengigkeiten. Entwicklungswerkzeuge wie Vitest, ESLint, Oxfmt
oder k6 werden dabei bewusst ausgeklammert, weil sie nicht mit dem Appserver
ausgeliefert werden.

Bewertung:

- Kritische oder hohe Findings in Produktionsabhaengigkeiten werden vor der
  Abgabe aktualisiert oder begruendet dokumentiert.
- Mittlere und niedrige Findings werden im Projekthandbuch genannt, wenn kein
  risikoarmer Patch verfuegbar ist.
- Dev-Dependency-Findings werden getrennt betrachtet und nur dann priorisiert,
  wenn sie Build, CI oder lokale Ausfuehrung direkt betreffen.

Aktueller Stand:

- Am 2026-06-03 meldete `bun run audit` zunaechst zwei High-Findings fuer
  `fast-uri@3.1.0` ueber Prisma-/Tooling-Abhaengigkeiten.
- Die Findings wurden durch einen gezielten Override auf `fast-uri@3.1.2`
  behoben.
- Danach wurde `bun run audit` erneut ausgefuehrt.
- Ergebnis: keine Findings in Produktionsabhaengigkeiten.

## OWASP Dependency Check

Der vorbereitete Projektaufruf lautet:

```powershell
bun run dependency-check
```

Das Script `scripts/dependency-check.mts` erwartet die lokale Installation unter
`C:\Zimmermann\dependency-check\bin\dependency-check.bat` und nutzt als
Datenverzeichnis `C:\Zimmermann\dependency-check-data`. Die Reports werden im
Verzeichnis `reports` erzeugt. Dieses Verzeichnis ist als lokales
Pruefergebnis gedacht und wird nicht versioniert.

Der Aufruf scannt das Repository, laesst Dev-Dependencies fuer Node-Audit und
Package-Pruefung aus und deaktiviert nicht benoetigte Analyzer fuer Archive,
Assembly und Yarn:

```powershell
dependency-check `
  --project gebrauchtwagen-ts `
  --scan . `
  --out reports `
  --data C:\Zimmermann\dependency-check-data `
  --exclude **/node_modules/** `
  --exclude **/reports/** `
  --exclude **/src/generated/** `
  --nodeAuditSkipDevDependencies `
  --nodePackageSkipDevDependencies `
  --disableArchive `
  --disableAssembly `
  --disableYarnAudit
```

`node_modules` wird bewusst ausgeschlossen, weil der Ordner lokale
Installationsartefakte und Dev-Tool-Dateien enthaelt. Ohne diesen Ausschluss
meldet der RetireJS-Analyzer z.B. `lodash.js` aus einem Dev-Dependency-Pfad,
obwohl `bun audit --prod` fuer die ausgelieferten Produktionsabhaengigkeiten
keine Findings mehr meldet.

Aktueller Stand:

- Am 2026-06-03 wurde `bun run dependency-check` lokal ausgefuehrt.
- Ergebnis im HTML-Report: 19 Dependencies gescannt, 0 vulnerable
  Dependencies, 0 Vulnerabilities gefunden, 0 Suppressions.
- Dependency Check meldet erwartbar `No lock file exists`, weil das Projekt
  Bun mit `bun.lock` statt `package-lock.json` verwendet. Deshalb bleibt
  `bun audit --prod` die primaere Paket-Audit-Pruefung fuer Node-
  Abhaengigkeiten; Dependency Check ergaenzt den best-effort OWASP-Report.

## NVD API Key

OWASP Dependency Check kann ohne NVD API Key laufen, ist dann aber langsamer
und kann beim Aktualisieren der NVD-Daten haeufiger in Rate Limits laufen.
Fuer reproduzierbare lokale Pruefungen wird der Key als Umgebungsvariable
gesetzt:

```powershell
$env:NVD_API_KEY = '<key>'
bun run dependency-check
```

Der Key wird nicht in `.env`, Git, Bruno oder Reports abgelegt. Das Script
liest nur `NVD_API_KEY` aus der aktuellen Umgebung und gibt den Wert nicht aus.

## Ergebnisdokumentation

Nach einem Lauf werden die wichtigsten Ergebnisse im Projekthandbuch oder im
Abschlussreview festgehalten:

- Datum und ausgefuehrter Befehl
- verwendeter Stand von `main` oder PR-Branch
- Anzahl kritischer, hoher, mittlerer und niedriger Findings
- Entscheidung je relevantem Finding: behoben, akzeptiert oder Folgeaufgabe
- Hinweis, ob der NVD API Key verwendet wurde

Kritische Findings duerfen nicht stillschweigend offen bleiben. Wenn ein Update
nicht moeglich ist, wird das Risiko mit betroffener Abhaengigkeit, Ursache und
geplanter Nacharbeit dokumentiert.
