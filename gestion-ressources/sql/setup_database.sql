-- PostgreSQL setup for project: gestion-ressources (pgAdmin-friendly)
--
-- IMPORTANT:
-- 1) Run PART A while connected to database "postgres" (or any maintenance DB).
-- 2) Then reconnect to database "gestion_ressources" and run PART B.

-- =========================
-- PART A: create database
-- =========================
-- If this fails with "already exists", continue with PART B.
CREATE DATABASE gestion_ressources
WITH OWNER = postgres
ENCODING = 'UTF8'
TEMPLATE = template0;

-- ================================================
-- PART B: run inside database "gestion_ressources"
-- ================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional reset (uncomment ONLY if you want a full clean database)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- Verification queries
SELECT current_database();
SELECT extname FROM pg_extension WHERE extname = 'pgcrypto';

-- Notes:
-- - Tables are generated automatically by Spring Boot (spring.jpa.hibernate.ddl-auto=update).
-- - Initial users/departments are inserted by DataInitializer on first run when users table is empty.
-- - Default test logins use password: password
