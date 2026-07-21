// Application Constants
export const APP_NAME = 'Diamond Admin'
export const APP_VERSION = '1.0.0'

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  ACCOUNTS: '/accounts',
}

// Color Utilities
export const getColorVariable = (colorName) => {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${colorName}`).trim()
}

