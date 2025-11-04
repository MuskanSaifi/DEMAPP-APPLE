// store/wishlistSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://www.dialexportmart.com"; // Backend base URL

// Simple toast helper (replace with your actual toast lib if available)
const showToast = (type, text1, text2 = "") => {
  console.log(`Toast (${type}): ${text1} - ${text2}`);
};

// 🧠 Helper to detect role and token (for both user & buyer)
const getAuthInfo = (getState) => {
  const { user, buyer } = getState();

  // ✅ Always prioritize buyer if both are logged in
  if (buyer?.buyer?._id && buyer?.token) {
    return { token: buyer.token, role: "buyer" };
  } else if (user?.user?._id && user?.token) {
    return { token: user.token, role: "user" };
  }

  return { token: null, role: null };
};


// =============== FETCH WISHLIST ===============
export const fetchUserWishlist = createAsyncThunk(
  "wishlist/fetchUserWishlist",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token, role } = getAuthInfo(getState);
      if (!token || !role) return rejectWithValue("Unauthorized");

      const response = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role }, // ✅ backend needs this
      });

      return response.data.wishlist || [];
    } catch (error) {
      console.error("❌ Error fetching wishlist:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch wishlist");
    }
  }
);

// =============== ADD PRODUCT ===============
export const addProductToWishlist = createAsyncThunk(
  "wishlist/addProductToWishlist",
  async (productId, { rejectWithValue, getState }) => {
    try {
      const { token, role } = getAuthInfo(getState);
      if (!token || !role) {
        showToast("error", "Please log in to add to wishlist.");
        return rejectWithValue("Unauthorized");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/wishlist`,
        { productId, role }, // ✅ include role
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("success", "Product added to wishlist!");
      return response.data.wishlist;
    } catch (error) {
      console.error("❌ Error adding wishlist:", error);
      const msg = error.response?.data?.message || "Failed to add product to wishlist";
      showToast("error", msg);
      return rejectWithValue(msg);
    }
  }
);

// =============== REMOVE PRODUCT ===============
export const removeProductFromWishlist = createAsyncThunk(
  "wishlist/removeProductFromWishlist",
  async (productId, { rejectWithValue, getState }) => {
    try {
      const { token, role } = getAuthInfo(getState);
      if (!token || !role) {
        showToast("error", "Please log in to remove from wishlist.");
        return rejectWithValue("Unauthorized");
      }

      console.log("🟢 Removing from wishlist:", productId, "role:", role);

      const response = await axios.delete(
        `${API_BASE_URL}/api/wishlist/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { role }, // ✅ send via query (backend expects this)
        }
      );

      showToast("success", "Product removed from wishlist!");
      return response.data.wishlist;
    } catch (error) {
      console.error("❌ Error removing wishlist:", error);
      const msg = error.response?.data?.message || "Failed to remove product from wishlist";
      showToast("error", msg);
      return rejectWithValue(msg);
    }
  }
);


// =============== SLICE ===============
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
      showToast("info", "Wishlist cleared!");
    },
  },
  extraReducers: (builder) => {
    builder
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
