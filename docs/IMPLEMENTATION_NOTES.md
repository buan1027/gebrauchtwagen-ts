# Implementation Notes

Kurzüberblick über Entscheidungen und Gründe:

- Go-Prototyp (`proto-go`) verwendet Standard-HTTP-Server, in-memory fallback und optionale PostgreSQL-Unterstützung.
- DB-Fallback erlaubt Demo ohne lokale DB-Installation; setzt `DATABASE_URL` für Postgres.
- Run-Scripts (`run.sh`, `run.ps1`) unterstützen Docker-Fallback, damit das Projekt schnell demonstrierbar ist.

Wichtig für Reviewer:
- Siehe `proto-go/main.go` und `proto-go/db.go` für Hauptlogik.
