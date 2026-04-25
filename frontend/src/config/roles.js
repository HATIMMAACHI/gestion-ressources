export const ROLES = {
  ENSEIGNANT: 'ENSEIGNANT',
  CHEF_DEPT: 'CHEF_DEPT',
  RESPONSABLE: 'RESPONSABLE',
  TECHNICIEN: 'TECHNICIEN',
  FOURNISSEUR: 'FOURNISSEUR',
}

export const ROLE_LABELS = {
  [ROLES.ENSEIGNANT]: 'Enseignant',
  [ROLES.CHEF_DEPT]: 'Chef de departement',
  [ROLES.RESPONSABLE]: 'Responsable d\'achats',
  [ROLES.TECHNICIEN]: 'Technicien',
  [ROLES.FOURNISSEUR]: 'Fournisseur',
}

export function hasAnyRole(user, roles) {
  if (!roles || roles.length === 0) return true
  if (!user?.role) return false
  return roles.includes(user.role)
}
