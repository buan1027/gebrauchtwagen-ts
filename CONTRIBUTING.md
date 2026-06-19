# Contributing

Bitte kurze Hinweise für Reviewer:

- Code-Style: keep it minimal, use `gofmt` for Go code.
- Tests: `go test ./...` im `proto-go`-Verzeichnis (wenn Go installiert) oder per Docker mit `docker run --rm -v "$PWD/proto-go":/app -w /app golang:1.20 go test ./...`.
- Issues: Für größere Änderungen bitte Issue eröffnen.
