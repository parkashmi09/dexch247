import api from './api'
import { API_ENDPOINTS } from '../config/api'

const walletService = {
  addCash: async (data) => {
    console.log('addCash data:', data)
    const response = await api.post('/admin/wallet/cash/add', data)
    return response.data
  },
  subtractCash: async (data) => {
    const response = await api.post('/admin/wallet/cash/subtract', data)
    return response.data
  },
  addCredit: async (data) => {
    const response = await api.post('/admin/wallet/credit/add', data)
    return response.data
  }
}

export default walletService
