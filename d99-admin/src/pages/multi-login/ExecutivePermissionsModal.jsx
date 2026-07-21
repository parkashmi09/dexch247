import { useState } from 'react'
import Toast from '../../utils/toast'
import { updateMultiLogin } from '../../apiservices/multiLoginApi'
import { ADMIN_TIER_PERMISSIONS, isOwnerOrSuperAdmin } from '../../utils/permissions'

/**
 * Edit-privileges modal for an existing executive (multi-login) account.
 * Loads the executive's current permission map into checkbox state, lets the
 * caller flip flags, and saves via PUT /executive/:id { permissions }.
 *
 * `fields` is the same [key,label] list the create form uses, so the two stay
 * in sync.
 */
function ExecutivePermissionsModal({ executive, fields, onClose, onSaved }) {
  const [perms, setPerms] = useState(() => {
    const base = {}
    fields.forEach(([key]) => {
      base[key] = !!(executive.permissions || {})[key]
    })
    return base
  })
  const [saving, setSaving] = useState(false)

  const toggle = (key) => setPerms((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSave = async () => {
    const payload = { ...perms }
    // Defence in depth: drop admin-tier keys the caller may not grant
    // (backend freezes them anyway). ADMIN_TIER is empty for jmd-exch.
    if (!isOwnerOrSuperAdmin()) {
      ADMIN_TIER_PERMISSIONS.forEach((k) => delete payload[k])
    }

    setSaving(true)
    try {
      const res = await updateMultiLogin(executive.id, { permissions: payload })
      if (res?.success) {
        Toast.fire({ icon: 'success', title: 'Privileges updated' })
        onSaved && onSaved(res.executive)
        onClose && onClose()
      } else {
        Toast.fire({ icon: 'error', title: res?.message || 'Update failed' })
      }
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: err?.response?.data?.message || 'Update failed'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Edit Privileges — {executive.username}</h5>
          <button type="button" className="btn btn-sm btn-light" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px'
          }}
        >
          {fields.map(([key, label]) => (
            <label
              key={key}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}
            >
              <input type="checkbox" checked={!!perms[key]} onChange={() => toggle(key)} />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div className="mt-3 d-flex justify-content-end" style={{ gap: '8px' }}>
          <button type="button" className="btn btn-light" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn btn-success" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExecutivePermissionsModal
