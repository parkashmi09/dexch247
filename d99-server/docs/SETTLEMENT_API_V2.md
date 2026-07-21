# AVRKHUB Settlement API V2 Integration

## Overview
This document outlines the architecture, changes, and migration strategies implemented to switch the sports bet result settlement logic from the old Diamond API framework to the newly integrated AVRKHUB API (`diamond-result.avrkhub.in`).

The implementation follows a **"versioned" approach (v1 vs. v2)**. Both the old and new logic live side-by-side. The active logic that the workers run depends on the `.env` variable configuration.

---

## 1. Components Updated

### A. Environment Configuration (`.env` & `backend.config.cjs`)
A global switch was introduced using the environment variable `SETTLEMENT_VERSION`.
- `SETTLEMENT_VERSION=v1` uses the original Diamond POST API.
- `SETTLEMENT_VERSION=v2` uses the new AVRKHUB GET API.

**PM2 Settings (`backend.config.cjs`)**:
The worker ecosystem file dynamically assigns the correct script path:
- If `v2`: loads `settlementv2.js` for the settlement daemon, and `newjobv2.js` for the results cron daemon.
- If `v1`: loads `settlementnew.js` and `newjob.js`.

### B. Results Cron (`sportsbet/betresult/newjobv2.js`)
This cron matches unresolved/open bets by hitting the upstream API to check for results.
- Converts AVRKHUB GET API parameters (`?gmid={eventid}&sid={sport_id}`).
- Maps market names appropriately for different game-types:
    - **MO (Match Odds) / BM (Bookmaker):** Matches the `ename` (Event Name) field from the AVRKHUB payload against local DB queries.
    - **FAN (Fancy):** Matches the `marketName` field for specific fancy queries.
- Correctly identifies `SETTLE` and `VOID` statuses, adding them to the Postgres job queue as `declared`.

### C. Settlement Queue Worker (`sportsbet/betresult/settlementv2.js`)
This worker processes the jobs pushed by the Results Cron daemon.
- Adopts the exact same market mappings (`ename`, `marketName`) as the results cron to bypass mismatch errors.
- Handled `VOID` status natively: when AVRKHUB returns `VOID`, the worker triggers a wallet refund mechanism to safely reverse user stakes.

### D. Result Route Proxy (`routes/user/getResultRouteV2.js`)
- An internal proxy API was added to pass frontend requests to AVRKHUB safely without exposing API keys or infrastructure URLs to client-side browsers.

---

## 2. Issues Debugged & Resolved During Migration

**1. Re-queued Stuck "Pending" Bets**
- **Symptom:** Bets were technically pushed through the job queue and marked `done` internally, but user wallets/ledgers were not updated and the bet remained `pending`.
- **Cause:** Disconnect between the user-id linked in `sports_event_settlement_jobs` vs `SportsBet`. If the worker couldn't find the exact match grouping in `.fetchResultForEvent`, it silently marked the job `done` without applying calculations.
- **Fix:** We flushed and requeued `status='queued'` natively in Postgres for the hanging `done` bets, triggering `newjobv2` to correctly catch and distribute calculations.

**2. Psql Deadlocks**
- **Cause:** When trying to interact with the database manually to check bet statuses, the queries hung unresponsively.
- **Fix:** Confirmed this was normal system behavior. The heavy settlement workers securely lock `CreditsLedger` and `Wallet` tables during processing. Manual testing of deadlocks was terminated through `pg_stat_activity` flushing.

---

## 3. How To Toggle / Rollback Versions
The codebase operates seamlessly between both states. You don't need code modifications to back out.

**To enable the OLD Diamond Worker (v1):**
```bash
# Add this to your d99-server/.env file
SETTLEMENT_VERSION=v1

# Then restart PM2 to apply configurations to daemons
pm2 restart diamond99-sports-results-cron
pm2 restart diamond99-sports-settlement-worker
```

**To enable the NEW AVRKHUB Worker (v2):**
```bash
# Add this to your d99-server/.env file
SETTLEMENT_VERSION=v2
AVRKHUB_BASE_URL="https://diamond-result-v2.avrkhub.in"

# Then restart PM2
pm2 restart diamond99-sports-results-cron
pm2 restart diamond99-sports-settlement-worker
```
