// Stable per-browser device identifier used for single-session enforcement.
// The backend stores this as the account's active `login_id`. Logging in again
// from the SAME browser reuses this id (so the current browser is NOT logged
// out), while a login from a DIFFERENT browser/device replaces it and
// invalidates the previous device's token.

const DEVICE_ID_KEY = 'deviceId'

export const getDeviceId = () => {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch (e) {
    // localStorage unavailable (e.g. private mode) — fall back to a volatile id.
    return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}
