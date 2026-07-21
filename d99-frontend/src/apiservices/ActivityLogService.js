import api from "./axiosClient.js";

export const getUserActivityLogs = async (params) => {
  try {
    const response = await api.get("/user/activity-logs", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};
