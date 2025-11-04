// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persistent storage
import { setReduxUser, clearReduxUser } from '../redux/userSlice'; // Import your Redux user actions

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user.user);
  const reduxToken = useSelector((state) => state.user.token);

  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  // Function to handle user login and update Redux state
  const login = async (userData, userToken) => {
    try {
      // 1. Update local context state
      setUser(userData);
      setToken(userToken);

      // 2. Save token and user data to AsyncStorage for persistence
      await AsyncStorage.setItem('authToken', userToken); // Using 'authToken' as per your code
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // 3. Dispatch to Redux store with the correct structured payload
      dispatch(setReduxUser({ user: userData, token: userToken }));

    } catch (e) {
      console.error("AuthContext: Error during login:", e);
    }
  };

  // Function to handle user logout and clear Redux state
  const logout = async () => {
    try {
      // 1. Clear local context state
      setUser(null);
      setToken(null);

      // 2. Clear data from AsyncStorage
      await AsyncStorage.removeItem('authToken'); // Using 'authToken' as per your code
      await AsyncStorage.removeItem('userData');

      // 3. Dispatch to Redux store
      dispatch(clearReduxUser());

    } catch (e) {
      console.error("AuthContext: Error during logout:", e);
    }
  };

  // Effect to check for stored authentication on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = await AsyncStorage.getItem('authToken'); // Using 'authToken' as per your code
        const storedUserData = await AsyncStorage.getItem('userData');

        if (storedToken && storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          // Update local context state
          setToken(storedToken);
          setUser(parsedUserData);
          // Dispatch to Redux if stored data is found with the correct structured payload
          dispatch(setReduxUser({ user: parsedUserData, token: storedToken }));
        } else {
          // If no stored data, ensure Redux state is clear and local states are null
          setUser(null);
          setToken(null);
          dispatch(clearReduxUser());
        }
      } catch (e) {
        console.error("AuthContext: Error loading stored auth:", e);
        // Clear states on error
        setUser(null);
        setToken(null);
        dispatch(clearReduxUser()); // Clear Redux state on error
        await AsyncStorage.removeItem('authToken'); // Clean up potentially bad data
        await AsyncStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, [dispatch]); // Only re-run when dispatch changes (which it won't)

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
