import api from "./axiosClient.js";

export const telegram2faService = {
  verifyPassword: (password) =>
    api.post("/2fa/telegram/verify-password", { password }).then((r) => r.data),

  getLinkCode: () =>
    api.post("/2fa/telegram/generate-link-code").then((r) => r.data.code),

  verify2FA: (userId, otp) =>
    api.post("/user/verify-2fa", { userId, otp }).then((r) => r.data),

  resendOTP: (userId) =>
    api.post("/user/resend-2fa-otp", { userId }).then((r) => r.data),

  sendDisableCode: () =>
    api.post("/2fa/telegram/send-disable-code").then((r) => r.data),

  disable2FA: (otp) =>
    api.post("/2fa/telegram/disable-2fa", { otp }).then((r) => r.data),
};
