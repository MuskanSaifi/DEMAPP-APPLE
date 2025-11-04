import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";

import Sidebar from "../components/buyerdashboard/Sidebar";
import BottomTabs from "../components/BottomTabs";
import BuyerProfile from "../components/buyerdashboard/BuyerProfile";
import HelpDeskScreen from "../components/buyerdashboard/HelpDesk";
import Wishlist from "../components/buyerdashboard/Wishlist";
import BlockedSellers from "../components/buyerdashboard/BlockedSellers";

const { width } = Dimensions.get("window");

const BuyerDashboardScreen = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-width * 0.8)).current;
  const [activeScreen, setActiveScreen] = useState("Profile");

  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // 👇 Get auth info from Redux
  const buyer = useSelector((state) => state.buyer.buyer);
  const token = useSelector((state) => state.buyer.token);

  // 🚧 Redirect to Login if not logged in
  useEffect(() => {
    if (!token) {
      navigation.reset({
        index: 0,
        routes: [{ name: "BuyerLoginScreen" }],
      });
    }
  }, [token, navigation]);

  useEffect(() => {
    if (route.params?.selectedTab) {
      setActiveScreen(route.params.selectedTab);
      navigation.setParams({ selectedTab: undefined });
    }
  }, [route.params?.selectedTab]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      if (sidebarVisible) {
        toggleSidebar();
      }
    });
    return unsubscribe;
  }, [navigation, sidebarVisible]);

  const toggleSidebar = () => {
    if (!sidebarVisible) {
      setSidebarVisible(true);
      Animated.timing(sidebarX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sidebarX, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSidebarVisible(false);
      });
    }
  };

  // 🚫 If not logged in, show nothing temporarily (redirect will happen)
  if (!token) {
    return null;
  }

  return (
    <SafeAreaView
  style={[styles.safeAreaContainer, { paddingTop: Platform.OS === "android" ? 0 : 0 }]}
  edges={['left', 'right', 'bottom']}
>

      {/* Sidebar */}
      {sidebarVisible && isFocused && (
        <>
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}
          >
            <Sidebar
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              toggleSidebar={toggleSidebar}
              isVisible={sidebarVisible}
              navigation={navigation}
            />
          </Animated.View>

          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        </>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{activeScreen}</Text>
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon name="menu" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Screens */}
      {activeScreen === "Profile" && <BuyerProfile />}
      {activeScreen === "Wishlist" && <Wishlist />}
      {activeScreen === "BlockedSellers" && <BlockedSellers />}
      {activeScreen === "HelpDesk" && <HelpDeskScreen />}

      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
header: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  backgroundColor: "#FFF",
  borderBottomWidth: 1,
  borderBottomColor: "#e0e0e0",
  marginTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
},

  screenTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6D4AAE",
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.75,
    height:
      Dimensions.get("window").height +
      (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
    zIndex: 999,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  bottomTabsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },
});

export default BuyerDashboardScreen;
