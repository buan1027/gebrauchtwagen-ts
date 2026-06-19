package main

import (
    "fmt"
    "os"
    "time"

    "github.com/jmoiron/sqlx"
    _ "github.com/lib/pq"
)

// ConnectDB tries to connect using DATABASE_URL env. If missing, returns nil.
func ConnectDB() (*sqlx.DB, error) {
    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        return nil, nil // no DB configured
    }

    // Retry loop: try to connect for up to ~30s
    var db *sqlx.DB
    var err error
    for i := 0; i < 10; i++ {
        db, err = sqlx.Open("postgres", dsn)
        if err != nil {
            fmt.Printf("db: open attempt %d failed: %v\n", i+1, err)
        } else {
            if pingErr := db.Ping(); pingErr == nil {
                return db, nil
            } else {
                fmt.Printf("db: ping attempt %d failed: %v\n", i+1, pingErr)
                db.Close()
            }
        }
        time.Sleep(3 * time.Second)
    }
    if err == nil {
        err = fmt.Errorf("unable to connect to database after retries")
    }
    return nil, err
}

// InitSchema ensures the gebrauchtwagen table exists.
func InitSchema(db *sqlx.DB) error {
    if db == nil {
        return nil
    }
    schema := `
CREATE TABLE IF NOT EXISTS gebrauchtwagen (
    id BIGSERIAL PRIMARY KEY,
    fahrzeugnummer TEXT NOT NULL UNIQUE,
    marke TEXT,
    modell TEXT,
    baujahr INT
);
`
    _, err := db.Exec(schema)
    return err
}

// ListCarsDB returns all cars from DB.
func ListCarsDB(db *sqlx.DB) ([]Car, error) {
    var out []Car
    err := db.Select(&out, "SELECT id, fahrzeugnummer, marke, modell, baujahr FROM gebrauchtwagen ORDER BY id")
    return out, err
}

// CreateCarDB inserts a car and returns the created row with id.
func CreateCarDB(db *sqlx.DB, in Car) (Car, error) {
    var id int64
    query := `INSERT INTO gebrauchtwagen (fahrzeugnummer, marke, modell, baujahr) VALUES ($1,$2,$3,$4) RETURNING id`
    err := db.QueryRowx(query, in.Fahrzeugnummer, in.Marke, in.Modell, in.Baujahr).Scan(&id)
    if err != nil {
        return Car{}, err
    }
    in.ID = uint64(id)
    return in, nil
}

// Helper to format DB errors for logging
func dbErrWrap(err error) string {
    if err == nil {
        return ""
    }
    return fmt.Sprintf("db: %v", err)
}
