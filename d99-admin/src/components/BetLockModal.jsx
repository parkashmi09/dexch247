import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import '../styles/deposit-modal.css'
import './BetLockModal.css'
import api from '../services/api'

function BetLockModal({ show, onHide, sportId, eventId, marketId, marketName }) {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (show && eventId && (marketId || marketName)) {
      fetchChildren()
      setSaveMessage('')
    }
  }, [show, eventId, marketId, marketName])

  const fetchChildren = async () => {
    setLoading(true)
    try {
      const params = {}
      if (marketId) params.market_id = marketId
      if (marketName) params.market_name = marketName

      console.log('Fetching market lock children:', { eventId, marketId, marketName, params })
      const response = await api.get(
        `/admin/betlock/market-locks/${eventId}`,
        { params }
      )
      console.log('Market lock children response:', response.data)
      if (response.data?.success) {
        const data = response.data.data || []
        setChildren(data)
        setSelectAll(data.length > 0 && data.every(c => c.is_locked))
      } else {
        setChildren([])
      }
    } catch (err) {
      console.error('Error fetching children:', err)
      setChildren([])
    } finally {
      setLoading(false)
    }
  }

  // Local toggle only — no API call
  const handleToggle = (child) => {
    setChildren(prev => prev.map(c =>
      c.id === child.id && c.type === child.type
        ? { ...c, is_locked: !c.is_locked }
        : c
    ))
    setSaveMessage('')
  }

  const handleSelectAll = () => {
    const newState = !selectAll
    setSelectAll(newState)
    setChildren(prev => prev.map(c => ({ ...c, is_locked: newState })))
    setSaveMessage('')
  }

  // Sync selectAll checkbox when individual toggles change
  useEffect(() => {
    if (children.length > 0) {
      setSelectAll(children.every(c => c.is_locked))
    }
  }, [children])

  // Save all lock states to server
  const handleSave = async () => {
    setSaving(true)
    setSaveMessage('')
    try {
      const accounts = children.map(c => ({
        account_id: c.id,
        account_type: c.type
      }))

      const lockedAccounts = children.filter(c => c.is_locked).map(c => ({
        account_id: c.id,
        account_type: c.type
      }))

      const unlockedAccounts = children.filter(c => !c.is_locked).map(c => ({
        account_id: c.id,
        account_type: c.type
      }))

      console.log('Saving market locks:', { eventId, marketId, marketName, lockedAccounts, unlockedAccounts })

      // Lock the selected ones
      if (lockedAccounts.length > 0) {
        const lockPayload = {
          accounts: lockedAccounts,
          event_id: eventId,
          is_locked: true
        }
        if (marketId) lockPayload.market_id = marketId
        if (marketName) lockPayload.market_name = marketName

        const lockRes = await api.post('/admin/betlock/bulk-toggle-market-lock', lockPayload)
        console.log('Lock response:', lockRes.data)
      }

      // Unlock the unselected ones
      if (unlockedAccounts.length > 0) {
        const unlockPayload = {
          accounts: unlockedAccounts,
          event_id: eventId,
          is_locked: false
        }
        if (marketId) unlockPayload.market_id = marketId
        if (marketName) unlockPayload.market_name = marketName

        const unlockRes = await api.post('/admin/betlock/bulk-toggle-market-lock', unlockPayload)
        console.log('Unlock response:', unlockRes.data)
      }

      setSaveMessage('Saved successfully!')
    } catch (err) {
      console.error('Error saving locks:', err)
      setSaveMessage('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setChildren([])
    setSelectAll(false)
    setSaveMessage('')
    onHide()
  }

  const displayTitle = marketName || (marketId ? `Market ${marketId}` : 'Market')

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-md modal-dialog-scrollable"
    >
      <Modal.Header>
        <Modal.Title>Bet Lock - {displayTitle}</Modal.Title>
        <button
          type="button"
          className="close text-white"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="betlock-table-responsive table-responsive py-3">
          <table className="betlock-table table betlock-table-bordered table-bordered">
            <thead>
              <tr>
                <th className="betlock-th">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="selectAllAccounts"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={loading || children.length === 0}
                    />
                    <label className="custom-control-label" htmlFor="selectAllAccounts"></label>
                  </div>
                </th>
                <th className="betlock-th">Account</th>
                <th className="betlock-th">Role</th>
                <th className="betlock-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center betlock-td">Loading...</td>
                </tr>
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center betlock-td">No accounts found</td>
                </tr>
              ) : (
                children.map((child) => {
                  const key = `${child.type}_${child.id}`
                  return (
                    <tr key={key}>
                      <td className="betlock-td">
                        <div className="custom-control custom-checkbox">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            id={`account-${key}`}
                            checked={child.is_locked}
                            onChange={() => handleToggle(child)}
                          />
                          <label className="custom-control-label" htmlFor={`account-${key}`}></label>
                        </div>
                      </td>
                      <td className="betlock-td">{child.username}</td>
                      <td className="betlock-td">
                        <span className={`badge ${child.type === 'staff' ? 'badge-info' : 'badge-success'}`}>
                          {child.role || child.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="betlock-td">
                        <span className={`badge ${child.is_locked ? 'badge-danger' : 'badge-success'}`}>
                          {child.is_locked ? 'Locked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {saveMessage && (
          <div className={`alert ${saveMessage.includes('success') ? 'alert-success' : 'alert-danger'} py-1 px-2 mb-2`}>
            {saveMessage}
          </div>
        )}

        <div className="form-group row mt-3">
          <div className="col-12 text-right">
            <button
              type="button"
              className="btn btn-back mr-2"
              onClick={handleClose}
            >
              <i className="fas fa-undo mr-1"></i>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || loading || children.length === 0}
            >
              {saving ? 'Saving...' : 'Save'}
              {!saving && <i className="fas fa-save ml-1"></i>}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default BetLockModal
