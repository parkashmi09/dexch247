import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser,
  getBalance,
  subscribeToBalanceUpdates,
  subscribeToTransactionUpdates,
  disconnectSocket,
  getAllExposures,
} from "../../apiservices/userService.js";
import { getUserProfileWithWallet } from "../../apiservices/userProfileService.js";
import { telegram2faService } from "../../apiservices/telegram2faService.js";

const demoUser = {
  username: "Demo",
  email: "demo@mail.com",
  role: "User",
};

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!(
    JSON.parse(localStorage.getItem("user")) && localStorage.getItem("token")
  ),
  loading: false,
  error: null,
  balance: null,
  exposure: 0,
  balanceLoading: false,
  balanceError: null,
  demoUser,
  transactions: [],
  realTimeConnected: false,
  matchExposures: {},
};

// --- Async thunks --------------------------------------------------------

export const fetchExposuresThunk = createAsyncThunk(
  "user/fetchExposures",
  async (token, { rejectWithValue, getState }) => {
    try {
      const userId =
        getState().user.user?.user_id || getState().user.user?.id;
      if (!userId) throw new Error("User ID not found");
      const data = await getAllExposures(token, userId);
      return data.exposures;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchUserProfileThunk = createAsyncThunk(
  "user/fetchProfile",
  async (_arg, { rejectWithValue }) => {
    try {
      return await getUserProfileWithWallet();
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  "user/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);

      if (data.success === false) {
        return rejectWithValue(data.error || "Login failed");
      }

      if (data.token) {
        // Store token early so subsequent requests (profile, exposures) are authenticated
        localStorage.setItem("token", data.token);

        const profile = await dispatch(fetchUserProfileThunk()).unwrap();
        dispatch(fetchExposuresThunk(data.token));
        return {
          ...profile,
          token: data.token,
          passwordChanged: data.passwordChanged,
        };
      }

      // 2FA or password-change case — return raw data (no token yet)
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const verify2FAThunk = createAsyncThunk(
  "user/verify2FA",
  async ({ userId, otp }, { dispatch, rejectWithValue }) => {
    try {
      const data = await telegram2faService.verify2FA(userId, otp);
      if (data.token) {
        localStorage.setItem("token", data.token);

        const profile = await dispatch(fetchUserProfileThunk()).unwrap();
        dispatch(fetchExposuresThunk(data.token));
        return {
          ...profile,
          token: data.token,
          passwordChanged: data.passwordChanged,
        };
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const fetchBalanceThunk = createAsyncThunk(
  "user/fetchBalance",
  async (_arg, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const userId = getState().user.user?.user_id;
      return await getBalance(token, userId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const subscribeToRealTimeUpdates = createAsyncThunk(
  "user/subscribeToRealTime",
  async (_, { dispatch, getState }) => {
    const userId = getState().user.user?.user_id;
    if (!userId) throw new Error("User not authenticated");

    const unsubBal = subscribeToBalanceUpdates(userId, (balance) => {
      dispatch(updateBalanceRealTime(balance));
    });
    const unsubTx = subscribeToTransactionUpdates(userId, (txs) => {
      dispatch(updateTransactionsRealTime(txs));
    });
    return { unsubBal, unsubTx };
  }
);

// --- Slice ---------------------------------------------------------------

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.balance = null;
      state.exposure = null;
      state.matchExposures = {};
      state.transactions = [];
      state.realTimeConnected = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      disconnectSocket();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    updateExposure: (state, action) => {
      state.exposure = action.payload;
    },
    updateMatchExposure: (state, action) => {
      state.matchExposures = { ...state.matchExposures, ...action.payload };
    },
    updateUserBalanceAndExposure: (state, action) => {
      if (action.payload.balance !== undefined)
        state.balance = action.payload.balance;
      if (action.payload.exposure !== undefined)
        state.exposure = action.payload.exposure;
    },
    setDemoUser: (state) => {
      state.user = demoUser;
      state.balance = 1500;
      state.exposure = 0;
      state.isAuthenticated = true;
      state.realTimeConnected = false;
      localStorage.setItem("token", "demo-token");
      localStorage.setItem("user", JSON.stringify(demoUser));
    },
    updateBalanceRealTime: (state, action) => {
      state.balance = action.payload.inr_balance || action.payload;
      state.exposure = action.payload.exposure || state.exposure;
      state.realTimeConnected = true;
    },
    updateTransactionsRealTime: (state, action) => {
      state.transactions = action.payload;
      state.realTimeConnected = true;
    },
    setRealTimeConnectionStatus: (state, action) => {
      state.realTimeConnected = action.payload;
    },
    updateDemoBalanceAndExposure: (state, action) => {
      if (
        !state.isAuthenticated ||
        (state.user && state.user.username === "Demo")
      ) {
        const { exposure } = action.payload;
        state.balance = Number(
          (
            (state.balance !== null ? Number(state.balance) : 1500) -
            Number(exposure)
          ).toFixed(2)
        );
        state.exposure = Number(
          (
            (state.exposure !== null ? Number(state.exposure) : 0) +
            Number(exposure)
          ).toFixed(2)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // --- login ---
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.token) {
          state.user = action.payload.user || action.payload;
          state.isAuthenticated = true;
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem(
            "user",
            JSON.stringify(action.payload.user || action.payload)
          );
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      // --- 2FA ---
      .addCase(verify2FAThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FAThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.error = null;
        if (action.payload.token)
          localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.user || action.payload)
        );
      })
      .addCase(verify2FAThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "2FA Verification failed";
      })
      // --- profile ---
      .addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      // --- exposures ---
      .addCase(fetchExposuresThunk.fulfilled, (state, action) => {
        state.matchExposures = action.payload || {};
      })
      // --- balance ---
      .addCase(fetchBalanceThunk.pending, (state) => {
        state.balanceLoading = true;
        state.balanceError = null;
      })
      .addCase(fetchBalanceThunk.fulfilled, (state, action) => {
        state.balanceLoading = false;
        state.balance = action.payload.inr_balance;
        state.exposure = action.payload.exposure;
        state.balanceError = null;
        if (action.payload.username) {
          state.user = {
            ...state.user,
            username: action.payload.username,
          };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(fetchBalanceThunk.rejected, (state, action) => {
        state.balanceLoading = false;
        state.balanceError = action.payload || "Failed to fetch balance";
      })
      // --- real-time ---
      .addCase(subscribeToRealTimeUpdates.fulfilled, (state) => {
        state.realTimeConnected = true;
      })
      .addCase(subscribeToRealTimeUpdates.rejected, (state) => {
        state.realTimeConnected = false;
      });
  },
});

export const {
  logout,
  updateUser,
  updateExposure,
  updateMatchExposure,
  updateUserBalanceAndExposure,
  setDemoUser,
  updateBalanceRealTime,
  updateTransactionsRealTime,
  setRealTimeConnectionStatus,
  updateDemoBalanceAndExposure,
} = userSlice.actions;

export default userSlice.reducer;
