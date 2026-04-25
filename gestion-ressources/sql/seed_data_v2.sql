-- Script SQL de test corrigé (v2.2) avec GARANTIE

DO $$
DECLARE
    fourn_id UUID;
    enseignant_id UUID;
    chef_id UUID;
    tech_id UUID;
    panne_1_id UUID := gen_random_uuid();
    panne_2_id UUID := gen_random_uuid();
    panne_3_id UUID := gen_random_uuid();
    res_1_id UUID := gen_random_uuid();
    res_2_id UUID := gen_random_uuid();
    res_3_id UUID := gen_random_uuid();
BEGIN
    -- 1. Récupération des IDs des utilisateurs existants
    SELECT id INTO fourn_id FROM users WHERE role = 'FOURNISSEUR' LIMIT 1;
    SELECT id INTO enseignant_id FROM users WHERE email = 'enseignant@info.faculte.ma' LIMIT 1;
    SELECT id INTO chef_id FROM users WHERE email = 'chef@info.faculte.ma' LIMIT 1;
    SELECT id INTO tech_id FROM users WHERE role = 'TECHNICIEN' LIMIT 1;

    -- 2. Insertion de ressources avec fournisseur et garantie
    -- Dell XPS 15 : Garantie 24 mois (Valide)
    INSERT INTO ressources (id, type, marque, code_inventaire, etat, date_livraison, duree_garantie, specs_json, fournisseur_id) VALUES
    (res_1_id, 'ORDINATEUR', 'Dell XPS 15', 'INV-INF-001', 'AFFECTEE', CURRENT_DATE - 100, 24, '{"ram": "32GB", "cpu": "i9"}', fourn_id);
    
    -- MacBook Pro : Garantie 12 mois (Expirée - Livré il y a 500 jours)
    INSERT INTO ressources (id, type, marque, code_inventaire, etat, date_livraison, duree_garantie, specs_json, fournisseur_id) VALUES
    (res_2_id, 'ORDINATEUR', 'MacBook Pro', 'INV-INF-002', 'DISPONIBLE', CURRENT_DATE - 500, 12, '{"ram": "16GB", "cpu": "M3"}', fourn_id);
    
    -- HP LaserJet : Garantie 12 mois (Valide)
    INSERT INTO ressources (id, type, marque, code_inventaire, etat, date_livraison, duree_garantie, specs_json, fournisseur_id) VALUES
    (res_3_id, 'IMPRIMANTE', 'HP LaserJet', 'INV-INF-003', 'AFFECTEE', CURRENT_DATE - 30, 12, '{"vitesse": "40ppm", "couleur": "N&B"}', fourn_id);

    -- 3. Panne OUVERTE
    INSERT INTO pannes (id, ressource_id, signaled_by_id, description, date_apparition, statut)
    VALUES (panne_1_id, res_1_id, enseignant_id, 'L''écran scintille violemment après 10 minutes.', CURRENT_DATE - 2, 'OUVERTE');

    -- 4. Panne EN_COURS
    INSERT INTO pannes (id, ressource_id, signaled_by_id, description, date_apparition, statut)
    VALUES (panne_2_id, res_3_id, enseignant_id, 'Imprimante bourre systématiquement sur le bac 2.', CURRENT_DATE - 5, 'EN_COURS');

    -- 5. Panne EN_ATTENTE_DECISION avec CONSTAT (Celle-ci est Hors Garantie)
    INSERT INTO pannes (id, ressource_id, signaled_by_id, description, date_apparition, statut, est_severe)
    VALUES (panne_3_id, res_2_id, chef_id, 'Impossible de démarrer le système (Kernel Panic).', CURRENT_DATE - 1, 'EN_ATTENTE_DECISION', true);

    INSERT INTO constats (id, panne_id, technicien_id, explication, frequence, type_panne, date_constat, notification_envoyee)
    VALUES (gen_random_uuid(), panne_3_id, tech_id, 'Le SSD est défaillant, provoquant des erreurs de lecture système critiques.', 'PERMANENTE', 'LOGICIEL_SYSTEME', CURRENT_DATE, true);

END $$;
