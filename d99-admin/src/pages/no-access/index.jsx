import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getStoredPermissions, PERMISSION_LABELS } from '../../utils/permissions'

/**
 * Shown when an executive (multi-login) account has been granted no routable
 * privilege, or a route guard bounced here. Lists the effective role + the
 * privileges they actually hold, and offers Logout.
 */
function NoAccess() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  let user = {}
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}') || {}
  } catch {
    user = {}
  }

  const perms = getStoredPermissions()
  const granted = Object.keys(perms).filter((k) => perms[k] && PERMISSION_LABELS[k])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f5f7',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          padding: '32px',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center'
        }}
      >
        <h3 style={{ marginBottom: '8px' }}>No Access</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Your account{user?.username ? ` (${user.username})` : ''} has not been
          granted access to any page. Please contact your administrator.
        </p>

        {user?.role && (
          <p style={{ marginBottom: '8px' }}>
            <strong>Role:</strong> {user.role}
          </p>
        )}

        <div style={{ textAlign: 'left', margin: '16px 0' }}>
          <strong>Granted privileges:</strong>
          {granted.length ? (
            <ul style={{ marginTop: '8px' }}>
              {granted.map((k) => (
                <li key={k}>{PERMISSION_LABELS[k]}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#999', marginTop: '8px' }}>None</p>
          )}
        </div>

        <button type="button" className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default NoAccess
