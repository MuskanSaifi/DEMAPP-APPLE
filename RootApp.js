// src/RootApp.js

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserWishlist } from './redux/wishlistSlice'; // Adjust the path as needed
import AppNavigator from './navigation/AppNavigator';

const RootApp = () => {
    const dispatch = useDispatch();
    // Assuming your user data is stored in the 'user' slice
    const user = useSelector((state) => state.user.user); 

    useEffect(() => {
        // Only fetch the wishlist if a user is logged in (i.e., the user object exists)
        if (user && user._id) { 
            // Dispatch the action to fetch the wishlist from the server
            console.log("RootApp: User is logged in. Fetching wishlist...");
            dispatch(fetchUserWishlist());
        } else {
            console.log("RootApp: No user logged in. Skipping wishlist fetch.");
            // You could also clear the wishlist state here if a user logs out
            // dispatch(clearWishlist());
        }
    }, [dispatch, user]);

    return <AppNavigator />;
};

export default RootApp;