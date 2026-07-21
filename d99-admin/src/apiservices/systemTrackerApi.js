// System Tracker API — mother-admin (owner) wallet/settlement integrity tool.
// Uses the shared axios instance (auto-attaches the owner Bearer token).
import api from '../services/api'

const base = '/system-tracker'

export const searchTrackedUsers = async (q) => {
  const res = await api.get(`${base}/search`, { params: { q } })
  return res.data // { success, results: [{user_id, username, role}] }
}

export const getUserReport = async (idOrUsername) => {
  const res = await api.get(`${base}/${encodeURIComponent(idOrUsername)}`)
  return res.data // { success, snapshot, checks[], sportsRuleBreakdown[], history[], allPass }
}

export const getIntegrityAlerts = async () => {
  const res = await api.get(`${base}/alerts`)
  return res.data // { success, count, totalIssues, users[], lastScan }
}

export const runIntegrityScan = async () => {
  const res = await api.post(`${base}/scan`)
  return res.data // { success, summary, count, users[], ... }
}

export default { searchTrackedUsers, getUserReport, getIntegrityAlerts, runIntegrityScan }
