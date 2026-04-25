-- Run this script in database: gestion_ressources

-- Show all tables created by Spring Boot / Hibernate
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify test users inserted by DataInitializer
SELECT email, role
FROM users
ORDER BY email;
