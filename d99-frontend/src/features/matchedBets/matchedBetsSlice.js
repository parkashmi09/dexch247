import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserMatchedBets } from "../../apiservices/SportsApi.js";

const initialState = {
  matchedBets: [],
  loading: false,
  error: null,
};

export const fetchMatchedBetsThunk = createAsyncThunk(
  "matchedBets/fetchMatchedBets",
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const response = await getUserMatchedBets(eventId, userId);
      if (response.success) {
        // Normalize API shape → UI shape.
        // API returns: eventid, selection_name, odds, stake_amount, bet_type,
        //              game_type, created_at, status, market_id, id
        const normalizedBets = response.data.map((bet) => ({
          id: bet.id,
          event_id: bet.eventid,
          teamName: bet.selection_name,
          odds: bet.odds,
          stake: bet.stake_amount,
          betType: bet.bet_type,
          marketType: bet.game_type,
          market_id: bet.market_id,
          timestamp: bet.created_at,
          status: bet.status,
        }));
        return normalizedBets;
      }
      return rejectWithValue(response.error || "Failed to fetch matched bets");
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch matched bets");
    }
  }
);

const matchedBetsSlice = createSlice({
  name: "matchedBets",
  initialState,
  reducers: {
    /** Prepend a single newly-placed bet to the list. */
    addMatchedBet: (state, action) => {
      state.matchedBets.unshift(action.payload);
    },
    /** Remove a bet by its id (e.g. after cancellation). */
    removeMatchedBet: (state, action) => {
      state.matchedBets = state.matchedBets.filter(
        (bet) => bet.id !== action.payload
      );
    },
    /** Clear all bets from state (e.g. on navigation away from match). */
    clearMatchedBets: (state) => {
      state.matchedBets = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatchedBetsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchedBetsThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Replace the whole list — the API returns all open bets for the event
        // so a full replace is safer than merging to avoid duplicates.
        state.matchedBets = action.payload;
      })
      .addCase(fetchMatchedBetsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMatchedBet, removeMatchedBet, clearMatchedBets } =
  matchedBetsSlice.actions;

export default matchedBetsSlice.reducer;
