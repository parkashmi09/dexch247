import { useSelector } from 'react-redux'
import { useAuth } from '../hooks/useAuth'

function DashboardHeader() {
  const { user } = useSelector((state) => state.auth)
  const { logout } = useAuth()

  return (
    <header className="dashboard-header" style={{
      background: '#fff',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: "'Roboto Condensed', sans-serif" }}>
          Diamond Admin
        </h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <div style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
            <span style={{ marginRight: '1rem' }}>
              {user.username} ({user.user_type})
            </span>
          </div>
        )}
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{
            fontFamily: "'Roboto Condensed', sans-serif",
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default DashboardHeader

