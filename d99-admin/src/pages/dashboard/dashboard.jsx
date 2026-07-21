import { useSelector } from 'react-redux'
import Layout from '../../components/Layout'

/**
 * Dashboard Component
 * 
 * Main dashboard page displaying user information and overview.
 */
function Dashboard() {
  const { user } = useSelector((state) => state.auth)

  return (
    <Layout title="Dashboard - Diamond Admin">
      <div className="row">
        <div className="col-12">
          <h1>Dashboard</h1>
          <p>Welcome to Diamond Admin Dashboard</p>
          
          {user && (
            <div className="mt-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">User Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Username:</strong> {user.username}</p>
                      <p><strong>User Type:</strong> {user.user_type}</p>
                      <p><strong>Role:</strong> {user.role}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Level:</strong> {user.level}</p>
                      <p><strong>Balance:</strong> ₹{user.inr_balance}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard

