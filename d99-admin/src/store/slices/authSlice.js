import { createSlice } from '@reduxjs/toolkit'

const getInitialToken = () => {
  const activeRole = localStorage.getItem('activeRole')
  if (activeRole === 'owner') return localStorage.getItem('ownerToken')
  if (activeRole === 'staff') return localStorage.getItem('staffToken')
  if (activeRole === 'executive') return localStorage.getItem('executiveToken')
  return localStorage.getItem('token')
}

const getInitialUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

const initialState = {
  token: getInitialToken() || null,
  // Executives have no profile API; restore their user (carries permissions)
  // straight from localStorage so the gate works on a hard reload.
  user: localStorage.getItem('activeRole') === 'executive' ? getInitialUser() : null,
  isAuthenticated: !!getInitialToken(),
  role: localStorage.getItem('activeRole') || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, role } = action.payload
      state.token = token
      state.user = user
      state.isAuthenticated = true
      state.role = role

      localStorage.setItem('activeRole', role)

      if (role === 'owner') {
        localStorage.setItem('ownerToken', token)
      } else if (role === 'executive') {
        // Executive (multi-login) session: stash its token + the permission
        // map the gate reads everywhere.
        localStorage.setItem('executiveToken', token)
        localStorage.setItem('token', token)
        localStorage.setItem('executivePermissions', JSON.stringify(user?.permissions || {}))
      } else {
        localStorage.setItem('staffToken', token)
        // Keep generic token for backward compatibility if needed, or remove it
        localStorage.setItem('token', token)
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.role = null
      localStorage.removeItem('token')
      localStorage.removeItem('ownerToken')
      localStorage.removeItem('staffToken')
      localStorage.removeItem('executiveToken')
      localStorage.removeItem('executivePermissions')
      localStorage.removeItem('activeRole')
      localStorage.removeItem('user')
    },
    updateUser: (state, action) => {
      state.user = action.payload
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
  },
})

export const { setCredentials, logout, updateUser } = authSlice.actions
export default authSlice.reducer

