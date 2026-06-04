# Authentifizierung mit Keycloak und OIDC/OAuth2

## Ueberblick

Der Appserver validiert Bearer-Tokens von Keycloak mit `jose`. Geschuetzte
REST- und GraphQL-Schreibzugriffe benoetigen ein gueltiges JWT mit der
Realm-Rolle `admin`. Lesende Zugriffe bleiben ohne Token moeglich.

## Lokaler Keycloak

Docker Compose startet Keycloak zusammen mit App und PostgreSQL:

```powershell
docker compose -f extras\compose\postgres\compose.yml up -d --build
```

Der Realm `gebrauchtwagen` wird beim Keycloak-Start aus
`extras/compose/keycloak/realm-export.json` importiert.

Lokale Demo-Zugangsdaten:

| Benutzer | Passwort | Rollen |
| -------- | -------- | ------ |
| `admin`  | `admin`  | `admin`, `user` |
| `user`   | `user`   | `user` |

Client-Konfiguration:

| Wert | Inhalt |
| ---- | ------ |
| Realm | `gebrauchtwagen` |
| Client ID | `gebrauchtwagen-app` |
| Client Secret | `gebrauchtwagen-secret` |
| Token Endpoint | `http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/token` |

## Token Anfordern

Admin-Token:

```powershell
$body = @{
  grant_type = 'password'
  client_id = 'gebrauchtwagen-app'
  client_secret = 'gebrauchtwagen-secret'
  username = 'admin'
  password = 'admin'
}
$token = (Invoke-RestMethod `
  -Uri http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/token `
  -Method Post `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body $body).access_token
```

User-Token fuer `403`-Tests:

```powershell
$body.username = 'user'
$body.password = 'user'
$userToken = (Invoke-RestMethod `
  -Uri http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/token `
  -Method Post `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body $body).access_token
```

## Token Verwenden

REST-Schreibzugriff:

```powershell
Invoke-WebRequest `
  -Uri http://localhost:3000/api/gebrauchtwagen `
  -Method Post `
  -ContentType 'application/json' `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body '{"marke":"BMW","modell":"320i","fahrzeugklasse":"MITTELKLASSE","kraftstoffart":"BENZIN","schadenfrei":true,"kilometerstand":27000}'
```

Erwartetes Verhalten:

| Fall | Ergebnis |
| ---- | -------- |
| Kein Bearer-Token | `401 Unauthorized` |
| Ungueltiges Token | `401 Unauthorized` |
| Gueltiges Token ohne `admin`-Rolle | `403 Forbidden` |
| Gueltiges Admin-Token | Schreiboperation wird ausgefuehrt |

## Konfiguration

Lokale Ausfuehrung ohne Docker nutzt `.env`:

```properties
KEYCLOAK_ISSUER=http://localhost:8080/realms/gebrauchtwagen
KEYCLOAK_AUDIENCE=gebrauchtwagen-app
KEYCLOAK_JWKS_URL=http://localhost:8080/realms/gebrauchtwagen/protocol/openid-connect/certs
```

Im Compose-Netzwerk setzt `extras/compose/postgres/compose.yml` fuer die App
eine interne JWKS-URL:

```properties
KEYCLOAK_JWKS_URL=http://keycloak:8080/realms/gebrauchtwagen/protocol/openid-connect/certs
```

Der `issuer` bleibt absichtlich `http://localhost:8080/realms/gebrauchtwagen`,
weil die Demo-Tokens ueber den Host-Port ausgestellt werden und dieser Wert im
JWT steht.

## Tests

CI-Tests verwenden einen Fixture-Server und statische Testtokens. Diese Tokens
sind nur in `NODE_ENV=development` oder `NODE_ENV=test` aktiv:

| Token | Zweck |
| ----- | ----- |
| `admin-token` | Admin-Pfad in Unit-/Integrationstests |
| `user-token` | 403-Pfad in Unit-/Integrationstests |

Im Docker-Compose-Betrieb laeuft die App mit `NODE_ENV=production`; dort werden
die statischen Tokens nicht akzeptiert.
