import api from "./axiosClient.js";

// Token is injected automatically by axiosClient's request interceptor, so
// callers no longer need to pass it explicitly. The `token` parameter is kept
// for backward-compatibility but is ignored.

export const getBankDetails = async (_token) => {
  try {
    const response = await api.get("/admin/bank/details");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitDeposit = async (formData, _token) => {
  try {
    const response = await api.post("/user/deposit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const submitWithdraw = async (requestBody, _token) => {
  try {
    const response = await api.post("/user/withdrawal", requestBody);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserBalance = async (_token) => {
  try {
    const response = await api.get("/user/balance");
    return response.data;
  } catch (error) {
    throw error;
  }
};
