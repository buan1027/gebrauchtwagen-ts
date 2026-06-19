package main

import (
    "database/sql"
    "fmt"
    "os"
    "time"

    _ "github.com/lib/pq"
)

// ConnectDB tries to connect using DATABASE_URL env. If missing, returns nil.
func ConnectDB() (*sql.DB, error) {
    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        return nil, nil // no DB configured
    }

    // Retry loop: try to connect for up to ~30s
    var db *sql.DB
    var err error
    for i := 0; i < 10; i++ {
        db, err = sql.Open("postgres", dsn)
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
func InitSchema(db *sql.DB) error {
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
func ListCarsDB(db *sql.DB) ([]Car, error) {
    rows, err := db.Query("SELECT id, fahrzeugnummer, marke, modell, baujahr FROM gebrauchtwagen ORDER BY id")
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var out []Car
    for rows.Next() {
        var c Car
        if err := rows.Scan(&c.ID, &c.Fahrzeugnummer, &c.Marke, &c.Modell, &c.Baujahr); err != nil {
            return nil, err
        }
        out = append(out, c)
    }
    return out, rows.Err()
}

// CreateCarDB inserts a car and returns the created row with id.
func CreateCarDB(db *sql.DB, in Car) (Car, error) {
    var id uint64
    query := `INSERT INTO gebrauchtwagen (fahrzeugnummer, marke, modell, baujahr) VALUES ($1,$2,$3,$4) RETURNING id` 
    err := db.QueryRow(query, in.Fahrzeugnummer, in.Marke, in.Modell, in.Baujahr).Scan(&id)
    if err != nil {
        return Car{}, err
    }
    in.ID = id
    return in, nil
}

// Helper to format DB errors for logging
func dbErrWrap(err error) string {
    if err == nil {
        return ""
    }
    return fmt.Sprintf("db: %v", err)
}
