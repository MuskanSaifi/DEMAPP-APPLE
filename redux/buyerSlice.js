  import { createSlice } from '@reduxjs/toolkit';

  const initialState = {
    buyer: null,
    token: null,
  };

  const buyerSlice = createSlice({
    name: 'buyer',
    initialState,
    reducers: {
      setReduxBuyer: (state, action) => {
        state.buyer = action.payload.buyer;
        state.token = action.payload.token;
      },
      clearReduxBuyer: (state) => {
        state.buyer = null;
        state.token = null;
      },
    },
  });

  export const { setReduxBuyer, clearReduxBuyer } = buyerSlice.actions;
  export default buyerSlice.reducer;
