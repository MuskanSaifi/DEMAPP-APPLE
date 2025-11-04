import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { clearReduxBuyer } from "../redux/buyerSlice";

const { width: screenWidth } = Dimensions.get("window");

const Sidebar = ({ activeScreen, toggleSidebar, navigation }) => {
  const { logout, token } = useContext(AuthContext);
  const dispatch = useDispatch();

  const buyer = useSelector((state) => state.buyer.buyer);

  const [expanded, setExpanded] = useState("");
  const [userDetail, setUserDetail] = useState(null);

  const toggleExpand = (section) =>
    setExpanded((prev) => (prev === section ? "" : section));

  useEffect(() => {
    if (token && !buyer) fetchUser();
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://www.dialexportmart.com/api/userprofile/profile/userprofile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetail(res.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err.response?.data || err.message);
    }
  };

  // ✅ GUEST SIDEBAR (no login)
  if (!buyer && !token) {
    return (
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <Text style={styles.welcome}>Welcome 👋</Text>
          <Text style={styles.subtitle}>Choose what you’d like to do below:</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={() => {
              toggleSidebar();
              navigation.navigate("BuyerLoginScreen");
            }}
          >
            <Icon name="cart-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>I Want to Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.sellButton]}
            onPress={() => {
              toggleSidebar();
              navigation.navigate("Login");
            }}
          >
            <Icon name="store-outline" size={22} color="#fff" />
            <Text style={styles.actionText}>I Want to Sell</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.footerNote}>
            You’ll be redirected to the respective login page.
          </Text>
        </View>
        <TouchableOpacity style={styles.backdrop} onPress={toggleSidebar} />
      </View>
    );
  }

  // ✅ BOTH LOGGED IN (Buyer + Seller)
  if (buyer && token) {
    return (
      <View style={styles.overlay}>
        <ScrollView style={styles.sidebar}>
          <View style={styles.headerRow}>
            <View style={styles.placeholderAvatar}>
              <Text style={styles.avatarText}>
                {buyer?.fullname?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.greetingText}>👋 Welcome!</Text>
              <Text style={styles.nameText}>
                {buyer?.fullname || "Buyer"} (Both Logged In)
              </Text>
            </View>
          </View>

          <Text style={styles.switchTitle}>Switch Account</Text>

          <TouchableOpacity
            style={[styles.switchButton, { backgroundColor: "#16A34A" }]}
            onPress={() => {
              toggleSidebar();
              navigation.navigate("BuyerDashboardScreen", {
                selectedTab: "Profile",
              });
            }}
          >
            <Icon name="cart-outline" size={22} color="#fff" />
            <Text style={styles.switchText}>Switch to Buyer Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchButton, { backgroundColor: "#9333EA" }]}
            onPress={() => {
              toggleSidebar();
              navigation.navigate("DashboardScreen", {
                selectedTab: "Dashboard",
              });
            }}
          >
            <Icon name="store-outline" size={22} color="#fff" />
            <Text style={styles.switchText}>Switch to Seller Dashboard</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout both accounts?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout Both",
                  style: "destructive",
                  onPress: async () => {
                    await logout();
                    dispatch(clearReduxBuyer());
                    toggleSidebar();
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "BuySell" }],
                    });
                  },
                },
              ]);
            }}
          >
            <Icon name="logout" size={20} color="#666" />
            <Text style={styles.label}>Logout Both</Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity style={styles.backdrop} onPress={toggleSidebar} />
      </View>
    );
  }

  // ✅ BUYER ONLY
  if (buyer && !token) {
    return (
      <View style={styles.overlay}>
        <ScrollView style={styles.sidebar}>
          <TouchableOpacity
            style={styles.headerRow}
            onPress={() => {
              toggleSidebar();
              navigation.navigate("BuyerDashboardScreen", {
                selectedTab: "Profile",
              });
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

          {[{ name: "Profile", icon: "account-circle-outline" },
            { name: "Wishlist", icon: "heart-outline" },
            { name: "BlockedSellers", icon: "account-cancel-outline" },
            { name: "HelpDesk", icon: "headset" }].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.menuItem,
                  activeScreen === item.name && styles.activeItem,
                ]}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("BuyerDashboardScreen", {
                    selectedTab: item.name,
                  });
                }}
              >
                <Icon name={item.icon} size={20} color="#666" />
                <Text style={styles.label}>{item.name}</Text>
              </TouchableOpacity>
            ))}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
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
                      routes: [{ name: "BuySell" }],
                    });
                  },
                },
              ]);
            }}
          >
            <Icon name="logout" size={20} color="#666" />
            <Text style={styles.label}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity style={styles.backdrop} onPress={toggleSidebar} />
      </View>
    );
  }

  // ✅ SELLER ONLY
  return (
    <View style={styles.overlay}>
      <ScrollView style={styles.sidebar}>
        <TouchableOpacity
          style={styles.headerRow}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("DashboardScreen", {
              selectedTab: "Dashboard",
            });
          }}
        >
          {userDetail?.icon ? (
            <Image source={{ uri: userDetail.icon }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.avatarText}>
                {userDetail?.fullname?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.greetingText}>👋 Welcome!</Text>
            <Text style={styles.nameText}>{userDetail?.fullname || "User"}</Text>
          </View>
        </TouchableOpacity>

        {/* Seller menu sections */}
        <TouchableOpacity style={styles.menuItem} onPress={() => toggleExpand("profile")}>
          <Icon name="account-circle" size={20} color="#666" />
          <Text style={styles.label}>Profile</Text>
          <Text style={styles.arrow}>{expanded === "profile" ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {expanded === "profile" && (
          <View style={styles.subMenu}>
            {["User Profile", "Business Profile", "Bank Details"].map((sub, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.subItem, activeScreen === sub && styles.activeSubItem]}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("DashboardScreen", { selectedTab: sub });
                }}
              >
                <Text
                  style={[
                    styles.subLabel,
                    activeScreen === sub && styles.activeSubLabel,
                  ]}
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={() => toggleExpand("products")}>
          <Icon name="package-variant" size={20} color="#666" />
          <Text style={styles.label}>Manage Products</Text>
          <Text style={styles.arrow}>{expanded === "products" ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {expanded === "products" && (
          <View style={styles.subMenu}>
            {["Add Product", "My Products"].map((sub, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.subItem, activeScreen === sub && styles.activeSubItem]}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("DashboardScreen", { selectedTab: sub });
                }}
              >
                <Text
                  style={[
                    styles.subLabel,
                    activeScreen === sub && styles.activeSubLabel,
                  ]}
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => toggleExpand("leads")}
        >
          <Icon name="account-question" size={20} color="#666" />
          <Text style={styles.label}>Leads & Enquiry</Text>
          <Text style={styles.arrow}>{expanded === "leads" ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {expanded === "leads" && (
          <View style={styles.subMenu}>
            <TouchableOpacity
              style={[styles.subItem, activeScreen === "Customer Leads" && styles.activeSubItem]}
              onPress={() => {
                toggleSidebar();
                navigation.navigate("DashboardScreen", { selectedTab: "Customer Leads" });
              }}
            >
              <Text
                style={[
                  styles.subLabel,
                  activeScreen === "Customer Leads" && styles.activeSubLabel,
                ]}
              >
                Customer Leads
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.menuItem, activeScreen === "Payments" && styles.activeItem]}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("DashboardScreen", { selectedTab: "Payments" });
          }}
        >
          <Icon name="credit-card" size={20} color="#666" />
          <Text style={styles.label}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleSidebar();
            navigation.navigate("DashboardScreen", {
              selectedTab: "Support Person",
            });
          }}
        >
          <Icon name="account-supervisor" size={20} color="#666" />
          <Text style={styles.label}>Support Person</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            Alert.alert("Logout", "Are you sure you want to logout?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                  await logout();
                  toggleSidebar();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "BuySell" }],
                  });
                },
              },
            ]);
          }}
        >
          <Icon name="logout" size={20} color="#666" />
          <Text style={styles.label}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <TouchableOpacity style={styles.backdrop} onPress={toggleSidebar} />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", position: "absolute", top: 0, left: 0, bottom: 0, right: 0, zIndex: 999 },
  sidebar: { backgroundColor: "#f9f9f9", paddingHorizontal: 15, width: screenWidth * 0.8, height: "100%", zIndex: 1000 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  headerRow: { flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: "#F1F5F9", borderRadius: 10, marginVertical: 10 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  subtitle: { fontSize: 15, color: "#555", marginBottom: 30 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  buyButton: { backgroundColor: "#16A34A" },
  sellButton: { backgroundColor: "#9333EA" },
  actionText: { color: "#fff", fontSize: 17, fontWeight: "600", marginLeft: 10 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 },
  footerNote: { textAlign: "center", color: "#666", fontSize: 13 },
  placeholderAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#CBD5E1", justifyContent: "center", alignItems: "center", marginRight: 12 },
  avatarText: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  textContainer: { flexDirection: "column" },
  greetingText: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  nameText: { fontSize: 14, fontWeight: "700", color: "#1F2937" },
  menuItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 12, elevation: 2 },
  activeItem: { backgroundColor: "#f0f0ff", borderColor: "#6A5ACD", borderWidth: 1 },
  label: { color: "#333", marginLeft: 12, fontSize: 16, fontWeight: "500", flex: 1 },
  subMenu: { paddingLeft: 20, marginTop: 4, marginBottom: 8 },
  subItem: { paddingVertical: 10, paddingLeft: 20, borderLeftWidth: 2, borderColor: "#ddd" },
  subLabel: { color: "#555", fontSize: 15 },
  activeSubLabel: { color: "#6A5ACD", fontWeight: "bold" },
  arrow: { color: "#666", fontSize: 14, marginLeft: 5 },
  welcome: { color: "#444", fontSize: 18, fontWeight: "700", marginBottom: 20 },
  switchTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginTop: 10, marginBottom: 12, textAlign: "center" },
  switchButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  switchText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 10 },
});

export default Sidebar;
