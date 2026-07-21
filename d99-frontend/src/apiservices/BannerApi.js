import api from "./axiosClient.js";

/**
 * Dynamic welcome banner. Proxied through our backend because the upstream
 * feed (diamondapi.avrkhub.in) sends no CORS headers and can't be read by the
 * browser directly. Returns { bdesc, img_desktop, img_mobile } or null.
 */
export const getWelcomeBanner = async () => {
  try {
    const r = await api.get("/user/banners/welcome");
    return r.data?.data ?? null;
  } catch {
    return null;
  }
};
