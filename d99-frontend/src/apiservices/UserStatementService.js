import api from "./axiosClient.js";

/**
 * Dedicated service for the logged-in user's account statement.
 */
export const getUserAccountStatement = async (filters) => {
  try {
    const response = await api.post("/user/account-statement", filters);
    return response.data;
  } catch (error) {
    console.error("Error fetching user account statement:", error);
    throw error;
  }
};
