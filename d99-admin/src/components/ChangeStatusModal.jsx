import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import '../styles/deposit-modal.css'
import '../styles/change-status-modal.css'

/**
 * ChangeStatusModal Component
 * 
 * Modal component for changing user status (User Active and Bet Active).
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Function to close the modal
 * @param {Object} props.userData - User data (optional)
 * @param {Function} props.onSubmit - Callback function when form is submitted
 */
function ChangeStatusModal({ show, onHide, userData = null, onSubmit }) {
  const [formData, setFormData] = useState({
    userActive: false,
    betActive: false,
    transactionPassword: ''
  })
  const [wasValidated, setWasValidated] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Populate form from userData if provided
  useEffect(() => {
    if (show && userData) {
      // Map status field: "Active" -> true, "InActive" -> false
      const userActive = userData.status === 'Active' ||
        (userData.userActive !== undefined ? userData.userActive :
          (userData.active !== undefined ? userData.active : false))

      setFormData(prev => ({
        ...prev,
        userActive: userActive,
        betActive: userData.bet_locked !== undefined ? !userData.bet_locked : (userData.betActive !== undefined ? userData.betActive : true),
        transactionPassword: ''
      }))
    }
  }, [show, userData])

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

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

    // First check basic form validity
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

    // Proceed with submission
    if (onSubmit) {
      onSubmit(formData)
    }
    // Reset form
    const userActive = userData?.status === 'Active' ||
      (userData?.userActive !== undefined ? userData.userActive : false)
    setFormData({
      userActive: userActive,
      betActive: userData?.bet_locked !== undefined ? !userData.bet_locked : (userData?.betActive !== undefined ? userData.betActive : true),
      transactionPassword: ''
    })
    onHide()
  }

  const handleClose = () => {
    // Reset form on close
    const userActive = userData?.status === 'Active' ||
      (userData?.userActive !== undefined ? userData.userActive : false)
    setFormData({
      userActive: userActive,
      betActive: userData?.bet_locked !== undefined ? !userData.bet_locked : (userData?.betActive !== undefined ? userData.betActive : true),
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
        <Modal.Title>Change Status</Modal.Title>
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
          data-vv-scope="changeStatusMDL"
          method="post"
          className={wasValidated ? 'was-validated' : ''}
          noValidate
        >
          {/* Username Display */}
          <div className="form-group row">
            <div className="col-6 text-left">
              <p id="status-username" className="text-warning">
                {userData?.username || userData?.userName || 'MasterPollo1'}
              </p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="form-group row">
            <div className="col-6 text-center">
              <label className="col-form-label d-block">User Active</label>
              <label
                className={`vue-js-switch ${formData.userActive ? 'toggled' : ''}`}
                onClick={() => handleToggle('userActive')}
              >
                <input
                  type="checkbox"
                  className="v-switch-input"
                  checked={formData.userActive}
                  onChange={() => handleToggle('userActive')}
                />
                <div className="v-switch-core">
                  <div className="v-switch-button"></div>
                </div>
                <span className={`v-switch-label ${formData.userActive ? 'v-left' : 'v-right'}`}>
                  {formData.userActive ? 'on' : 'off'}
                </span>
              </label>
            </div>
            <div className="col-6 text-center">
              <label className="col-form-label d-block">Bet Active</label>
              <label
                className={`vue-js-switch ${formData.betActive ? 'toggled' : ''}`}
                onClick={() => handleToggle('betActive')}
              >
                <input
                  type="checkbox"
                  className="v-switch-input"
                  checked={formData.betActive}
                  onChange={() => handleToggle('betActive')}
                />
                <div className="v-switch-core">
                  <div className="v-switch-button"></div>
                </div>
                <span className={`v-switch-label ${formData.betActive ? 'v-left' : 'v-right'}`}>
                  {formData.betActive ? 'on' : 'off'}
                </span>
              </label>
            </div>
          </div>

          {/* Transaction Password */}
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

          {/* Action Buttons */}
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

export default ChangeStatusModal

