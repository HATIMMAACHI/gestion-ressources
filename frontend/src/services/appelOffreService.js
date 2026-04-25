import { http, unwrapApiResponse } from './http'

export async function getAppelsOffre() {
  const response = await http.get('/appels-offre')
  return unwrapApiResponse(response) || []
}

export async function getAppelOffreById(id) {
  const response = await http.get(`/appels-offre/${id}`)
  return unwrapApiResponse(response)
}

export async function createAppelOffre(payload) {
  const response = await http.post('/appels-offre', payload)
  return unwrapApiResponse(response)
}

export async function getAffectationsPrevues(appelOffreId) {
  const response = await http.get(`/appels-offre/${appelOffreId}/affectations-prevues`)
  return unwrapApiResponse(response) || []
}

export async function cloreAppelOffre(id) {
  const response = await http.patch(`/appels-offre/${id}/clore`)
  return unwrapApiResponse(response)
}
