import { http, unwrapApiResponse } from './http'

export async function getReunions(params = {}) {
  const response = await http.get('/reunions', { params })
  return unwrapApiResponse(response) || []
}

export async function createReunion({ departementId, notes, besoinIds = [] }) {
  const response = await http.post('/reunions', { departementId, notes, besoinIds })
  return unwrapApiResponse(response)
}

export async function cloturerReunion(id) {
  const response = await http.put(`/reunions/${id}/cloturer`)
  return unwrapApiResponse(response)
}
