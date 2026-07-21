import api from './api'
import { API_ENDPOINTS } from '../config/api'
import { getDeviceId } from './deviceId'

export const authService = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { ...credentials, deviceId: getDeviceId() })
    return response.data
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get(API_ENDPOINTS.USER.PROFILE)
    return response.data
  },

  ownerLogin: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.OWNER_LOGIN, { ...credentials, deviceId: getDeviceId() })
    return response.data
  },

  // Executive (multi-login) accounts log in here. The backend returns
  // { success, token, executive } — the executive object carries the
  // permission map the frontend gate stores.
  executiveLogin: async (credentials) => {
    const username = credentials.username || credentials.email
    const response = await api.post('/executive/login', {
      username,
      password: credentials.password
    })
    return response.data
  },

  getOwnerProfile: async () => {
    const response = await api.get(API_ENDPOINTS.USER.OWNER_PROFILE)
    return response.data
  },
  updatePlatformConfigurations: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.UPDATE_PLATFORM_CONFIG, data)
    return response.data
  },

  // 2FA Methods
  verifyStaff2FA: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_2FA_STAFF, { ...data, deviceId: getDeviceId() })
    return response.data
  },

  verifyOwner2FA: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_2FA_OWNER, { ...data, deviceId: getDeviceId() })
    return response.data
  },

  generate2FALink: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.GENERATE_2FA_LINK)
    return response.data
  },

  verifyPassword: async (password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_PASSWORD, { password })
    return response.data
  },

  sendDisable2FACode: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.SEND_DISABLE_2FA_CODE)
    return response.data
  },

  disable2FA: async (data) => {
    const response = await api.post(API_ENDPOINTS.AUTH.DISABLE_2FA, data)
    return response.data
  },
}

