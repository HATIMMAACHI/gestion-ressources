import { http, unwrapApiResponse } from './http'

export async function getFournisseurs(params = {}) {
  const response = await http.get('/fournisseurs', { params })
  return unwrapApiResponse(response) || []
}

export async function getMyFournisseur() {
  const response = await http.get('/fournisseurs/me')
  return unwrapApiResponse(response)
}

export async function updateFournisseur(id, payload) {
  const response = await http.put(`/fournisseurs/${id}`, payload)
  return unwrapApiResponse(response)
}

export async function bannirFournisseur(id, payload) {
  const response = await http.post(`/fournisseurs/${id}/bannir`, payload)
  return unwrapApiResponse(response)
}

export async function rehabiliterFournisseur(id) {
  const response = await http.post(`/fournisseurs/${id}/rehabiliter`)
  return unwrapApiResponse(response)
}
