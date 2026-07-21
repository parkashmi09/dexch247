// Platform bet buffer (seconds) from admin config, cached for 60s.
// GET /user/buffer-time → { success: true, buffer_time: <seconds> }
// Any failure (or 0) resolves to 0, and the caller falls back to its own
// default — the buffer must never be the reason a bet cannot be placed.

import { getPlatformBufferTime } from "../apiservices/SportsApi.js";

const TTL_MS = 60 * 1000;
let cachedValue = null;
let cachedAt = 0;
let inflight = null;

export async function getPlatformBufferSeconds() {
  const now = Date.now();
  if (cachedValue != null && now - cachedAt < TTL_MS) return cachedValue;
  if (inflight) return inflight;

  inflight = getPlatformBufferTime()
    .then((res) => {
      const n = Number(res?.buffer_time ?? res?.data?.buffer_time ?? 0);
      cachedValue = Number.isFinite(n) && n > 0 ? n : 0;
      cachedAt = Date.now();
      return cachedValue;
    })
    .catch(() => 0)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
