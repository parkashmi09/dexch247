import api from "./axiosClient.js";

export const getAccountStatement = async (filters) => {
  try {
    const response = await api.post(
      "/admin/reports/accountstatement",
      filters
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching account statement:", error);
    throw error;
  }
};
