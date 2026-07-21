// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.dexch247.com/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/admin/staff/login',
    OWNER_LOGIN: '/admin/login-owner',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',

    STAFF_UPDATE_PASSWORD: '/admin/staff-update-password',
    OWNER_UPDATE_PASSWORD: '/admin/owner/update-password',
    UPDATE_PLATFORM_CONFIG: '/admin/update-platform-configurations',
    
    // 2FA Endpoints
    VERIFY_2FA_STAFF: '/admin/staff/verify-2fa',
    VERIFY_2FA_OWNER: '/admin/owner/verify-2fa',
    GENERATE_2FA_LINK: '/2fa/telegram/generate-link-code',
    VERIFY_PASSWORD: '/2fa/telegram/verify-password',
    SEND_DISABLE_2FA_CODE: '/2fa/telegram/send-disable-code',
    DISABLE_2FA: '/2fa/telegram/disable-2fa',
  },
  USER: {
    PROFILE: '/admin/staff/profile',
    OWNER_PROFILE: '/admin/profile',
    ALL_DETAILS: '/admin/users/all-details',
  },
  D99: {
    NET_EXPOSURE: '/d99/net-exposure',
  },
  REPORTS: {
    CURRENT_BETS: '/admin/reports/current-bets',
    MARKET_ANALYSIS: '/admin/reports/market-analysis',
    TOTAL_PROFIT_LOSS: '/admin/reports/total-profit-loss',
    USER_BET_HISTORY: '/admin/reports/user-bet-history',
  },
  TABLE_CASINO: {
    LIST: '/admin/table-casino/list',
    LOCKS: '/admin/table-casino/locks',
    LOCK: '/admin/table-casino/lock',
  },
  BETLOCK: {
    MARKET_LOCK_CHILDREN: '/admin/betlock/market-locks', // GET /:event_id?market_id=xxx&market_name=xxx
    TOGGLE_MARKET_LOCK: '/admin/betlock/toggle-market-lock',
    BULK_TOGGLE_MARKET_LOCK: '/admin/betlock/bulk-toggle-market-lock',
  },
  SPORTS_DATA: '/user/cricket/all-data',
  GET_SPORTS_TREE: '/user/all/sports/tree',
  GET_SPORT_DATA: '/user/cricket/all-data',
  GET_MATCH_PRIVATE_DATA: '/user/cricket/get-match-private-data',
  GET_SPORTS_SCORE_CARD: '/user/cricket/score-card',
  INTERNALSETTLE: {
    MOMATCHES: '/internalsettle/momatches',
    FANMATCHES: '/internalsettle/fanmatches',
    DECLARERESULT: '/internalsettle/declareresult',
    VOID: '/internalsettle/void',
  },
}
