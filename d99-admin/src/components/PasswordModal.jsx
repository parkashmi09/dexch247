import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Toast from '../utils/toast'
import '../styles/deposit-modal.css'

/**
 * PasswordModal Component
 * 
 * Modal component for changing password.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Function to close the modal
 * @param {Object} props.userData - User data (optional)
 * @param {Function} props.onSubmit - Callback function when form is submitted
 */
function PasswordModal({ show, onHide, userData = null, onSubmit }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
    transactionPassword: ''
  })
  const [wasValidated, setWasValidated] = useState(false)
  const [passwordError, setPasswordError] = useState('')

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

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.currentTarget

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      e.stopPropagation()
      setWasValidated(true)
      Toast.fire({
        icon: 'error',
        title: 'New Password and Confirm Password do not match'
      });
      return
    }

    if (form.checkValidity() === false) {
      e.stopPropagation()
      setWasValidated(true)
      return
    }

    // Validate transaction password - must be "12345"
    // const correctPassword = '12345'
    // if (formData.transactionPassword !== correctPassword) {
    //   setPasswordError('Invalid transaction password. Please enter the correct password.')
    //   setWasValidated(true)
    //   e.stopPropagation()
    //   return
    // }

    // Clear any previous errors
    setPasswordError('')
    setWasValidated(false)

    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset form
    setFormData({
      newPassword: '',
      confirmPassword: '',
      transactionPassword: ''
    })
    onHide()
  }

  const handleClose = () => {
    // Reset form on close
    setFormData({
      newPassword: '',
      confirmPassword: '',
      transactionPassword: ''
    })
    setWasValidated(false)
    setPasswordError('')
    onHide()
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-md modal-dialog-scrollable"
    >
      <Modal.Header>
        <Modal.Title>Password</Modal.Title>
        <button
          type="button"
          className="close text-white"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
      </Modal.Header>
      <Modal.Body>
        <form
          onSubmit={handleSubmit}
          data-vv-scope="passwordMDL"
          method="post"
          className={wasValidated ? 'was-validated' : ''}
          noValidate
        >
          <div className="form-group row">
            <label className="col-form-label col-4">New Password</label>
            <div className="col-8 form-group-feedback form-group-feedback-right">
              <input
                type="password"
                name="newPassword"
                className="form-control"
                value={formData.newPassword}
                onChange={handleChange}
                aria-required="true"
                required
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-form-label col-4">Confirm Password</label>
            <div className="col-8 form-group-feedback form-group-feedback-right">
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-required="true"
                required
              />
            </div>
          </div>

          <div className="form-group row mt-3">
            <label className="col-form-label col-4">Transaction Password</label>
            <div className="col-8 form-group-feedback form-group-feedback-right">
              <input
                name="transactionPassword"
                type="text"
                className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                value={formData.transactionPassword}
                onChange={handleChange}
                aria-required="true"
                required
              />
              {passwordError && (
                <div className="invalid-feedback d-block">
                  {passwordError}
                </div>
              )}
            </div>
          </div>

          <div className="form-group row">
            <div className="col-12 text-right">
              <button
                type="button"
                className="btn btn-back"
                onClick={handleClose}
              >
                <i className="fas fa-undo mr-1"></i>
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                submit
                <i className="fas fa-sign-in-alt ml-1"></i>
              </button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default PasswordModal

