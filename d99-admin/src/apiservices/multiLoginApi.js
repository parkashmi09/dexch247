import api from '../services/api'

/**
 * Executive (multi-login) management API client.
 * Mirrors d99-server/routes/executive/executiveRoutes.js.
 */

/** Create a new executive account. */
export const createMultiLogin = async (data) => {
  const response = await api.post('/executive/create', data)
  return response.data
}

/** List executives owned by the caller. */
export const getMultiLoginList = async () => {
  const response = await api.get('/executive/list')
  return response.data
}

/** Update an executive (permissions / email / active). */
export const updateMultiLogin = async (id, data) => {
  const response = await api.put(`/executive/${id}`, data)
  return response.data
}

/** Enable/disable an executive login (kill switch). Omit `active` to toggle. */
export const setMultiLoginActive = async (id, active) => {
  const response = await api.patch(`/executive/${id}/active`, { active })
  return response.data
}

/** Reset an executive's password. */
export const changeMultiLoginPassword = async (id, password) => {
  const response = await api.post(`/executive/${id}/password`, { password })
  return response.data
}

/** Delete an executive. */
export const deleteMultiLogin = async (id) => {
  const response = await api.delete(`/executive/${id}`)
  return response.data
}
