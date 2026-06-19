# CURL Examples

Beispiele zum schnellen Testen der API:

GET all cars
```bash
curl -sS https://localhost:8080/cars
```

POST new car
```bash
curl -sS -X POST https://localhost:8080/cars \
  -H 'Content-Type: application/json' \
  -d '{"marke":"VW","modell":"Golf","baujahr":2012}'
```
