import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'
import { store } from '../store/store'
import { logout } from '../store/slices/authSlice'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const activeRole = localStorage.getItem('activeRole')
    let token = null

    if (activeRole === 'owner') {
      token = localStorage.getItem('ownerToken')
    } else if (activeRole === 'staff') {
      token = localStorage.getItem('staffToken')
    } else if (activeRole === 'executive') {
      token = localStorage.getItem('executiveToken')
    } else {
      // Fallback for backward compatibility
      token = localStorage.getItem('token')
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle 304 Not Modified - browser cached response, but we still need the data
    // Axios should handle this, but ensure we return the response
    if (response.status === 304 && response.data) {
      return response
    }
    return response
  },
  (error) => {
    // Handle 401 - Token expired or unauthorized
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Auto logging out...')
      // Dispatch logout action to clear Redux state
      store.dispatch(logout())
      
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('ownerToken')
      localStorage.removeItem('staffToken')
      localStorage.removeItem('executiveToken')
      localStorage.removeItem('executivePermissions')
      localStorage.removeItem('activeRole')
      localStorage.removeItem('user')
      
      // Redirect to login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const getSportsTree = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.GET_SPORTS_TREE)
    return response.data
  } catch (error) {
    console.error('Error fetching sports tree:', error)
    throw error
  }
}

export const getSportsData = async (id) => {
  try {
    const response = await api.post(API_ENDPOINTS.GET_SPORT_DATA, { id })
    return response.data
  } catch (error) {
    console.error('Error fetching sports data:', error)
    throw error
  }
}

export const getMatchPrivateData = async (gmid, sid) => {
  try {
    const response = await api.post(API_ENDPOINTS.GET_MATCH_PRIVATE_DATA, { gmid, sid })
    return response.data
  } catch (error) {
    console.error('Error fetching match private data:', error)
    throw error
  }
}

export const getNetExposure = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/d99/net-exposure/sports`)
    return response.data
  } catch (error) {
    console.error('Error fetching net exposure:', error)
    throw error
  }
}


export const getMatchExposureSummary = async (token, matchId) => {
  try {
    // Note: token is handled by interceptor in api.js usually, but if this function follows 
    // the pattern of userBookService.js from lord-admin which passes token explicitly, 
    // we might need to conform or adapt. 
    // The interceptor in this file (lines 16-39) automatically adds Authorization header 
    // if token exists in localStorage.
    // However, the source code uses `getAuthHeaders(token)` manually. 
    // Let's rely on the interceptor if possible, or support explicit token if strictly needed.
    // Checking the lord-admin service: it takes token and adds it. 
    // Here we can just make the call and let the interceptor handle it, 
    // OR if we want to support the exact signature:
    
    // adapting to use the axios instance 'api' which has interceptors
    const response = await api.get(`${API_BASE_URL}/d99/net-exposure?matchId=${matchId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching match exposure summary:', error)
    // Return error structure similar to lord-admin service if needed by component
    return { success: false, message: error.message }
  }
}

export const getSportsScoreCard = async (gmid, sid) => {
  try {
    const response = await api.post(API_ENDPOINTS.GET_SPORTS_SCORE_CARD, { gmid, sid })
    if (response.data && response.data.success && response.data.data?.score_url) {
      return response.data.data.score_url
    }
    return null
  } catch (error) {
    console.error('Error fetching scorecard:', error)
    return null
  }
}

export const searchByUsername = async (username, page = 1, limit = 10) => {
  try {
    const response = await api.get(`/admin/search-by-username`, {
      params: { username, page, limit }
    })
    return response.data
  } catch (error) {
    console.error('Error searching by username:', error)
    throw error
  }
}

export const getBetList = async (params) => {
  try {
    const response = await api.get(API_ENDPOINTS.REPORTS.CURRENT_BETS, { params })
    return response.data
  } catch (error) {
    console.error('Error fetching bet list:', error)
    throw error
  }
}

// Game-details page → fetches OPEN bets for a specific match, scoped strictly
// to the logged-in admin's downline. Owner sees all users in their tree, staff
// sees only their descendant chain. Backed by /admin/reports/match-downline-bets.
export const getMatchDownlineBets = async (params) => {
  try {
    const response = await api.get('/admin/reports/match-downline-bets', { params })
    return response.data
  } catch (error) {
    console.error('Error fetching match downline bets:', error)
    throw error
  }
}

export const getMatchedBetsByEvent = async (eventId) => {
  try {
    const response = await api.get(`/user/cricket/matched-bets/all?eventid=${eventId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching matched bets by event:', error)
    throw error
  }
}

export const getMarketAnalysis = async () => {
  try {
    const response = await api.post(API_ENDPOINTS.REPORTS.MARKET_ANALYSIS)
    return response.data
  } catch (error) {
    console.error('Error fetching market analysis:', error)
    throw error
  }
}

export const getTotalProfitLoss = async (params) => {
  try {
    const response = await api.post(API_ENDPOINTS.REPORTS.TOTAL_PROFIT_LOSS, params)
    return response.data
  } catch (error) {
    console.error('Error fetching total profit loss:', error)
    throw error
  }
}

export const getMarketUserBook = async (matchId, marketType) => {
  try {
    const response = await api.get(`/d99/net-exposure/market-book/${matchId}`, {
      params: { marketType }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching market user book:', error)
    return { success: false, message: error.message }
  }
}

export const declareResult = async (data) => {
  try {
    const response = await api.post(API_ENDPOINTS.INTERNALSETTLE.DECLARERESULT, data)
    return response.data
  } catch (error) {
    console.error('Error declaring result:', error)
    throw error
  }
}

export const voidBet = async (data) => {
  try {
    const response = await api.post(API_ENDPOINTS.INTERNALSETTLE.VOID, data)
    return response.data
  } catch (error) {
    console.error('Error voiding bet:', error)
    throw error
  }
}

export const getUserExposuresAdmin = async (userId) => {
  try {
    const response = await api.get(`/admin/user/exposures/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user exposures:', error)
    throw error
  }
}

export default api

