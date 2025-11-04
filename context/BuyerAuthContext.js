// BuyerAuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BuyerAuthContext = createContext();

export const BuyerAuthProvider = ({ children }) => {
  const [buyer, setBuyer] = useState(null);
  const [buyerToken, setBuyerToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Runs once on app start
  useEffect(() => {
    const loadBuyerData = async () => {
      try {
        const storedBuyer = await AsyncStorage.getItem("buyer");
        const storedToken = await AsyncStorage.getItem("buyerToken");
        if (storedBuyer && storedToken) {
          setBuyer(JSON.parse(storedBuyer));
          setBuyerToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading buyer data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBuyerData();
  }, []);

  // ✅ Save buyer login
  const loginBuyer = async (buyerData, token) => {
    try {
      await AsyncStorage.setItem("buyer", JSON.stringify(buyerData));
      await AsyncStorage.setItem("buyerToken", token);
      setBuyer(buyerData);
      setBuyerToken(token);
    } catch (error) {
      console.error("Error saving buyer:", error);
    }
  };

  // ✅ Clear buyer data
  const logoutBuyer = async () => {
    await AsyncStorage.removeItem("buyer");
    await AsyncStorage.removeItem("buyerToken");
    setBuyer(null);
    setBuyerToken(null);
  };

  return (
    <BuyerAuthContext.Provider
      value={{ buyer, buyerToken, loginBuyer, logoutBuyer, loading }}
    >
      {children}
    </BuyerAuthContext.Provider>
  );
};
