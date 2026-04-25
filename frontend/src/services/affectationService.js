import { http, unwrapApiResponse } from './http'

export async function getAffectations(params = {}) {
  const response = await http.get('/affectations', { params })
  return unwrapApiResponse(response) || []
}

export async function createAffectation(payload) {
  const response = await http.post('/affectations', payload)
  return unwrapApiResponse(response)
}

export async function updateAffectation(id, payload) {
  const response = await http.put(`/affectations/${id}`, payload)
  return unwrapApiResponse(response)
}

export async function deleteAffectation(id) {
  const response = await http.delete(`/affectations/${id}`)
  return unwrapApiResponse(response)
}
