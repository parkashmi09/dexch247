import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import userService from '../../services/userService'
import Toast from '../../utils/toast'
import './add-account.css'

// Role definitions based on the provided screenshot
const ROLES = {
  OWNER: { id: 1, name: 'OWNER', label: 'Owner' },
  COMPANY: { id: 2, name: 'COMPANY', label: 'Company' },
  SUPERADMIN: { id: 3, name: 'SUPERADMIN', label: 'Super Admin' },
  ADMIN: { id: 4, name: 'ADMIN', label: 'Admin' },
  SUPERMASTER: { id: 5, name: 'SUPERMASTER', label: 'Super Master' },
  MASTER: { id: 6, name: 'MASTER', label: 'Master' },
  USER: { id: 7, name: 'USER', label: 'User' }
}

/**
 * AddAccount Component
 * 
 * Page for adding a new user account.
 * Restricts account creation based on logged-in user's role hierarchy.
 */
function AddAccount() {
  const [formData, setFormData] = useState({
    clientName: '',
    password: '',
    rpassword: '',
    fullName: '',
    city: '',
    phone: '',
    accountType: '',
    creditReference: '',
    comm: '',
    spart1: '',
    transactionPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [usernameTaken, setUsernameTaken] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const [availableRoles, setAvailableRoles] = useState([])

  // 🔎 Live username availability check (debounced). A username must be unique
  // across users AND staff AND owners — the backend checks all three.
  useEffect(() => {
    const name = formData.clientName.trim()
    if (!name) {
      setUsernameTaken(false)
      setCheckingUsername(false)
      return
    }
    setCheckingUsername(true)
    const timer = setTimeout(async () => {
      try {
        const res = await userService.checkUsername(name)
        setUsernameTaken(res && res.available === false)
      } catch (err) {
        setUsernameTaken(false)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [formData.clientName])

  // Determine current user's role on mount
  useEffect(() => {
    try {
      const activeRole = localStorage.getItem('activeRole')
      let roleId = null

      if (activeRole === 'owner') {
        roleId = ROLES.OWNER.id
      } else {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          // Try to map the user's role string to our ID, or use role_id if available
          // Assuming user object might look like { role: 'MASTER', ... } or { user_type: 'MASTER' ... }
          // Based on users.jsx: account.user_type is used.
          // Let's check common mappings if role_id is not explicit
          if (user.role_id) {
            roleId = parseInt(user.role_id)
          } else if (user.user_type || user.role) {
            const roleStr = (user.user_type || user.role).toUpperCase()
            const foundRole = Object.values(ROLES).find(r => r.name === roleStr)
            if (foundRole) {
              roleId = foundRole.id
            }
          }
        }
      }



      if (roleId) {
        // Filter roles strictly greater than current user's role ID (downline)
        const allowed = Object.values(ROLES).filter(r => r.id > roleId)
        setAvailableRoles(allowed)
      }
    } catch (error) {
      console.error('Error parsing user role:', error)
    }
  }, [])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear password error when user types
    if (name === 'transactionPassword' && passwordError) {
      setPasswordError('')
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.clientName || !formData.password || !formData.accountType) {
      Toast.fire({
        icon: 'error',
        title: 'Please fill in all required fields'
      });
      return
    }

    if (usernameTaken) {
      Toast.fire({
        icon: 'error',
        title: 'Username already exists'
      });
      return
    }

    if (formData.password !== formData.rpassword) {
      Toast.fire({
        icon: 'error',
        title: 'Password and Retype Password do not match'
      });
      return
    }

    // Password Validation
    if (!/[A-Z]/.test(formData.password)) {
      Toast.fire({
        icon: 'error',
        title: 'Password must contain at least one uppercase letter'
      });
      return
    }

    // Clear any previous errors
    setPasswordError('')

    setLoading(true)
    try {
      let response;
      const selectedRoleId = parseInt(formData.accountType)
      
      if (selectedRoleId === ROLES.USER.id) {
        // Create User
        const payload = {
          username: formData.clientName,
          email: formData.clientName + '@gmail.com', // Generating dummy email
          password: formData.password,
          phone_number: formData.phone || '1234567890',
          country: formData.city || 'India',
          transactionPassword: formData.transactionPassword,
          credit_ref: formData.creditReference || 0
        }
        response = await userService.createUser(payload)
      } else {
        // Create Staff (All other roles)
        // Find the role name from our constant
        const targetRole = Object.values(ROLES).find(r => r.id === selectedRoleId)
        
        if (!targetRole) {
          throw new Error('Invalid role selected')
        }

        // Validate percentage
        const percentage = parseFloat(formData.comm) || 0
        if (percentage < 0 || percentage > 100) {
            Toast.fire({
                icon: 'error',
                title: 'Commission must be between 0 and 100'
            });
            setLoading(false)
            return
        }

        const payload = {
          username: formData.clientName,
          email: formData.clientName + '@gmail.com',
          password: formData.password,
          role: targetRole.name, // Pass the role name string (e.g., 'MASTER')
          percentage: percentage,
          transactionPassword: formData.transactionPassword,
          phone_number: formData.phone,
          city: formData.city,
          credit_ref: formData.creditReference
        }
        response = await userService.createStaff(payload)
      }

      if (response.success || response.message === 'User created successfully' || response.id) {
        console.log('Create account success:', response)
        Toast.fire({
          icon: 'success',
          title: 'Account created successfully'
        });

        // Reset form
        setFormData({
          clientName: '',
          password: '',
          rpassword: '',
          fullName: '',
          city: '',
          phone: '',
          accountType: '',
          creditReference: '',
          comm: '',
          spart1: '',
          transactionPassword: ''
        })
        setPasswordError('')
      } else {
        Toast.fire({
          icon: 'error',
          title: response.message || 'Unknown error'
        });
      }

    } catch (error) {
      console.error('Error creating account:', error)
      Toast.fire({
        icon: 'error',
        title: error.response?.data?.error || error.response?.data?.message || error.message
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Add Account - Diamond Admin">
      <div className="listing-grid">
        <div className="add-account">
          <h2 className="m-b-20">Add Account</h2>

          <form method="post" onSubmit={handleSubmit}>
            <div className="row">
              {/* Personal Detail Section */}
              <div className="col-6">
                <h4 className="mb-4 col-12">Personal Detail</h4>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="clientname">Client Name:</label>
                      <input
                        type="text"
                        placeholder="Client Name"
                        name="clientName"
                        id="clientname"
                        className={`form-control ${usernameTaken ? 'is-invalid' : ''}`}
                        value={formData.clientName}
                        onChange={handleChange}
                        required
                      />
                      {usernameTaken && (
                        <div className="invalid-feedback d-block" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
                          username already exist
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="password">User Password:</label>
                      <input
                        type="password"
                        placeholder="User Password"
                        name="password"
                        id="password"
                        className="form-control"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="rpassword">Retype Password:</label>
                      <input
                        type="password"
                        placeholder="Retype Password"
                        name="rpassword"
                        id="rpassword"
                        className="form-control"
                        value={formData.rpassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="fullname">Full Name:</label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        name="fullName"
                        id="fullname"
                        className="form-control"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="city">City:</label>
                      <input
                        type="text"
                        placeholder="City"
                        name="city"
                        id="city"
                        className="form-control"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="phone">Phone:</label>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        name="phone"
                        id="phone"
                        maxLength="15"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Detail Section */}
              <div className="col-6">
                <h4 className="mb-4 col-12">Account Detail</h4>
                <div className="row">
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="accountType">Account Type:</label>
                      <select
                        name="accountType"
                        id="accountType"
                        className="form-control"
                        value={formData.accountType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Account Type</option>
                        {availableRoles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="creditReference">Credit Reference:</label>
                      <input
                        type="text"
                        placeholder="Credit Reference"
                        name="creditReference"
                        id="creditReference"
                        className="form-control"
                        value={formData.creditReference}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Settings Section */}
            <div className="row mt-4">
              <div className="col-12">
                <h4 className="mb-4 col-md-12">Commission Settings</h4>
                <table className="table table-striped table-bordered">
                  <tbody>
                    <tr>
                      <td>Upline</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>Downline</td>
                      <td>
                        <input
                          type="text"
                          name="comm"
                          id="comm"
                          placeholder="0"
                          maxLength="4"
                          className=""
                          value={formData.comm}
                          onChange={handleChange}
                          disabled={parseInt(formData.accountType) === ROLES.USER.id}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Our</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Partnership Section */}
            <div className="row mt-4">
              <div className="col-12">
                <h4 className="mb-4 col-md-12">Partnership</h4>
                <table className="table table-striped table-bordered">
                  <tbody>
                    <tr>
                      <td>Upline</td>
                      <td>0</td>
                    </tr>
                    <tr>
                      <td>Downline</td>
                      <td>
                        <div className="form-group">
                          <input
                            type="text"
                            name="spart1"
                            placeholder="0"
                            disabled={parseInt(formData.accountType) === ROLES.USER.id}
                            className=""
                            value={formData.spart1}
                            onChange={handleChange}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Our</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Transaction Password */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="form-group col-3 float-right">
                  <label htmlFor="transactionPassword">Transaction Password:</label>
                  <input
                    placeholder="Transaction Password"
                    value={formData.transactionPassword}
                    type="password"
                    name="transactionPassword"
                    id="transactionPassword"
                    className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                    onChange={handleChange}
                    required
                  />
                  {passwordError && (
                    <div className="invalid-feedback d-block">
                      {passwordError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="row m-t-20">
              <div className="col-md-12">
                <div className="float-right">
                  <button
                    type="submit"
                    className="btn btn-submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default AddAccount

