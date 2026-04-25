import { http, unwrapApiResponse } from './http'

export async function getDepartements() {
  const response = await http.get('/departements')
  return unwrapApiResponse(response) || []
}
