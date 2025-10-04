// store/blockedSlice.js
import { createSlice } from "@reduxjs/toolkit";

const blockedSlice = createSlice({
  name: "blocked",
  initialState: {
    blockedSellers: [],
  },
  reducers: {
    blockSeller: (state, action) => {
      if (!state.blockedSellers.includes(action.payload)) {
        state.blockedSellers.push(action.payload);
      }
    },
    unblockSeller: (state, action) => {
      state.blockedSellers = state.blockedSellers.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const { blockSeller, unblockSeller } = blockedSlice.actions;
export default blockedSlice.reducer;
