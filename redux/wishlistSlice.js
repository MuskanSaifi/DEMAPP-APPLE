// store/wishlistSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import Toast from 'react-native-toast-message'; // Example: You'll need to install and configure a React Native toast library

// IMPORTANT: Replace with your actual backend API URL.
// If running on a physical device, this must be your machine's IP address.
// If running on an emulator, 'http://10.0.2.2' is common for Android emulators to access localhost.
// For iOS simulators, 'http://localhost' usually works, but your machine's IP is safer.
const API_BASE_URL = "https://www.dialexportmart.com"; // Corrected URL

// Helper for showing toasts (You'll implement this based on your chosen toast library)
const showToast = (type, text1, text2 = '') => {
    // Example using react-native-toast-message:
    // Toast.show({
    //     type: type, // 'success', 'error', 'info'
    //     text1: text1,
    //     text2: text2,
    //     position: 'bottom',
    //     visibilityTime: 3000,
    //     autoHide: true,
    //     topOffset: 30,
    //     bottomOffset: 40,
    // });
    console.log(`Toast (${type}): ${text1} - ${text2}`); // Fallback to console for now
};


// Async Thunks for API calls
export const fetchUserWishlist = createAsyncThunk(
  "wishlist/fetchUserWishlist",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from Redux store (userSlice)
      const token = getState().user.token;
      if (!token) {
        // No toast for this, as it's typically handled by a login redirect or message
        return rejectWithValue("No authentication token found.");
      }

      const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      return response.data.wishlist || [];
    } catch (error) {
      console.error("❌ Error fetching user wishlist:", error);
      // showToast('error', 'Failed to load wishlist.'); // Optional: You could show a toast here too
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
    }
  }
);

export const addProductToWishlist = createAsyncThunk(
  "wishlist/addProductToWishlist",
  async (productId, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        showToast('error', "Please log in to add to wishlist."); // Inform user to log in
        return rejectWithValue("No authentication token found.");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/wishlist`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showToast('success', "Product added to wishlist!"); // Success toast
      return response.data.wishlist;
    } catch (error) {
      console.error("❌ Error adding product to wishlist:", error);
      const errorMessage = error.response?.data?.message || "Failed to add product to wishlist";
      showToast('error', errorMessage); // Error toast
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeProductFromWishlist = createAsyncThunk(
  "wishlist/removeProductFromWishlist",
  async (productId, { rejectWithValue, getState }) => {
    try {
      const token = getState().user.token;
      if (!token) {
        showToast('error', "Please log in to remove from wishlist."); // Inform user to log in
        return rejectWithValue("No authentication token found.");
      }

      const response = await axios.delete(`${API_BASE_URL}/api/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showToast('success', "Product removed from wishlist!"); // Success toast
      return response.data.wishlist;
    } catch (error) {
      console.error("❌ Error removing product from wishlist:", error);
      const errorMessage = error.response?.data?.message || "Failed to remove product from wishlist";
      showToast('error', errorMessage); // Error toast
      return rejectWithValue(errorMessage);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
      state.loading = false;
      showToast('info', "Wishlist cleared!"); // Optional: Toast for clearing wishlist on logout
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchUserWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Product to Wishlist
      .addCase(addProductToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addProductToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove Product from Wishlist
      .addCase(removeProductFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProductFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removeProductFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
