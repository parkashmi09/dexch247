import { useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import Layout from '../../components/Layout'
import userService from '../../services/userService'
import Toast from '../../utils/toast'
import '../reports/style.css'

// Persistent dialog that shows a freshly-generated transaction password,
// with a copy-to-clipboard button.
export const showTransactionPassword = (txnPassword, who) => {
  if (!txnPassword) return
  Swal.fire({
    icon: 'success',
    title: 'New Transaction Password',
    html: `${who ? `For <b>${who}</b><br/>` : ''}`
      + `<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px">`
      + `<span id="txnpw-value" style="font-size:1.8rem;font-weight:700;letter-spacing:4px">${txnPassword}</span>`
      + `<button id="txnpw-copy" type="button" title="Copy" style="border:1px solid #ccc;background:#fff;border-radius:6px;padding:4px 9px;cursor:pointer;font-size:1.1rem;line-height:1">📋</button>`
      + `</div>`
      + `<div style="font-size:0.8rem;color:#888;margin-top:10px">Save this — it is required for transactions and won't be shown again.</div>`,
    confirmButtonText: 'I have saved it',
    allowOutsideClick: false,
    didOpen: () => {
      const btn = document.getElementById('txnpw-copy')
      if (!btn) return
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(String(txnPassword))
        } catch (e) {
          const ta = document.createElement('textarea')
          ta.value = String(txnPassword)
          document.body.appendChild(ta); ta.select()
          try { document.execCommand('copy') } catch (_) {}
          document.body.removeChild(ta)
        }
        const prev = btn.textContent
        btn.textContent = '✓'
        setTimeout(() => { btn.textContent = prev }, 1500)
      })
    },
  })
}

/**
 * ChangePassword Component
 * 
 * Page for changing user password.
 */
function ChangePassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [transactionPassword, setTransactionPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { role } = useSelector((state) => state.auth)

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!newPassword || !confirmPassword || !transactionPassword) {
      Toast.fire({
        icon: 'error',
        title: 'Please fill in all fields'
      });
      return
    }

    if (newPassword !== confirmPassword) {
      Toast.fire({
        icon: 'error',
        title: 'New Password and Confirm Password do not match'
      });
      return
    }

    setLoading(true)
    try {
      const payload = {
        newPassword: newPassword,
        transactionPassword: transactionPassword
      }

      const response = role === 'owner'
        ? await userService.updateOwnerPassword(payload)
        : await userService.updateLoggedInStaffPassword(payload)

      if (response.success) {
        // Reset form
        setNewPassword('')
        setConfirmPassword('')
        setTransactionPassword('')
        // Show the freshly rotated transaction password (or a plain success).
        if (response.transactionPassword) {
          showTransactionPassword(response.transactionPassword)
        } else {
          Toast.fire({ icon: 'success', title: 'Password changed successfully' });
        }
      } else {
        Toast.fire({
          icon: 'error',
          title: 'Failed to change password: ' + (response.message || response.error || 'Unknown error')
        });
      }
    } catch (error) {
      console.error('Error changing password:', error)
      Toast.fire({
        icon: 'error',
        title: 'Failed to change password: ' + (error.response?.data?.message || error.response?.data?.error || error.message)
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Change Password - Diamond Admin">
      <div className="listing-grid">
        <div className="account-list-statement">
          {/* Page Title */}
          <div className="row">
            <div className="col-12">
              <div className="page-title-box d-flex align-items-center justify-content-between">
                <h4 className="mb-0 font-size-18">
                  Change Password
                </h4>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <div className="row">
            <div className="col-12">
              <div className="">
                <div className="">
                  <form method="post" className="ajaxFormSubmit" onSubmit={handleSubmit}>
                    <div className="row row5">
                      <div className="col-md-6">
                        <label>New Password:</label>
                        <input
                          type="password"
                          className="form-control"
                          //   placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          style={{ width: '100%', maxWidth: '400px' }}
                        />
                      </div>
                    </div>
                    <div className="row row5 mt-3">
                      <div className="col-md-6">
                        <label>Confirm Password:</label>
                        <input
                          type="password"
                          className="form-control"
                          //   placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          style={{ width: '100%', maxWidth: '400px' }}
                        />
                      </div>
                    </div>
                    <div className="row row5 mt-3">
                      <div className="col-md-6">
                        <label>Transaction Password:</label>
                        <input
                          type="password"
                          className="form-control"
                          //   placeholder="Enter transaction password"
                          value={transactionPassword}
                          onChange={(e) => setTransactionPassword(e.target.value)}
                          required
                          style={{ width: '100%', maxWidth: '400px' }}
                        />
                      </div>
                    </div>
                    <div className="row row5 mt-3">
                      <div className="col-md-6">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : 'Load'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ChangePassword

