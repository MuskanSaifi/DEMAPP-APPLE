import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const DashboardMain = ({ setActiveScreen }) => {
  const { user, token, isLoading: authLoading } = useContext(AuthContext);

  const [greeting, setGreeting] = useState("");
  const [userDetail, setUserDetail] = useState(null);
  const [products, setProducts] = useState(null);
  const [totalPayments, setTotalPayments] = useState(null);
  const [totalBuyers, setTotalBuyers] = useState(null);
  const [loading, setLoading] = useState(true);

  const users = 0;

  useEffect(() => {
    if (token && user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userId = user?._id;
      if (!token || !userId) return;

      const [profileRes, leadsRes] = await Promise.all([
        axios.get("https://www.dialexportmart.com/api/userprofile/profile/userprofile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`https://www.dialexportmart.com/api/userprofile/leadandwnquiry/recieveenquiry/${userId}`),
      ]);

      const userData = profileRes.data.user;
      const enquiries = leadsRes.data.data;

      setUserDetail(userData);
      setProducts(profileRes.data.productsLength);
      setTotalPayments(userData.userPackage?.length || 0);
      setTotalBuyers(enquiries.length);
      setGreetingMessage(userData?.fullname);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setTotalBuyers(0);
    } finally {
      setLoading(false);
    }
  };

  const setGreetingMessage = (name = "User") => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting(`Good Morning, ${name} ☀️`);
    } else if (currentHour < 18) {
      setGreeting(`Good Afternoon, ${name} 🌤️`);
    } else {
      setGreeting(`Good Evening, ${name} 🌙`);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>

      <View style={styles.grid}>
        
        <View style={[styles.card, { backgroundColor: "#E3F2FD" }]}>
          <Ionicons name="people" size={30} color="#1976D2" />
          <Text style={styles.cardTitle}>Users</Text>
          <Text style={styles.cardNumber}>{users}</Text>
        </View>

<TouchableOpacity
      style={[styles.card, { backgroundColor: "#F1F8E9" }]}
      onPress={() => setActiveScreen("Customer Leads")}
      activeOpacity={0.8}>
    <MaterialIcons name="shopping-cart" size={30} color="#388E3C" />
    <Text style={styles.cardTitle}>Buyers</Text>
    <Text style={styles.cardNumber}>{totalBuyers ?? "0"}</Text>
</TouchableOpacity>

        <View style={[styles.card, { backgroundColor: "#FFF3E0" }]}>
          <FontAwesome5 name="box" size={30} color="#F57C00" />
          <Text style={styles.cardTitle}>Products</Text>
          <Text style={styles.cardNumber}>{products ?? "0"}</Text>
        </View>


<TouchableOpacity
      style={[styles.card, { backgroundColor: "#FCE4EC" }]}
      onPress={() => setActiveScreen("Payments")}
      activeOpacity={0.8}>
      <Ionicons name="card" size={30} color="#D81B60" />
      <Text style={styles.cardTitle}>Payments</Text>
      <Text style={styles.cardNumber}>{totalPayments ?? "0"}</Text>
</TouchableOpacity>

      </View>

      <Text style={styles.footerText}>🚀 Keep growing your business with us!</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FAFAFA",
    flexGrow: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 10,
  },
  cardNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginTop: 4,
  },
  footerText: {
    marginTop: 30,
    color: "#757575",
    fontSize: 14,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
});

export default DashboardMain;
