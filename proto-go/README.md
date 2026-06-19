go run main.go
# Programmierworkshop am 19.6.2026

## Namen

## Link zum Git-Repository

## KI-Werkzeuge

### Agenten

### Chat-URLs, z.B. https://chatgpt.com

## Frameworks und Bibliotheken

### REST-Schnittstelle (Lesen und Neuanlegen)

### Validierung (nur Neuanlegen)

### OR-Mapping (für PostgreSQL)

### Optional: OIDC mit Keycloak

### Einfacher Integrationstest

## Prototype Go Projekt

Dieses Verzeichnis enthält einen kleinen Prototyp für die Aufgabe "Prototypische Implementierung".

## Inhalt

- `main.go` — Minimaler HTTP-Server mit `GET /cars` und `POST /cars`.
- `go.mod` — Go-Modul.
- `Makefile` — Hilfsziele zum Starten.

## Schnellstart

Voraussetzung: Go installiert (>= 1.20)

```bash
cd proto-go
go run main.go
```
Hinweis: Die `run.sh`/`run.ps1` nutzen Docker, falls `go` nicht lokal installiert ist — so lässt sich die Demo schnell starten.

Beispielanfragen:

Health check:
```bash
curl -sS http://localhost:8080/health
```

GET alle Autos:

```bash
curl http://localhost:8080/cars
```

POST neues Auto:

```bash
curl -X POST http://localhost:8080/cars \
  -H "Content-Type: application/json" \
  -d '{"fahrzeugnummer":"ABC-123","marke":"Audi","modell":"A4","baujahr":2015}'
```

## Abgabe

Ausgefüllte Datei `ReadMe.md` aus dem ILIAS-Ordner "Programmierworkshop" per EMail an den Dozenten

## Hinweise

- Implementiere einen einfachen REST-Endpunkt zum Lesen und Anlegen von Datensätzen.
- Validierung nur für Erstell-Requests.
- Benutze eine PostgreSQL-Datenbank (bestehender DB-Server als Ziel).
- Keycloak ist optional — für Prototyp reicht ein simpler Token-Mechanismus oder keine Auth.

## Hinweise zur Abgabe im Repo

Die `proto-go/README.md` kann als Grundlage dienen — fülle dort bitte die Namen und das Repository-Link ein, bevor du die Datei an den Dozenten sendest.
