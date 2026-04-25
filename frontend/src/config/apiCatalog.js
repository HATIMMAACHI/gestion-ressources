export const apiModules = [
  {
    id: 'auth',
    label: 'Authentification',
    endpoints: [
      {
        id: 'auth-login',
        label: 'Connexion',
        method: 'POST',
        path: '/auth/login',
        bodyTemplate: {
          email: 'chef@info.faculte.ma',
          password: 'password',
        },
      },
      {
        id: 'auth-register-fournisseur',
        label: 'Inscrire fournisseur',
        method: 'POST',
        path: '/auth/register-fournisseur',
        bodyTemplate: {
          nomSociete: 'Societe Test',
          email: 'nouveau@fournisseur.com',
          password: 'password123',
        },
      },
    ],
  },
  {
    id: 'besoins',
    label: 'Besoins',
    endpoints: [
      {
        id: 'besoins-create',
        label: 'Creer besoin',
        method: 'POST',
        path: '/besoins',
        bodyTemplate: {
          typeRessource: 'ORDINATEUR',
          quantite: 5,
          specs: '{"ram":"16GB","cpu":"i7"}',
          motif: 'Renouvellement du parc informatique',
        },
      },
      {
        id: 'besoins-list',
        label: 'Lister besoins',
        method: 'GET',
        path: '/besoins',
        queryParams: ['departementId', 'statut'],
      },
    ],
  },
  {
    id: 'pannes',
    label: 'Maintenance & Pannes',
    endpoints: [
      {
        id: 'pannes-create',
        label: '1. Signaler panne',
        method: 'POST',
        path: '/pannes',
        bodyTemplate: {
          ressourceId: '',
          description: 'L\'ecran ne s\'allume plus.',
          dateApparition: '2026-04-01',
        },
      },
      {
        id: 'pannes-list',
        label: 'Lister pannes',
        method: 'GET',
        path: '/pannes',
        queryParams: ['statut', 'ressourceTypeId'],
      },
      {
        id: 'pannes-take-charge',
        label: '2. Prendre en charge (Tech)',
        method: 'PATCH',
        path: '/pannes/{id}/prendre-en-charge',
        pathParams: ['id'],
      },
      {
        id: 'pannes-resolve',
        label: '3a. Resoudre directement (Tech)',
        method: 'PATCH',
        path: '/pannes/{id}/resoudre',
        pathParams: ['id'],
      },
      {
        id: 'pannes-constat',
        label: '3b. Ajouter constat (Tech)',
        method: 'POST',
        path: '/pannes/{id}/constats',
        pathParams: ['id'],
        bodyTemplate: {
          explication: 'La carte mere est grillee suite a une surtension.',
          frequence: 'RARE',
          typePanne: 'MATERIEL',
        },
      },
      {
        id: 'pannes-decision',
        label: '4. Ajouter decision (Resp)',
        method: 'POST',
        path: '/pannes/{id}/decisions',
        pathParams: ['id'],
        bodyTemplate: {
          decision: 'RENVOYER_REPARER',
        },
      },
    ],
  },
  {
    id: 'ressources',
    label: 'Ressources',
    endpoints: [
      {
        id: 'ressources-list',
        label: 'Lister ressources',
        method: 'GET',
        path: '/ressources',
        queryParams: ['type', 'etat', 'fournisseurId'],
      },
    ],
  },
]

export const frontendHints = [
  'Enums utiles: TypeRessource (ORDINATEUR, IMPRIMANTE), StatutPanne (OUVERTE, EN_COURS, EN_ATTENTE_DECISION, ENVOYEE_FOURNISSEUR, RESOLUE).',
  'Types de panne: MATERIEL, LOGICIEL_SYSTEME, LOGICIEL_UTILITAIRE.',
  'Decisions: RENVOYER_REPARER, RENVOYER_CHANGER.',
  'Comptes de test: responsable@faculte.ma, technicien@faculte.ma (mot de passe: password).',
]
