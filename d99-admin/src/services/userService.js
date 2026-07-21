import api from './api'
import { API_ENDPOINTS } from '../config/api'

const userService = {
  getAllDetails: async (page = 1, limit = 25, search = '', { exact } = {}) => {
    const params = { page, limit }
    if (exact) {
      params.exact = exact
    } else if (search) {
      params.search = search
    }
    const response = await api.get(API_ENDPOINTS.USER.ALL_DETAILS, { params })
    return response.data
  },
  checkUsername: async (username) => {
    const response = await api.get('/admin/check-username', { params: { username } })
    return response.data
  },
  createUser: async (data) => {
    const response = await api.post('/admin/users/create-under-parent', data)
    return response.data
  },
  createStaff: async (data) => {
    const response = await api.post('/admin/staff/create-staff', data)
    return response.data
  },
  updateStatusAndPassword: async (data) => {
    const response = await api.put('/admin/staff-user-update', data)
    return response.data
  },
  updateLoggedInStaffPassword: async (data) => {
    const response = await api.put('/admin/staff-update-password', data)
    return response.data
  },
  updateOwnerPassword: async (data) => {
    const response = await api.put('/admin/owner/update-password', data)
    return response.data
  }
}

export default userService
