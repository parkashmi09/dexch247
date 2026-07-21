/**
 * permissions.js — the client-side permission gate for executive (multi-login)
 * accounts.
 *
 * Contract (mirror of the backend permissionMiddleware):
 *   - Owners / staff are NOT executives → can() always returns true (they see
 *     and reach everything). Only executives are gated.
 *   - An executive's permission map is stored in localStorage at login under
 *     `executivePermissions` and travels in the JWT; the backend re-reads it on
 *     every request, so the real enforcement is server-side. This module is the
 *     cosmetic layer: hide menu items + bounce route navigation.
 *
 * The permission KEY STRINGS here must stay byte-identical with the keys the
 * create-account form sends and the keys used in requirePermission(...) on the
 * server. This is the single frontend source of truth.
 */

// All grantable privilege keys (the create-account checkboxes, minus the
// "all" select-all helper). Keep in sync with the backend.
export const PERMISSIONS = [
  'dashboard',
  'marketAnalysis',
  'userList',
  'insertUser',
  'accountStatement',
  'partyWinLoss',
  'currentBets',
  'generalLock',
  'casinoResult',
  'liveCasinoResult',
  'ourCasino',
  'events',
  'marketSearchAnalysis',
  'loginUserCreation',
  'withdraw',
  'deposit',
  'creditReference',
  'userInfo',
  'userPasswordChange',
  'userLock',
  'betLock',
  'activeUser',
  'agentAssign'
]

// Human labels for the no-access page / management table.
export const PERMISSION_LABELS = {
  dashboard: 'DashBoard',
  marketAnalysis: 'Market Analysis',
  userList: 'User List',
  insertUser: 'Insert User',
  accountStatement: 'Account Statement',
  partyWinLoss: 'Party Win Loss',
  currentBets: 'Current Bets',
  generalLock: 'General Lock',
  casinoResult: 'Casino Result',
  liveCasinoResult: 'Live Casino Result',
  ourCasino: 'Our Casino',
  events: 'Events',
  marketSearchAnalysis: 'Market Search Analysis',
  loginUserCreation: 'Login User Creation',
  withdraw: 'Withdraw',
  deposit: 'Deposit',
  creditReference: 'Credit Reference',
  userInfo: 'User Info',
  userPasswordChange: 'User Password Change',
  userLock: 'User Lock',
  betLock: 'Bet Lock',
  activeUser: 'Active User',
  agentAssign: 'Agent Assign'
}

// Owner-only keys. Intentionally empty for jmd-exch (every privileged account
// may grant every key, matching the existing UI). Add keys here AND keep them
// identical with ADMIN_TIER in executiveController.js to make them owner-only.
export const ADMIN_TIER_PERMISSIONS = []

/** activeRole === 'executive' (set by authSlice at login). */
export const isExecutive = () =>
  (localStorage.getItem('activeRole') || '') === 'executive'

/** The executive's stored boolean permission map ({} for non-executives). */
export const getStoredPermissions = () => {
  try {
    return JSON.parse(localStorage.getItem('executivePermissions') || '{}') || {}
  } catch {
    return {}
  }
}

/**
 * THE gate. key may be a string, an array (any-of), or null (unguarded).
 *   - unguarded / non-executive → true
 *   - executive → truthy flag (array → some)
 */
export const can = (key) => {
  if (!key) return true
  if (!isExecutive()) return true
  const perms = getStoredPermissions()
  if (Array.isArray(key)) return key.some((k) => !!perms[k])
  return !!perms[key]
}

/** Gates the admin-tier checkboxes in the create-account UI. */
export const isOwnerOrSuperAdmin = () => {
  const activeRole = localStorage.getItem('activeRole') || ''
  if (activeRole === 'owner') return true
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const role = (user?.role || '').toUpperCase()
    return ['OWNER', 'COMPANY', 'SUPERADMIN'].includes(role)
  } catch {
    return false
  }
}

/**
 * Route → required permission key. Prefix-matched (first match wins), so order
 * matters: more specific paths must come before their parents.
 * A path with no entry here is unguarded for executives.
 */
const ROUTE_PERMISSIONS = [
  ['/admin/market-analysis', 'marketAnalysis'],
  ['/admin/users2', 'userList'],
  ['/admin/users/insertuser', 'insertUser'],
  ['/admin/users', 'userList'],
  ['/admin/assign-agent', 'agentAssign'],
  ['/admin/reports/accountstatement', 'accountStatement'],
  ['/admin/reports/currentbets', 'currentBets'],
  ['/admin/reports/generalreport', 'partyWinLoss'],
  ['/admin/reports/gamereport', 'events'],
  ['/admin/reports/livecasinoreport', 'liveCasinoResult'],
  ['/admin/reports/profitloss', 'partyWinLoss'],
  ['/admin/reports/casinoresult', 'casinoResult'],
  ['/admin/reports/totalprofitloss', 'partyWinLoss'],
  ['/admin/reports/userwinloss', 'partyWinLoss'],
  ['/admin/reports/userbethistory', 'currentBets'],
  ['/admin/settings/userlock', 'userLock'],
  ['/admin/settings/global-settings', 'generalLock'],
  ['/admin/createaccount', 'loginUserCreation'],
  ['/dashboard', 'dashboard'],
  ['/admin/casino', 'ourCasino'],
  ['/admin/vcasino', 'ourCasino']
]

/** Required permission key for a path, or null if unguarded. */
export const permissionForPath = (pathname) => {
  const hit = ROUTE_PERMISSIONS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
  return hit ? hit[1] : null
}

/**
 * Where to send an executive after login — the first feature they hold, in
 * priority order. Falls back to /no-access when they hold nothing routable.
 */
const LANDING_ORDER = [
  ['marketAnalysis', '/admin/market-analysis'],
  ['userList', '/admin/users'],
  ['dashboard', '/dashboard'],
  ['accountStatement', '/admin/reports/accountstatement'],
  ['currentBets', '/admin/reports/currentbets'],
  ['casinoResult', '/admin/reports/casinoresult'],
  ['liveCasinoResult', '/admin/reports/livecasinoreport'],
  ['partyWinLoss', '/admin/reports/totalprofitloss'],
  ['events', '/admin/reports/gamereport'],
  ['insertUser', '/admin/users/insertuser'],
  ['agentAssign', '/admin/assign-agent'],
  ['loginUserCreation', '/admin/createaccount'],
  ['userLock', '/admin/settings/userlock'],
  ['generalLock', '/admin/settings/global-settings'],
  ['ourCasino', '/admin/casino/premium']
]

export const firstAllowedRoute = () => {
  if (!isExecutive()) return '/admin/market-analysis'
  const perms = getStoredPermissions()
  const hit = LANDING_ORDER.find(([key]) => !!perms[key])
  return hit ? hit[1] : '/no-access'
}
