import api from "./axiosClient.js";

export const getUserProfileWithWallet = async () => {
  const res = await api.get("/admin/user/profile");
  return res.data?.data?.user || res.data;
};
