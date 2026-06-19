#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Starting docker compose (db + app)"
docker compose up -d --build

# get container id for db
db_cid=$(docker compose ps -q db)
if [ -z "$db_cid" ]; then
  echo "db container not found" >&2
  exit 1
fi

echo "Waiting for Postgres to become ready..."
for i in {1..30}; do
  if docker exec -i "$db_cid" pg_isready -U postgres >/dev/null 2>&1; then
    echo "Postgres ready"
    break
  fi
  sleep 1
done

echo "Waiting for app to start (localhost:8080)"
for i in {1..30}; do
  if curl --silent --fail http://localhost:8080/cars >/dev/null 2>&1; then
    echo "App responded"
    break
  fi
  sleep 1
done

echo "Creating sample car via API"
curl -sS -X POST http://localhost:8080/cars -H 'Content-Type: application/json' -d '{"fahrzeugnummer":"VIN-12345","marke":"VW","modell":"Golf","baujahr":2012}' || true

echo "Listing cars"
curl -sS http://localhost:8080/cars || true

echo "Smoke test finished"
