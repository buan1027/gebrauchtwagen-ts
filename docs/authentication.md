# Authentifizierung mit Keycloak und OIDC/OAuth2

## Überblick

Dieses Projekt verwendet Keycloak zur sicheren Authentifizierung und Autorisierung von API-Anfragen über OIDC (OpenID Connect) und JWT-Tokens.

## Architektur

### Komponenten

- **Keycloak**: Identity & Access Manager (IAM) für OIDC/OAuth2
  - Läuft lokal in Docker Compose unter `http://localhost:8080`
  - Konfigurierbar über Realm: `gebrauchtwagen`
  - Client ID: `gebrauchtwagen-app`

- **JWT-Validierung** (`src/config/jwt-auth.mts`):
  - Token-Signatur-Verifikation gegen Keycloak JWKS
  - Auslesen von Rollen aus `realm_access.roles`
  - JWKS-Caching zur Performance

- **REST & GraphQL Auth-Middleware**:
  - REST: `src/rest/rest-headers.mts`
  - GraphQL: `src/graphql/mutation-handler.mts`
  - Unterstützt statische Test-Tokens (`admin-token`, `user-token`) für lokale Entwicklung

## Konfiguration

### Umgebungsvariablen

```env
# Keycloak OIDC Configuration
KEYCLOAK_ISSUER=http://localhost:8080/realms/gebrauchtwagen
KEYCLOAK_AUDIENCE=gebrauchtwagen-app
KEYCLOAK_JWKS_URL=http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/certs
```

### Lokal starten

```powershell
# Mit docker compose (lokal)
docker compose -f extras/compose/postgres/compose.yml up -d

# Keycloak UI öffnen
# http://localhost:8080

# Admin-Login (standardmäßig)
# Benutzer: admin
# Passwort: admin
```

## Token Workflow

### Typ 1: Statische Test-Tokens (für lokale Tests)

```bash
# Admin-Zugriff
Authorization: Bearer admin-token

# User-Zugriff (ohne Admin-Rolle) → führt zu 403 Forbidden
Authorization: Bearer user-token
```

### Typ 2: Echte Keycloak-Tokens (für OIDC)

#### Token anfordern

```bash
curl -X POST http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=gebrauchtwagen-app" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

#### Token verwenden

```bash
curl -X POST http://localhost:3000/api/gebrauchtwagen \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"marke":"BMW","modell":"X5"}'
```

## Error-Codes

- **401 Unauthorized**
  - Bearer-Token fehlt: `Authorization: Bearer <token>` Header erforderlich
  - Token ungültig: JWT-Signatur oder Ablauf ungültig
  - Token abgelaufen: `exp` Claim ist in Vergangenheit

- **403 Forbidden**
  - Admin-Rolle erforderlich: Token ist gültig, aber ohne `admin` Rolle in `realm_access.roles`

## Rollen und Claims

### Keycloak Realm Roles

Im Realm `gebrauchtwagen` müssen diese Rollen definiert sein:

- `admin`: Vollzugriff auf Schreiboperationen (Create, Update, Delete)
- `user`: Lesezugriff nur

### JWT Claims Struktur

```json
{
  "sub": "user-id",
  "iss": "http://localhost:8080/realms/gebrauchtwagen",
  "aud": "gebrauchtwagen-app",
  "exp": 1234567890,
  "iat": 1234567800,
  "realm_access": {
    "roles": ["admin", "user"]
  }
}
```

## Tests

### Unit-Tests
```bash
bun run test -- test/jwt-auth.test.ts
```

Tests für:
- Admin-Rolle Erkennung
- User-Rolle Erkennung
- Fehlende Rollen-Behandlung

### Integration-Tests

```bash
bun run test -- test/integration/rest/gebrauchtwagen.read.test.ts
```

Tests decken ab:
- POST ohne Token → 401
- POST mit falscher Rolle → 403
- POST mit gültiger Admin-Rolle → 201

## Entwickler-Tipps

### Lokale Tests mit statischen Tokens

Für schnelle lokale Tests verwenden Sie die vordefinierten Tokens aus `.env.example`:

```bash
# Token in Bruno Collection oder curl setzen
Authorization: Bearer admin-token      # für Schreibzugriffe
Authorization: Bearer user-token       # für Auth-Fehler-Tests
```

### Token debuggen

JWT-Tokens können auf https://jwt.io dekodiert werden (nur zu Debugging-Zwecken, **nicht mit echten Secrets vertrautenswerkt!)

### JWKS Caching prüfen

Die App cashet die JWKS 1x nach der ersten Anfrage. Für lokale Keycloak-Änderungen Pod neustarten oder JWKS-Cache clearen.

## Weitere Ressourcen

- Keycloak Dokumentation: https://www.keycloak.org/documentation
- OIDC Standard: https://openid.net/specs/openid-connect-core-1_0.html
- JWT: https://jwt.io/
- OpenJWT (jose): https://github.com/panva/jose
