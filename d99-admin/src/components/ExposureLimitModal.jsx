import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import '../styles/deposit-modal.css'

/**
 * ExposureLimitModal Component
 * 
 * Modal component for updating exposure limit.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Function to close the modal
 * @param {Object} props.userData - User data for the exposure limit (optional)
 * @param {Function} props.onSubmit - Callback function when form is submitted
 */
function ExposureLimitModal({ show, onHide, userData = null, onSubmit }) {
  const [formData, setFormData] = useState({
    oldLimit: '0.00',
    newLimit: '',
    transactionPassword: ''
  })
  const [wasValidated, setWasValidated] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Populate readonly fields from userData if provided
  useEffect(() => {
    if (show && userData) {
      setFormData(prev => ({
        ...prev,
        oldLimit: userData.exposureLimit || '0.00',
        newLimit: '',
        transactionPassword: ''
      }))
    }
  }, [show, userData])

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
      oldLimit: userData?.exposureLimit || '0.00',
      newLimit: '',
      transactionPassword: ''
    })
    onHide()
  }

  const handleClose = () => {
    // Reset form on close
    setFormData({
      oldLimit: userData?.exposureLimit || '0.00',
      newLimit: '',
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
        <Modal.Title>Exposure Limit</Modal.Title>
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
          data-vv-scope="exposureLimitMDL"
          method="post"
          className={wasValidated ? 'was-validated' : ''}
          noValidate
        >
          <div className="form-group row">
            <label className="col-form-label col-4">Old Limit</label>
            <div className="col-8">
              <input
                type="text"
                readOnly
                name="oldLimit"
                className="form-control txt-right"
                value={formData.oldLimit}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-form-label col-4">New Limit</label>
            <div className="col-8 form-group-feedback form-group-feedback-right">
              <input
                type="number"
                name="newLimit"
                className="form-control txt-right"
                value={formData.newLimit}
                onChange={handleChange}
                step="any"
                min="0"
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

export default ExposureLimitModal

