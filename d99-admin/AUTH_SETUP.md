# Authentication Setup Guide

## Overview
This project uses **React Query** for API state management and **Redux Toolkit** for authentication state management.

## Architecture

### 1. **Config** (`src/config/api.js`)
- Centralized API configuration
- Base URL and endpoint definitions

### 2. **Redux Store** (`src/store/`)
- **store.js**: Main Redux store configuration
- **slices/authSlice.js**: Authentication state management
  - Stores token and user data
  - Handles login/logout actions
  - Persists to localStorage

### 3. **Services** (`src/services/`)
- **api.js**: Axios instance with interceptors
  - Automatically adds auth token to requests
  - Handles 401 errors (auto logout)
- **authService.js**: Authentication API calls

### 4. **Hooks** (`src/hooks/`)
- **useAuth.js**: Custom hook for authentication
  - Provides login/logout functions
  - Uses React Query mutations
  - Integrates with Redux store
- **redux.js**: Typed Redux hooks

### 5. **Components** (`src/components/`)
- **ProtectedRoute.jsx**: Route guard component
  - Redirects to login if not authenticated

## Usage

### Login Flow
1. User enters email and password
2. Form validates input
3. Calls `loginAsync()` from `useAuth` hook
4. On success:
   - Token stored in Redux and localStorage
   - User redirected to dashboard
5. On error:
   - Error message displayed

### Protected Routes
```jsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Using Auth Hook
```jsx
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { 
    token, 
    user, 
    isAuthenticated, 
    login, 
    loginAsync, 
    logout,
    isLoggingIn 
  } = useAuth()
  
  // Use auth state and functions
}
```

## API Endpoints

### Login
- **Endpoint**: `POST /auth/login`
- **Request**:
  ```json
  {
    "email": "testCompany1@gmail.com",
    "password": "testCompany1"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

## Environment Variables

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## File Structure
```
src/
├── config/
│   └── api.js              # API configuration
├── store/
│   ├── store.js            # Redux store
│   └── slices/
│       └── authSlice.js     # Auth state slice
├── services/
│   ├── api.js              # Axios instance
│   └── authService.js      # Auth API calls
├── hooks/
│   ├── useAuth.js          # Auth hook
│   └── redux.js            # Redux hooks
├── components/
│   └── ProtectedRoute.jsx  # Route guard
└── pages/
    ├── Login.jsx           # Login page
    └── Dashboard.jsx        # Protected dashboard
```

## Features
- ✅ Token-based authentication
- ✅ Automatic token injection in API requests
- ✅ Protected routes
- ✅ Auto-redirect on 401 errors
- ✅ Persistent login (localStorage)
- ✅ Real-time form validation
- ✅ Loading states
- ✅ Error handling

