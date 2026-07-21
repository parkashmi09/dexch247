import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from '@dr.pogodin/react-helmet'
import logo from '../../assets/main/logo.png'
import './style.css'

import api from '../../services/api'
import { API_ENDPOINTS } from '../../config/api'

function ResetPassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  })

  const validateField = (name, value) => {
    let error = ''
    
    if (name === 'oldPassword') {
      if (!value || value.trim() === '') {
        error = 'The old password field is required'
      }
    } else if (name === 'newPassword') {
      if (!value || value.trim() === '') {
        error = 'The new password field is required'
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters'
      }
    } else if (name === 'confirmPassword') {
      if (!value || value.trim() === '') {
        error = 'The confirm password field is required'
      } else if (value !== formData.newPassword) {
        error = 'Passwords do not match'
      }
    }
    
    return error
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })

    // Real-time validation
    const error = validateField(name, value)
    setErrors({
      ...errors,
      [name]: error
    })
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    setErrors({
      ...errors,
      [name]: error
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate all fields
    const oldPasswordError = validateField('oldPassword', formData.oldPassword)
    const newPasswordError = validateField('newPassword', formData.newPassword)
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword)
    
    setErrors({
      oldPassword: oldPasswordError,
      newPassword: newPasswordError,
      confirmPassword: confirmPasswordError,
      general: ''
    })

    // If no errors, proceed
    if (!oldPasswordError && !newPasswordError && !confirmPasswordError) {
      console.log('Reset password form submitted:', formData)
      
      api.post(API_ENDPOINTS.AUTH.STAFF_UPDATE_PASSWORD, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      })
      .then(response => {
        if (response.data.success) {
           navigate('/password-success', { 
            state: { transactionPassword: response.data.transactionPassword } 
          })
        } else {
          setErrors({
            ...errors,
            general: response.data.message || 'Failed to update password'
          })
        }
      })
      .catch(error => {
        console.error('Error updating password:', error)
        setErrors({
          ...errors,
          general: error.response?.data?.message || 'An error occurred while updating password'
        })
      })
    }
  }

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=1020" />
      </Helmet>
      <section className="login-mn">
        <div className="log-logo m-b-18">
          <img src={logo} alt="DIAMOND EXCH 99" style={{ maxWidth: '250px', maxHeight: '100px' }} />
        </div>
        <div className="log-fld">
          <h2 className="text-center">Change Password</h2>
          <form 
            autoComplete="off" 
            data-vv-scope="form-reset-password" 
            action="" 
            method="POST" 
            className="form-horizontal"
            onSubmit={handleSubmit}
          >
            {errors.general && (
              <div className="form-group">
                <span className="error">{errors.general}</span>
              </div>
            )}
            <div id="input-group-1" role="group" className="form-group">
              <div>
                <input 
                  id="input-1" 
                  name="oldPassword" 
                  type="password" 
                  placeholder="Old Password" 
                  className="form-control"
                  autoComplete="current-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.oldPassword && <span className="error">{errors.oldPassword}</span>}
              </div>
            </div>
            <div id="input-group-2" role="group" className="form-group">
              <div>
                <input 
                  id="input-2" 
                  name="newPassword" 
                  type="password" 
                  placeholder="New Password" 
                  className="form-control form-control"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.newPassword && <span className="error">{errors.newPassword}</span>}
              </div>
            </div>
            <div id="input-group-3" role="group" className="form-group">
              <div>
                <input 
                  id="input-3" 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Confirm Password" 
                  className="form-control form-control"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
            </div>
            <div className="form-group text-center">
              <button 
                type="submit" 
                className="btn btn btn-submit btn-login btn-primary"
              >
                Change Password <i className="fas fa-sign-in-alt"></i>
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default ResetPassword

