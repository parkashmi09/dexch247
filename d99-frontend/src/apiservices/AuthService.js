import api from "./axiosClient.js";

// All auth endpoints. Token persistence and Authorization header are
// handled by `axiosClient.js`, so callers should never touch localStorage
// directly except to store the token returned from `loginUser`.

export const registerUser = (data) =>
  api.post("/register-user", data).then((r) => r.data);

export const loginUser = (credentials) =>
  api.post("/user/login", credentials).then((r) => r.data);

export const changePassword = (data) =>
  api.post("/user/change-password", data).then((r) => r.data);

export const logoutUser = () => {
  localStorage.removeItem("token");
};
