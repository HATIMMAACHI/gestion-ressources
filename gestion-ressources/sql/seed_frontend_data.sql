-- Seed data for realistic frontend usage (idempotent)
-- Database: gestion_ressources

CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- Ensure department budgets are set for dashboard views
UPDATE departements
SET budget = CASE
    WHEN nom = 'Informatique' THEN 450000
    WHEN nom = 'Mathématiques' THEN 300000
    ELSE budget
END
WHERE nom IN ('Informatique', 'Mathématiques');

-- Ensure supplier users exist
INSERT INTO users (id, nom, email, password_hash, role, departement_id)
SELECT gen_random_uuid(), 'Fournisseur Nouveau', 'nouveau@fournisseur.com',
       '$2a$10$7QJ3h6XkY6h1x8v8h8c1Uu8N6z7aYwQ2f9Qk2E8Hf7S1x4wCw7g7y', 'FOURNISSEUR', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'nouveau@fournisseur.com');

-- Ensure fournisseurs linked to supplier users
INSERT INTO fournisseurs (id, nom_societe, adresse, site_web, gerant, est_liste_noire, motif_bannissement, user_id)
SELECT gen_random_uuid(), 'TechnoSup SARL', 'Rabat, Maroc', 'https://technosup.ma', 'Youssef Karim', false, NULL, u.id
FROM users u
WHERE u.email = 'contact@fournisseur.com'
  AND NOT EXISTS (SELECT 1 FROM fournisseurs f WHERE f.user_id = u.id);

INSERT INTO fournisseurs (id, nom_societe, adresse, site_web, gerant, est_liste_noire, motif_bannissement, user_id)
SELECT gen_random_uuid(), 'Atlas Equipements', 'Casablanca, Maroc', 'https://atlas-equipements.ma', 'Nadia El Fassi', false, NULL, u.id
FROM users u
WHERE u.email = 'nouveau@fournisseur.com'
  AND NOT EXISTS (SELECT 1 FROM fournisseurs f WHERE f.user_id = u.id);

-- One open and one closed appel d'offre
INSERT INTO appels_offre (id, date_debut, date_fin, statut, responsable_id)
SELECT gen_random_uuid(), CURRENT_DATE - 10, CURRENT_DATE + 20, 'OUVERT', u.id
FROM users u
WHERE u.email = 'responsable@faculte.ma'
  AND NOT EXISTS (
      SELECT 1
      FROM appels_offre ao
      WHERE ao.responsable_id = u.id
        AND ao.statut = 'OUVERT'
  );

INSERT INTO appels_offre (id, date_debut, date_fin, statut, responsable_id)
SELECT gen_random_uuid(), CURRENT_DATE - 60, CURRENT_DATE - 30, 'CLOS', u.id
FROM users u
WHERE u.email = 'responsable@faculte.ma'
  AND NOT EXISTS (
      SELECT 1
      FROM appels_offre ao
      WHERE ao.responsable_id = u.id
        AND ao.statut = 'CLOS'
  );

-- Add offers for both suppliers on the latest open appel d'offre
WITH open_ao AS (
  SELECT id
  FROM appels_offre
  WHERE statut = 'OUVERT'
  ORDER BY date_debut DESC
  LIMIT 1
), f1 AS (
  SELECT id FROM fournisseurs WHERE nom_societe = 'TechnoSup SARL' LIMIT 1
), f2 AS (
  SELECT id FROM fournisseurs WHERE nom_societe = 'Atlas Equipements' LIMIT 1
)
INSERT INTO offres (id, appel_offre_id, fournisseur_id, date_livraison, duree_garantie_mois, prix_total, detail_json, statut)
SELECT gen_random_uuid(), oa.id, f1.id, CURRENT_DATE + 15, 24, 68000.00,
       '{"items":[{"type":"ORDINATEUR","qte":8},{"type":"IMPRIMANTE","qte":2}]}'::jsonb,
       'ACCEPTEE'
FROM open_ao oa, f1
WHERE NOT EXISTS (
  SELECT 1 FROM offres o WHERE o.appel_offre_id = oa.id AND o.fournisseur_id = f1.id
);

WITH open_ao AS (
  SELECT id
  FROM appels_offre
  WHERE statut = 'OUVERT'
  ORDER BY date_debut DESC
  LIMIT 1
), f2 AS (
  SELECT id FROM fournisseurs WHERE nom_societe = 'Atlas Equipements' LIMIT 1
)
INSERT INTO offres (id, appel_offre_id, fournisseur_id, date_livraison, duree_garantie_mois, prix_total, detail_json, statut)
SELECT gen_random_uuid(), oa.id, f2.id, CURRENT_DATE + 18, 18, 65500.00,
       '{"items":[{"type":"ORDINATEUR","qte":7},{"type":"IMPRIMANTE","qte":2}]}'::jsonb,
       'EN_ATTENTE'
FROM open_ao oa, f2
WHERE NOT EXISTS (
  SELECT 1 FROM offres o WHERE o.appel_offre_id = oa.id AND o.fournisseur_id = f2.id
);

-- Add resources linked to accepted offer
WITH accepted_offer AS (
  SELECT o.id, o.fournisseur_id
  FROM offres o
  WHERE o.statut = 'ACCEPTEE'
  ORDER BY o.date_livraison DESC
  LIMIT 1
)
INSERT INTO ressources (id, code_inventaire, type, marque, specs_json, etat, date_livraison, fournisseur_id, offre_id)
SELECT gen_random_uuid(), 'PC-INF-001', 'ORDINATEUR', 'Dell', '{"cpu":"i7","ram":"16GB","ssd":"512GB"}'::jsonb,
       'AFFECTEE', CURRENT_DATE - 5, ao.fournisseur_id, ao.id
FROM accepted_offer ao
WHERE NOT EXISTS (SELECT 1 FROM ressources r WHERE r.code_inventaire = 'PC-INF-001');

WITH accepted_offer AS (
  SELECT o.id, o.fournisseur_id
  FROM offres o
  WHERE o.statut = 'ACCEPTEE'
  ORDER BY o.date_livraison DESC
  LIMIT 1
)
INSERT INTO ressources (id, code_inventaire, type, marque, specs_json, etat, date_livraison, fournisseur_id, offre_id)
SELECT gen_random_uuid(), 'PC-INF-002', 'ORDINATEUR', 'HP', '{"cpu":"i5","ram":"16GB","ssd":"1TB"}'::jsonb,
       'DISPONIBLE', CURRENT_DATE - 5, ao.fournisseur_id, ao.id
FROM accepted_offer ao
WHERE NOT EXISTS (SELECT 1 FROM ressources r WHERE r.code_inventaire = 'PC-INF-002');

WITH accepted_offer AS (
  SELECT o.id, o.fournisseur_id
  FROM offres o
  WHERE o.statut = 'ACCEPTEE'
  ORDER BY o.date_livraison DESC
  LIMIT 1
)
INSERT INTO ressources (id, code_inventaire, type, marque, specs_json, etat, date_livraison, fournisseur_id, offre_id)
SELECT gen_random_uuid(), 'IMP-MTH-001', 'IMPRIMANTE', 'Epson', '{"mode":"laser","couleur":false}'::jsonb,
       'EN_PANNE', CURRENT_DATE - 5, ao.fournisseur_id, ao.id
FROM accepted_offer ao
WHERE NOT EXISTS (SELECT 1 FROM ressources r WHERE r.code_inventaire = 'IMP-MTH-001');

-- Create affectation on one resource
INSERT INTO affectations (id, ressource_id, departement_id, utilisateur_id, date_affectation, actif, type_affectation)
SELECT gen_random_uuid(), r.id, d.id, u.id, CURRENT_DATE - 3, true, 'INDIVIDUELLE'
FROM ressources r
JOIN departements d ON d.nom = 'Informatique'
JOIN users u ON u.email = 'enseignant@info.faculte.ma'
WHERE r.code_inventaire = 'PC-INF-001'
  AND NOT EXISTS (SELECT 1 FROM affectations a WHERE a.ressource_id = r.id);

-- Create meeting and link a besoin to it
INSERT INTO reunions (id, departement_id, chef_dept_id, date_convocation, statut, notes)
SELECT gen_random_uuid(), d.id, u.id, NOW() - INTERVAL '2 day', 'CONVOQUEE', 'Réunion de priorisation des besoins matériels.'
FROM departements d
JOIN users u ON u.email = 'chef@info.faculte.ma'
WHERE d.nom = 'Informatique'
  AND NOT EXISTS (
      SELECT 1 FROM reunions r
      WHERE r.departement_id = d.id
        AND r.statut = 'CONVOQUEE'
  );

-- Ensure enough besoins for frontend lists
INSERT INTO besoins (id, type_ressource, quantite, specs_json, demandeur_id, departement_id, motif, statut, appel_offre_id, reunion_id)
SELECT gen_random_uuid(), 'ORDINATEUR', 6,
       '{"cpu":"i5 minimum","ram":"16GB","stockage":"SSD"}'::jsonb,
       du.id, d.id,
       'Renouvellement du parc de la salle TP.',
       'EN_APPEL', ao.id, r.id
FROM users du
JOIN departements d ON d.nom = 'Informatique'
JOIN users chef ON chef.email = 'chef@info.faculte.ma'
LEFT JOIN appels_offre ao ON ao.statut = 'OUVERT'
LEFT JOIN reunions r ON r.departement_id = d.id AND r.chef_dept_id = chef.id
WHERE du.email = 'enseignant@info.faculte.ma'
  AND NOT EXISTS (
      SELECT 1 FROM besoins b
      WHERE b.motif = 'Renouvellement du parc de la salle TP.'
  );

INSERT INTO besoins (id, type_ressource, quantite, specs_json, demandeur_id, departement_id, motif, statut, appel_offre_id, reunion_id)
SELECT gen_random_uuid(), 'IMPRIMANTE', 2,
       '{"impression":"duplex","reseau":"ethernet"}'::jsonb,
       du.id, d.id,
       'Besoin imprimantes pour secrétariat du département.',
       'VALIDE', NULL, r.id
FROM users du
JOIN departements d ON d.nom = 'Mathématiques'
LEFT JOIN reunions r ON r.departement_id = d.id
WHERE du.email = 'chef@info.faculte.ma'
  AND NOT EXISTS (
      SELECT 1 FROM besoins b
      WHERE b.motif = 'Besoin imprimantes pour secrétariat du département.'
  );

-- Planned affectation from open appel d'offre
INSERT INTO affectations_prevues (id, appel_offre_id, besoin_id, utilisateur_id, departement_id)
SELECT gen_random_uuid(), ao.id, b.id, u.id, d.id
FROM appels_offre ao
JOIN besoins b ON b.appel_offre_id = ao.id
JOIN users u ON u.email = 'enseignant@info.faculte.ma'
JOIN departements d ON d.nom = 'Informatique'
WHERE ao.statut = 'OUVERT'
  AND b.motif = 'Renouvellement du parc de la salle TP.'
  AND NOT EXISTS (
      SELECT 1 FROM affectations_prevues ap
      WHERE ap.appel_offre_id = ao.id AND ap.besoin_id = b.id
  );

-- Create one open panne and one constat to feed maintenance pages
INSERT INTO pannes (id, ressource_id, signaled_by_id, date_apparition, description, statut)
SELECT gen_random_uuid(), r.id, u.id, CURRENT_DATE - 1,
       'Bourrage papier répété et bruit anormal au démarrage.',
       'EN_COURS'
FROM ressources r
JOIN users u ON u.email = 'enseignant@info.faculte.ma'
WHERE r.code_inventaire = 'IMP-MTH-001'
  AND NOT EXISTS (SELECT 1 FROM pannes p WHERE p.ressource_id = r.id AND p.statut <> 'RESOLUE');

INSERT INTO constats (id, panne_id, technicien_id, explication, frequence, type_panne, decision_responsable, date_constat, notification_envoyee)
SELECT gen_random_uuid(), p.id, t.id,
       'Usure du rouleau d''entrainement, remplacement recommandé.',
       'FREQUENTE', 'MATERIEL', 'REPARER', CURRENT_DATE, true
FROM pannes p
JOIN users t ON t.email = 'technicien@faculte.ma'
JOIN ressources r ON r.id = p.ressource_id
WHERE r.code_inventaire = 'IMP-MTH-001'
  AND NOT EXISTS (SELECT 1 FROM constats c WHERE c.panne_id = p.id);

COMMIT;

-- Quick checks
SELECT 'users' AS table_name, COUNT(*) AS total FROM users
UNION ALL SELECT 'fournisseurs', COUNT(*) FROM fournisseurs
UNION ALL SELECT 'appels_offre', COUNT(*) FROM appels_offre
UNION ALL SELECT 'offres', COUNT(*) FROM offres
UNION ALL SELECT 'ressources', COUNT(*) FROM ressources
UNION ALL SELECT 'affectations', COUNT(*) FROM affectations
UNION ALL SELECT 'besoins', COUNT(*) FROM besoins
UNION ALL SELECT 'affectations_prevues', COUNT(*) FROM affectations_prevues
UNION ALL SELECT 'reunions', COUNT(*) FROM reunions
UNION ALL SELECT 'pannes', COUNT(*) FROM pannes
UNION ALL SELECT 'constats', COUNT(*) FROM constats
ORDER BY table_name;
