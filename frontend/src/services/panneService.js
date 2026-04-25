import { http, unwrapApiResponse } from './http'

export async function getPannes(params = {}) {
  const response = await http.get('/pannes', { params })
  return unwrapApiResponse(response) || []
}

export async function getPanneById(id) {
  const response = await http.get(`/pannes/${id}`)
  return unwrapApiResponse(response)
}

export async function createPanne(payload) {
  const response = await http.post('/pannes', payload)
  return unwrapApiResponse(response)
}

/** Technicien prend en charge la panne (OUVERTE → EN_COURS) */
export async function prendreEnCharge(id) {
  const response = await http.patch(`/pannes/${id}/prendre-en-charge`)
  return unwrapApiResponse(response)
}

/** Technicien résout directement sans constat (EN_COURS → RESOLUE) */
export async function resolveDirectly(id) {
  const response = await http.patch(`/pannes/${id}/resoudre`)
  return unwrapApiResponse(response)
}

/** Technicien rédige un constat (EN_COURS → EN_ATTENTE_DECISION) */
export async function addConstat(id, payload) {
  const response = await http.post(`/pannes/${id}/constats`, payload)
  return unwrapApiResponse(response)
}

/** Responsable prend une décision (EN_ATTENTE_DECISION → ENVOYEE_FOURNISSEUR) */
export async function addDecision(id, payload) {
  const response = await http.post(`/pannes/${id}/decisions`, payload)
  return unwrapApiResponse(response)
}
