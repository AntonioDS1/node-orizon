-- ====================================================
-- Orizon Database Schema
-- REST API for managing users, goal intervals, and goals
-- ====================================================

-- Crea il database se non esiste e seleziona
CREATE DATABASE IF NOT EXISTS orizon;
USE orizon;


-- ====================================================
-- USERS: agenti di viaggio dell'agenzia
-- ====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,    -- email univoca
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ====================================================
-- GOALS: catalogo di obiettivi aziendali riutilizzabili
-- ====================================================
CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,                       -- opzionale
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ====================================================
-- INTERVALS: periodi di lavoro assegnati ad un utente
-- Relazione 1:N con users (un utente ha N intervalli,
-- ogni intervallo appartiene a 1 solo utente)
-- ====================================================
CREATE TABLE IF NOT EXISTS intervals_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (end_date >= start_date)         -- end_date non può essere prima di start_date
);


-- ====================================================
-- INTERVAL_GOALS: tabella ponte (relazione N:M)
-- Un intervallo può avere più obiettivi
-- Un obiettivo può essere in più intervalli
-- ====================================================
CREATE TABLE IF NOT EXISTS interval_goals (
  interval_id INT NOT NULL,
  goal_id INT NOT NULL,
  PRIMARY KEY (interval_id, goal_id),    -- impedisce associazioni duplicate
  FOREIGN KEY (interval_id) REFERENCES intervals_table(id) ON DELETE CASCADE,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);


-- ====================================================
-- INDICI per velocizzare i filtri
-- ====================================================
CREATE INDEX idx_intervals_dates ON intervals_table(start_date, end_date);
CREATE INDEX idx_intervals_user ON intervals_table(user_id);
