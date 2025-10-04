// App.js

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import { AuthProvider } from "./context/AuthContext";
import RootApp from "./RootApp";
import NoInternetScreen from "./screens/NoInternet";
import { Provider as PaperProvider, Portal } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";

// Styles for the loading state (while checking connection)
const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#d20606ff",
  },
});

export default function App() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
      setIsChecking(false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      setIsInternetReachable(state.isInternetReachable);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetryConnection = async () => {
    setIsChecking(true);
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    setIsInternetReachable(state.isInternetReachable);
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <View style={loadingStyles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={loadingStyles.text}>Checking connection...</Text>
      </View>
    );
  }

  if (!isConnected || !isInternetReachable) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <NoInternetScreen onRetry={handleRetryConnection} />
      </>
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <PaperProvider>
          <Portal.Host>
            <SafeAreaProvider>
              <NavigationContainer>
                <SafeAreaView
                  style={{ flex: 1, backgroundColor: "#fff" }}
                  edges={["left", "right", "bottom"]} 
                >
                  <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                  <RootApp />
                </SafeAreaView>
              </NavigationContainer>
                                  <FlashMessage position="top" />
            </SafeAreaProvider>
          </Portal.Host>
        </PaperProvider>
      </AuthProvider>
    </Provider>
  );
}
