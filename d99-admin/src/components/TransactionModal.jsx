import { useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'
import '../styles/deposit-modal.css'
import Toast from '../utils/toast'
import { useAuth } from '@/hooks/useAuth'

/**
 * TransactionModal Component
 * 
 * Reusable modal component for transaction operations (Deposit, Withdraw, etc.).
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Function to close the modal
 * @param {Object} props.userData - User data for the transaction (optional)
 * @param {Function} props.onSubmit - Callback function when form is submitted
 * @param {string} props.title - Modal title (default: "Transaction")
 */
function TransactionModal({ show, onHide, userData = null, currentUser = null, mode = 'deposit', onSubmit, title = "Transaction" }) {
  const [formData, setFormData] = useState({
    amount: '',
    remark: '',
    transactionPassword: ''
  })
  const [wasValidated, setWasValidated] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const { user } = useAuth()

  console.log(user, "sjj")

  // Populate readonly fields from userData if provided

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
      Toast.fire({
        icon: 'error',
        title: 'Please fill in all required fields'
      });
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
      console.log(formData, "formData")
      onSubmit(formData)
    }
    // Reset form
    setFormData({
      amount: '',
      remark: '',
      transactionPassword: ''
    })
    onHide()
  }

  const handleClose = () => {
    // Reset form on close
    setFormData({
      amount: '',
      remark: '',
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
        <Modal.Title>{title}</Modal.Title>
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
          data-vv-scope="usertransactionMDL"
          method="post"
          className={wasValidated ? 'was-validated' : ''}
          noValidate
        >
          <div className="form-group row">
            <label className="col-form-label col-4">{user?.username || 'Sender'}</label>
            <div className="col-8">
              <div className="row">
                <div className="col-6">
                  <input
                    type="text"
                    readOnly
                    className="form-control txt-right"
                    value={currentUser?.wallet?.inr_balance || currentUser?.inr_balance || '0'}
                    placeholder="Balance"
                  />
                </div>
                <div className="col-6">
                  <input
                    type="text"
                    readOnly
                    className="form-control txt-right"
                    value={formData.amount ? (mode === 'withdraw' ? `+${formData.amount}` : `-${formData.amount}`) : '0'}
                    placeholder={mode === 'withdraw' ? "Credit" : "Debit"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label className="col-form-label col-4">{userData?.username || 'Receiver'}</label>
            <div className="col-8">
              <div className="row">
                <div className="col-6">
                  <input
                    type="text"
                    readOnly
                    className="form-control txt-right"
                    value={userData?.inr_balance || '0'}
                    placeholder="Balance"
                  />
                </div>
                <div className="col-6">
                  <input
                    type="text"
                    readOnly
                    className="form-control txt-right"
                    value={formData.amount ? (mode === 'withdraw' ? `-${formData.amount}` : `+${formData.amount}`) : '0'}
                    placeholder={mode === 'withdraw' ? "Debit" : "Credit"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-group row">
            <label className="col-form-label col-4">Amount</label>
            <div className="col-8 form-group-feedback form-group-feedback-right">
              <input
                type="number"
                name="amount"
                className="form-control txt-right"
                value={formData.amount}
                onChange={handleChange}
                step="any"
                min="0"
                aria-required="true"
                required
              />
            </div>
          </div>

          <div className="form-group row">
            <label className="col-form-label col-4">Remark</label>
            <div className="col-8 form-group-feedback form-group-feedback-right">
              <textarea
                name="remark"
                className="form-control"
                value={formData.remark}
                onChange={handleChange}
                aria-required="true"
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

export default TransactionModal

