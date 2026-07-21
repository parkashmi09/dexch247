import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userSlice.js";
import matchedBetsReducer from "./features/matchedBets/matchedBetsSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    matchedBets: matchedBetsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
