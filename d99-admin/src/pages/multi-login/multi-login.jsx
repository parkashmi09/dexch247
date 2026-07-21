import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import Layout from '../../components/Layout'
import Toast from '../../utils/toast'
import {
  createMultiLogin,
  getMultiLoginList,
  setMultiLoginActive,
  changeMultiLoginPassword,
  deleteMultiLogin
} from '../../apiservices/multiLoginApi'
import ExecutivePermissionsModal from './ExecutivePermissionsModal'

import './style.css'

/**
 * The 23 grantable privileges as [key, label]. Single source for both the
 * create-account checkboxes and the edit modal. Keys are byte-identical with
 * d99-admin/src/utils/permissions.js and the backend requirePermission(...).
 */
const PRIVILEGE_FIELDS = [
  ['dashboard', 'DashBoard'],
  ['marketAnalysis', 'Market Analysis'],
  ['userList', 'User List'],
  ['insertUser', 'Insert User'],
  ['accountStatement', 'Account Statement'],
  ['partyWinLoss', 'Party Win Loss'],
  ['currentBets', 'Current Bets'],
  ['generalLock', 'General Lock'],
  ['casinoResult', 'Casino Result'],
  ['liveCasinoResult', 'Live Casino Result'],
  ['ourCasino', 'Our Casino'],
  ['events', 'Events'],
  ['marketSearchAnalysis', 'Market Search Analysis'],
  ['loginUserCreation', 'Login User creation'],
  ['withdraw', 'Withdraw'],
  ['deposit', 'Deposit'],
  ['creditReference', 'Credit Reference'],
  ['userInfo', 'User Info'],
  ['userPasswordChange', 'User Password Change'],
  ['userLock', 'User Lock'],
  ['betLock', 'Bet Lock'],
  ['activeUser', 'active user'],
  ['agentAssign', 'Agent Assign']
]

// Columns shown in the management table (compact subset; full set via Edit).
const TABLE_COLUMNS = [
  ['dashboard', 'DashBoard'],
  ['marketAnalysis', 'Market Analysis'],
  ['userList', 'User List'],
  ['insertUser', 'Insert User'],
  ['accountStatement', 'Account Statement'],
  ['partyWinLoss', 'Party Win Loss'],
  ['currentBets', 'Current Bets'],
  ['generalLock', 'General Lock'],
  ['casinoResult', 'Casino Result'],
  ['liveCasinoResult', 'Live Casino Result'],
  ['ourCasino', 'Our Casino']
]

const buildInitialPrivileges = () => {
  const p = { all: false }
  PRIVILEGE_FIELDS.forEach(([k]) => {
    p[k] = false
  })
  p.dashboard = true // default checked
  return p
}

function MultiLogin() {
  const [formData, setFormData] = useState({
    clientId: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    mpass: ''
  })

  const [privileges, setPrivileges] = useState(buildInitialPrivileges)
  const [loading, setLoading] = useState(false)
  const [executives, setExecutives] = useState([])
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchExecutives()
  }, [])

  const fetchExecutives = async () => {
    try {
      const res = await getMultiLoginList()
      if (!res?.success) {
        Toast.fire({ icon: 'error', title: 'Failed to load multi-login accounts' })
        return
      }
      setExecutives(res.executives || [])
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: err?.response?.data?.message || 'Error fetching multi-login accounts'
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePrivilegeChange = (key) => {
    setPrivileges((prev) => {
      if (key === 'all') {
        const val = !prev.all
        const next = { all: val }
        PRIVILEGE_FIELDS.forEach(([k]) => {
          next[k] = val
        })
        return next
      }
      const next = { ...prev, [key]: !prev[key] }
      next.all = PRIVILEGE_FIELDS.every(([k]) => next[k])
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.clientId || !formData.fullName || !formData.password || !formData.confirmPassword) {
      Toast.fire({ icon: 'error', title: 'Please fill in all required fields' })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      Toast.fire({ icon: 'error', title: 'Password and Confirm Password do not match' })
      return
    }
    if (!formData.mpass) {
      Toast.fire({ icon: 'error', title: 'Please enter Transaction Code' })
      return
    }

    // Build the permission map from the real privilege keys (drop the "all" helper).
    const permissions = {}
    PRIVILEGE_FIELDS.forEach(([k]) => {
      permissions[k] = !!privileges[k]
    })

    setLoading(true)
    try {
      const res = await createMultiLogin({
        username: formData.clientId,
        password: formData.password,
        permissions
      })

      if (res?.success) {
        Toast.fire({ icon: 'success', title: res.message || 'Multi Login account created' })
        handleReset()
        fetchExecutives()
      } else {
        Toast.fire({ icon: 'error', title: res?.message || 'Failed to create account' })
      }
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: error?.response?.data?.message || 'Failed to create account'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ clientId: '', fullName: '', password: '', confirmPassword: '', mpass: '' })
    setPrivileges(buildInitialPrivileges())
  }

  const handleToggleActive = async (exec) => {
    try {
      const res = await setMultiLoginActive(exec.id, !exec.active)
      if (res?.success) {
        Toast.fire({ icon: 'success', title: res.message })
        fetchExecutives()
      } else {
        Toast.fire({ icon: 'error', title: res?.message || 'Failed to update status' })
      }
    } catch (err) {
      Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Failed to update status' })
    }
  }

  const handleResetPassword = async (exec) => {
    const { value: password } = await Swal.fire({
      title: `Reset password — ${exec.username}`,
      input: 'password',
      inputLabel: 'New password',
      inputPlaceholder: 'Enter new password',
      showCancelButton: true,
      confirmButtonText: 'Update',
      inputValidator: (v) => (!v || v.length < 4 ? 'Minimum 4 characters' : undefined)
    })
    if (!password) return
    try {
      const res = await changeMultiLoginPassword(exec.id, password)
      Toast.fire({
        icon: res?.success ? 'success' : 'error',
        title: res?.message || (res?.success ? 'Password updated' : 'Failed')
      })
    } catch (err) {
      Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Failed to update password' })
    }
  }

  const handleDelete = async (exec) => {
    const result = await Swal.fire({
      title: `Delete ${exec.username}?`,
      text: 'This removes the multi-login account permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33'
    })
    if (!result.isConfirmed) return
    try {
      const res = await deleteMultiLogin(exec.id)
      if (res?.success) {
        Toast.fire({ icon: 'success', title: res.message })
        fetchExecutives()
      } else {
        Toast.fire({ icon: 'error', title: res?.message || 'Failed to delete' })
      }
    } catch (err) {
      Toast.fire({ icon: 'error', title: err?.response?.data?.message || 'Failed to delete' })
    }
  }

  return (
    <Layout title="Multi Login Account - Diamond Admin">
      <div>
        <h4 className="mb-0 page-title-box">Multi Login Account</h4>
        <div className="l">
          <div className="account-list-multi-login">
            {/* Form Section */}
            <div className="row">
              <div className="col-12">
                <form onSubmit={handleSubmit}>
                  <div className="create-account-form">
                    {/* Personal Information */}
                    <div className="row mb-4">
                      <div className="col-12">
                        <h5 className="mb-3">Personal Information</h5>
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="clientId">Client ID</label>
                        <input
                          type="text"
                          id="clientId"
                          name="clientId"
                          className="form-control"
                          value={formData.clientId}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          className="form-control"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="password">Password</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className="form-control"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Privileges */}
                    <div className="mt-2 previlages">
                      <h5 className="mb-0">Privileges</h5>
                      <div className="previlage-box">
                        <div className="previlage-item">
                          <div className="custom-control custom-checkbox">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="privilege-all"
                              checked={privileges.all}
                              onChange={() => handlePrivilegeChange('all')}
                            />
                            <label className="custom-control-label" htmlFor="privilege-all">
                              All
                            </label>
                          </div>
                        </div>
                        {PRIVILEGE_FIELDS.map(([key, label]) => (
                          <div className="previlage-item" key={key}>
                            <div className="custom-control custom-checkbox">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id={`privilege-${key}`}
                                checked={!!privileges[key]}
                                onChange={() => handlePrivilegeChange(key)}
                              />
                              <label className="custom-control-label" htmlFor={`privilege-${key}`}>
                                {label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="previlage-master mt-2">
                        <div className="form-group mb-0">
                          <input
                            type="password"
                            name="mpass"
                            placeholder="Transaction Code"
                            className="form-control mpass-text"
                            value={formData.mpass}
                            onChange={handleChange}
                            required
                          />
                          <button type="submit" className="btn btn-success" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit'}
                          </button>
                          <button type="button" id="reset" className="btn btn-light" onClick={handleReset}>
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Management Table */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="table-responsive">
                      <table className="table b-table table-bordered">
                        <thead>
                          <tr>
                            <th>Action</th>
                            <th>Username</th>
                            <th>Status</th>
                            {TABLE_COLUMNS.map(([key, label]) => (
                              <th key={key}>{label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {executives.length === 0 ? (
                            <tr>
                              <td colSpan={3 + TABLE_COLUMNS.length} className="text-center">
                                No data available
                              </td>
                            </tr>
                          ) : (
                            executives.map((exec) => {
                              const p = exec.permissions || {}
                              return (
                                <tr key={exec.id}>
                                  <td style={{ whiteSpace: 'nowrap' }}>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary mr-1"
                                      onClick={() => setEditing(exec)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      className={`btn btn-sm mr-1 ${exec.active ? 'btn-warning' : 'btn-success'}`}
                                      onClick={() => handleToggleActive(exec)}
                                    >
                                      {exec.active ? 'Disable' : 'Enable'}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-info mr-1"
                                      onClick={() => handleResetPassword(exec)}
                                    >
                                      Password
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleDelete(exec)}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                  <td>{exec.username}</td>
                                  <td>
                                    <span className={exec.active ? 'text-success' : 'text-danger'}>
                                      {exec.active ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  {TABLE_COLUMNS.map(([key]) => (
                                    <td key={key}>{p[key] ? '✓' : '-'}</td>
                                  ))}
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <ExecutivePermissionsModal
          executive={editing}
          fields={PRIVILEGE_FIELDS}
          onClose={() => setEditing(null)}
          onSaved={() => fetchExecutives()}
        />
      )}
    </Layout>
  )
}

export default MultiLogin
