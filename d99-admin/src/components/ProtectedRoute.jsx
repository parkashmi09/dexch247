import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { isExecutive, can, permissionForPath, firstAllowedRoute } from '../utils/permissions'

function ProtectedRoute({ children, requires }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If user data is not loaded yet, wait (could show loader here if needed)
  // For now, we allow access since authentication is verified
  if (!user) {
    return children
  }

  // If first login is required (first_login is false), redirect to reset password
  if (user.first_login === false) {
    return <Navigate to="/reset-password" replace />
  }

  // Executive permission gate (cosmetic — backend is the real enforcement).
  // Only bites executives; owners/staff pass through (can() returns true).
  // `requires` prop wins; otherwise derive the key from the current path.
  if (isExecutive()) {
    const requiredKey = requires || permissionForPath(location.pathname)
    if (requiredKey && !can(requiredKey)) {
      const target = firstAllowedRoute()
      // Avoid a redirect loop if the landing target is the current page.
      if (target !== location.pathname) {
        return <Navigate to={target} replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
