// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import wishlistReducer from './wishlistSlice'; 
import blockedReducer from "./blockedSlice";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    user: userReducer,
    wishlist: wishlistReducer, 
    blocked: blockedReducer,
  },
});