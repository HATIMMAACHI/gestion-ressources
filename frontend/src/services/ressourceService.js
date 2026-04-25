import { http, unwrapApiResponse } from './http'

export async function getRessources(params = {}) {
  const response = await http.get('/ressources', { params })
  return unwrapApiResponse(response) || []
}

export async function getRessourceById(id) {
  const response = await http.get(`/ressources/${id}`)
  return unwrapApiResponse(response)
}

export async function createRessource(payload) {
  const response = await http.post('/ressources', payload)
  return unwrapApiResponse(response)
}

export async function updateRessource(id, payload) {
  const response = await http.put(`/ressources/${id}`, payload)
  return unwrapApiResponse(response)
}

export async function deleteRessource(id) {
  const response = await http.delete(`/ressources/${id}`)
  return unwrapApiResponse(response)
}
