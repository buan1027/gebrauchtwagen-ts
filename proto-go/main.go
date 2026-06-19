package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"sync/atomic"

	"github.com/go-chi/chi/v5"
	"github.com/jmoiron/sqlx"
)
type Car struct {
	ID             uint64 `json:"id"`
	Fahrzeugnummer string `json:"fahrzeugnummer"`
	Marke          string `json:"marke,omitempty"`
	Modell         string `json:"modell,omitempty"`
	Baujahr        int    `json:"baujahr,omitempty"`
}

var (
	cars   = make([]Car, 0)
	carsMu sync.Mutex
	nextID uint64 = 1
	dbConn *sqlx.DB
)

func listCars(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if dbConn != nil {
		rows, err := ListCarsDB(dbConn)
		if err != nil {
			http.Error(w, "failed to list cars", http.StatusInternalServerError)
			log.Println("ListCarsDB error:", err)
			return
		}
		json.NewEncoder(w).Encode(rows)
		return
	}
	carsMu.Lock()
	defer carsMu.Unlock()
	json.NewEncoder(w).Encode(cars)
}

func createCar(w http.ResponseWriter, r *http.Request) {
	var in Car
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if in.Fahrzeugnummer == "" {
		http.Error(w, "fahrzeugnummer required", http.StatusBadRequest)
		return
	}

	if dbConn != nil {
		created, err := CreateCarDB(dbConn, in)
		if err != nil {
			http.Error(w, "failed to create car", http.StatusInternalServerError)
			log.Println("CreateCarDB error:", err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(created)
		return
	}

	in.ID = atomic.AddUint64(&nextID, 1)

	carsMu.Lock()
	cars = append(cars, in)
	carsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(in)
}

func main() {
	var err error
	dbConn, err = ConnectDB()
	if err != nil {
		log.Println("DB connect failed:", err)
	} else if dbConn != nil {
		if err := InitSchema(dbConn); err != nil {
			log.Println("InitSchema failed:", err)
		} else {
			log.Println("Using PostgreSQL for persistence")
		}
	} else {
		log.Println("No DATABASE_URL set — using in-memory store")
	}

	r := chi.NewRouter()
	// health endpoint for readiness checks
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})
	r.Get("/cars", listCars)
	r.Post("/cars", createCar)

	log.Println("proto-go server listening on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
