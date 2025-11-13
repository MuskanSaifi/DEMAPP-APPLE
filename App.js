import React, { useState, useEffect, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AuthProvider } from "./context/AuthContext";
import { BuyerAuthProvider, BuyerAuthContext } from "./context/BuyerAuthContext";
import RootApp from "./RootApp";
import NoInternetScreen from "./screens/NoInternet";
import { Provider as PaperProvider, Portal } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";

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

function MainApp() {
  const { isLoading: userLoading } = useContext(require("./context/AuthContext").AuthContext);
  const { isLoading: buyerLoading } = useContext(BuyerAuthContext);

if (userLoading || buyerLoading) {
  return (
    <View style={[loadingStyles.container, { backgroundColor: "#f8fafc" }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Image
        source={require("./assets/New_icon.png")} // your app logo
        style={{ width: 100, height: 100, marginBottom: 20 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={[loadingStyles.text, { color: "#2563EB", marginTop: 12 }]}>
        Loading your session...
      </Text>
    </View>
  );
}


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <RootApp />
    </SafeAreaView>
  );
}

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

    return () => unsubscribe();
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
    return <NoInternetScreen onRetry={handleRetryConnection} />;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <BuyerAuthProvider>
          <PaperProvider>
            <Portal.Host>
              <SafeAreaProvider>
                <NavigationContainer>
                  <MainApp />
                </NavigationContainer>
                <FlashMessage position="top" />
              </SafeAreaProvider>
            </Portal.Host>
          </PaperProvider>
        </BuyerAuthProvider>
      </AuthProvider>
    </Provider>
  );
}
