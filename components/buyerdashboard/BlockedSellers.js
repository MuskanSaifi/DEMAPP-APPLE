import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";

const BlockedSellers = () => {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.buyer);

  const fetchBlocked = async () => {
    try {
      const res = await axios.get("https://www.dialexportmart.com/api/buyer/blocked-sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBlocked(res.data.blockedList);
      }
    } catch (err) {
      console.error("Error fetching blocked sellers:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load blocked sellers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      console.warn("⚠️ No buyer token found in Redux");
      return;
    }
    fetchBlocked();
  }, [token]);

  // 🗑️ Unblock function
  const handleUnblock = (sellerId) => {
    Alert.alert(
      "Confirm Unblock",
      "Are you sure you want to unblock this seller?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: async () => {
            try {
              const res = await axios.delete(
                `https://www.dialexportmart.com/api/buyer/blocked-sellers?sellerId=${sellerId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (res.data.success) {
                Alert.alert("Success", "Seller unblocked successfully");
                setBlocked((prev) => prev.filter((item) => item.sellerId._id !== sellerId));
              }
            } catch (err) {
              Alert.alert("Error", err.response?.data?.error || "Failed to unblock seller");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Loading blocked sellers...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      {blocked.length === 0 ? (
        <Text style={{ color: "#666" }}>You haven’t blocked any sellers yet.</Text>
      ) : (
        <FlatList
          data={blocked}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
                backgroundColor: "#fafafa",
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {index + 1}. {item.sellerId?.fullname || "N/A"}
              </Text>
              <Text>Email: {item.sellerId?.email || "N/A"}</Text>
              <Text>Mobile: {item.sellerId?.mobileNumber || "N/A"}</Text>
              <Text>Company: {item.sellerId?.companyName || "N/A"}</Text>
              <Text style={{ color: "#555", marginTop: 4 }}>
                Blocked On: {new Date(item.createdAt).toLocaleString()}
              </Text>

              <TouchableOpacity
                onPress={() => handleUnblock(item.sellerId._id)}
                style={{
                  marginTop: 10,
                  backgroundColor: "#dc2626",
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default BlockedSellers;
