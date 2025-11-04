// components/buyerdashboard/Sidebar.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector, useDispatch } from "react-redux";
import { clearReduxBuyer } from "../../redux/buyerSlice"; // ✅ import your Redux action

const BuyerSidebar = ({ activeScreen, setActiveScreen, toggleSidebar, navigation }) => {
  const dispatch = useDispatch();

  // ✅ Get buyer from Redux store
  const buyer = useSelector((state) => state.buyer.buyer);

  // ✅ Logout function
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          dispatch(clearReduxBuyer());
          toggleSidebar();
          navigation.reset({
            index: 0,
            routes: [{ name: "BuyerLoginScreen" }],
          });
        },
      },
    ]);
  };

  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.sidebar}>
        {/* Buyer Info Header */}
        <TouchableOpacity
          style={styles.headerRow}
          onPress={() => {
            setActiveScreen("BuyerProfile");
            toggleSidebar();
          }}
        >
          {buyer?.icon ? (
            <Image source={{ uri: buyer.icon }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.avatarText}>
                {buyer?.fullname?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>👋 Welcome!</Text>
            <Text style={styles.nameText}>{buyer?.fullname || "Buyer"}</Text>
          </View>
        </TouchableOpacity>

        {/* 🧭 Menu Items */}
        <TouchableOpacity
          style={[styles.menuItem, activeScreen === "Profile" && styles.activeItem]}
          onPress={() => {
            setActiveScreen("Profile");
            toggleSidebar();
          }}
        >
          <Icon name="account-circle-outline" size={20} color="#666" />
          <Text style={styles.label}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeScreen === "Wishlist" && styles.activeItem]}
          onPress={() => {
            setActiveScreen("Wishlist");
            toggleSidebar();
          }}
        >
          <Icon name="heart-outline" size={20} color="#666" />
          <Text style={styles.label}>Wishlist</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeScreen === "BlockedSellers" && styles.activeItem]}
          onPress={() => {
            setActiveScreen("BlockedSellers");
            toggleSidebar();
          }}
        >
          <Icon name="account-cancel-outline" size={20} color="#666" />
          <Text style={styles.label}>Blocked Sellers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeScreen === "HelpDesk" && styles.activeItem]}
          onPress={() => {
            setActiveScreen("HelpDesk");
            toggleSidebar();
          }}
        >
          <Icon name="headset" size={20} color="#666" />
          <Text style={styles.label}>Help Desk</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#666" />
          <Text style={styles.label}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Background overlay */}
      <TouchableOpacity style={styles.backdrop} onPress={toggleSidebar} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 999,
  },
  sidebar: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    width: 380,
    height: "100%",
    zIndex: 1000,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  textContainer: {
    flexDirection: "column",
  },
  greetingText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeItem: {
    backgroundColor: "#E9EAFD",
    borderWidth: 1,
    borderColor: "#6A5ACD",
  },
  label: {
    color: "#333",
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});

export default BuyerSidebar;
