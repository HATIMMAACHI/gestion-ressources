# 🏗 Architecture Technique - Gestion des Ressources Faculté

Ce document détaille l'architecture logicielle et les choix technologiques du système de gestion des ressources.

---

## 🚀 1. Stack Technologique

### Frontend (Modern SPA)
*   **Framework** : React 18+ avec Vite.js (pour une compilation ultra-rapide).
*   **Styling** : CSS moderne avec variables CSS natives et Tailwind CSS pour les composants utilitaires.
*   **Gestion d'état** : React Context API (pour l'authentification et les notifications).
*   **Iconographie** : Lucide React (icons vectoriels légers).
*   **Animations** : Transitions CSS natives (optimisées pour la performance).
*   **Communication API** : Fetch API avec un wrapper `http.js` pour la gestion automatique des headers JWT.

### Backend (Robust Micro-service style)
*   **Framework** : Spring Boot 3.1.5 (Java 17).
*   **Sécurité** : Spring Security 6 avec Stateless JWT Authentication.
*   **Persistance** : Spring Data JPA.
*   **Validation** : Hibernate Validator (Bean Validation).
*   **Mapping** : MapStruct (pour une conversion DTO <-> Entity ultra-performante).
*   **Utilitaires** : Lombok (réduction du code boilerplate).

### Base de Données
*   **Moteur** : PostgreSQL (relationnel avec support JSONB).

---

## 🏛 2. Architecture de la Base de Données

### Héritage (Single Table Inheritance)
Le système utilise la stratégie `@Inheritance(strategy = InheritanceType.SINGLE_TABLE)` pour optimiser les performances :

1.  **Utilisateurs (`users`)** :
    *   Une seule table gère tous les rôles (`ENSEIGNANT`, `CHEF_DEPT`, `RESPONSABLE`, `TECHNICIEN`, `FOURNISSEUR`).
    *   Utilisation d'une colonne `dtype` (Discriminator) pour différencier les classes.
    *   Cela permet de lier n'importe quel acteur à une Panne ou un Besoin de manière uniforme.

2.  **Ressources (`ressources`)** :
    *   Héritage similaire pour différencier les `ORDINATEUR` des `IMPRIMANTE`.
    *   Permet une recherche globale simplifiée tout en conservant des propriétés spécifiques.

### Flexibilité JSONB
Les spécifications techniques (`specsJson`) sont stockées au format **JSONB**.
*   **Pourquoi ?** Contrairement à des colonnes fixes, le JSONB permet de stocker des specs différentes pour chaque matériel (ex: RAM/CPU pour PC vs Vitesse/Résolution pour Imprimante) sans modifier le schéma de la base.
*   **Performance** : PostgreSQL permet d'indexer les champs à l'intérieur du JSON pour des recherches rapides.

---

## 🧩 3. Architecture Backend (Layers)

Le backend suit le pattern standard **Controller-Service-Repository** :

1.  **Controller Layer** : Gère les requêtes HTTP et les permissions via `@PreAuthorize`.
2.  **Service Layer** : Contient la logique métier complexe (calcul de garantie, workflow de décision, filtrage par rôle).
3.  **Repository Layer** : Abstraction de la base de données. Utilisation de `JOIN FETCH` pour éviter le problème du "N+1 select" et optimiser les performances.
4.  **Security Layer** : Un filtre `JwtAuthenticationFilter` intercepte chaque requête, vérifie le token, et injecte l'utilisateur dans le contexte de sécurité.

---

## 🛠 4. Workflows Clés

### Système de Maintenance (Kanban)
*   **Statuts** : `OUVERTE` -> `EN_COURS` -> `EN_ATTENTE_DECISION` -> `ENVOYEE_FOURNISSEUR` -> `RESOLUE`.
*   **Garantie** : Calcul automatique au niveau du service : `dateLivraison + dureeGarantie`.
*   **Visibilité Fournisseur** : Filtrage strict au niveau SQL pour que le fournisseur ne voie que les ressources liées à son ID.

### Gestion des Besoins
*   **Dynamisme** : Le frontend génère un objet clé-valeur que le backend stocke tel quel en JSON.
*   **Validation** : Les transitions de statut (`BROUILLON` -> `VALIDE` -> `EN_APPEL`) sont protégées par une logique métier stricte.

---

## 🔐 5. Modèle de Sécurité

*   **Authentification** : Basée sur l'Email et le Mot de passe (BCrypt).
*   **Autorisation** : RBAC (Role-Based Access Control).
*   **JWT Payload** : Contient l'ID, l'Email et le Rôle pour minimiser les appels à la base de données lors de la vérification des droits.

---

## 📦 6. Structure du Projet

```text
/
├── frontend/             # React SPA (Vite)
│   ├── src/
│   │   ├── components/   # Composants UI réutilisables
│   │   ├── pages/        # Vues principales (Logique de routage)
│   │   ├── services/     # Appels API (Axios/Fetch wrappers)
│   │   └── contexts/     # Auth et State global
└── gestion-ressources/   # Backend Spring Boot
    ├── src/main/java/
    │   ├── config/       # Sécurité, CORS, Initialisation
    │   ├── controller/   # Endpoints REST
    │   ├── entity/       # Modèles JPA (Inheritance)
    │   ├── repository/   # Interfaces Spring Data
    │   └── service/      # Logique métier (impl/)
    └── src/main/resources/
        └── application.properties # Configuration DB & JWT
```
