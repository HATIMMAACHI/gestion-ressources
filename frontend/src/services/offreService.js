import { http, unwrapApiResponse } from './http'

export async function createOffre(payload) {
  const response = await http.post('/offres', payload)
  return unwrapApiResponse(response)
}

export async function getOffres(params = {}) {
  const response = await http.get('/offres', { params })
  return unwrapApiResponse(response) || []
}

export async function getOffresByAppelOffre(appelOffreId) {
  const response = await http.get(`/offres/appel-offre/${appelOffreId}`)
  return unwrapApiResponse(response) || []
}

export async function getMyOffres() {
  const response = await http.get('/offres/me')
  return unwrapApiResponse(response) || []
}

export async function getOffreById(id) {
  const response = await http.get(`/offres/${id}`)
  return unwrapApiResponse(response)
}

export async function selectionnerOffre(id) {
  const response = await http.post(`/offres/${id}/selectionner`)
  return unwrapApiResponse(response)
}

export async function selectionnerMoinsDisant(appelOffreId) {
  const response = await http.post(`/offres/appel-offre/${appelOffreId}/selectionner-moins-disant`)
  return unwrapApiResponse(response)
}
