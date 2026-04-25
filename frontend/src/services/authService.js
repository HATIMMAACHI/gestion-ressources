import { http, unwrapApiResponse } from './http'

export async function login(credentials) {
  const response = await http.post('/auth/login', credentials)
  return unwrapApiResponse(response)
}

export async function registerFournisseur(data) {
  const response = await http.post('/auth/register-fournisseur', data)
  return unwrapApiResponse(response)
}
