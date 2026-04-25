import { http, unwrapApiResponse } from './http'

export async function getBesoins(params = {}) {
  const response = await http.get('/besoins', { params })
  return unwrapApiResponse(response) || []
}

export async function createBesoin(payload) {
  const response = await http.post('/besoins', payload)
  return unwrapApiResponse(response)
}

export async function updateBesoin(id, payload) {
  const response = await http.put(`/besoins/${id}`, payload)
  return unwrapApiResponse(response)
}

export async function updateBesoinStatus(id, statut, currentStatut) {
  if (currentStatut && currentStatut === statut) {
    return { skipped: true }
  }

  const response = await http.patch(`/besoins/${id}/statut`, { statut })
  return unwrapApiResponse(response)
}

export async function deleteBesoin(id) {
  const response = await http.delete(`/besoins/${id}`)
  return unwrapApiResponse(response)
}
