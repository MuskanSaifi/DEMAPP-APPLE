import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Alert, // Make sure Alert is imported
} from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from "../../context/AuthContext";

const EnquiryScreen = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "https://www.dialexportmart.com";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!user?._id) {
          console.error("User ID not found. Cannot fetch enquiries.");
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `${API_BASE_URL}/api/userprofile/leadandwnquiry/recieveenquiry/${user._id}`
        );
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        Alert.alert("Error", "Failed to fetch enquiries. Please try again.");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const openWhatsAppChat = (buyerPhoneNumber, buyerName, productName) => {
    if (buyerPhoneNumber) {
      const cleanedPhoneNumber = buyerPhoneNumber.replace(/\D/g, '');
      const whatsappNumber = cleanedPhoneNumber.startsWith('91') ? cleanedPhoneNumber : `91${cleanedPhoneNumber}`;
      const sellerName = user?.fullname || "Seller";
      const message = `Hey ${buyerName || 'there'}, regarding your inquiry for "${productName || 'a product'}". I am ${sellerName}. How can I assist you further?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      Linking.openURL(whatsappUrl).catch((err) => {
        console.error("Failed to open WhatsApp:", err);
        Alert.alert("Error", "Could not open WhatsApp. Please ensure it is installed.");
      });
    } else {
      Alert.alert("Information", "Phone number not available for WhatsApp chat.");
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      if (!user?._id) {
        console.error("User ID not found. Cannot update enquiry status.");
        Alert.alert("Error", "User not logged in. Cannot update status.");
        return;
      }

      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );

      const response = await axios.patch(
        `${API_BASE_URL}/api/userprofile/leadandwnquiry/recieveenquiry/${user._id}`,
        {
          requestId: requestId,
          status: newStatus,
        }
      );

      if (response.data.success) {
        Alert.alert("Success", "Status updated successfully!");
      } else {
        setRequests(prevRequests =>
          prevRequests.map(req =>
            req._id === requestId ? { ...req, status: req.status } : req
          )
        );
        Alert.alert("Error", `Failed to update status: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status: req.status } : req
        )
      );
      Alert.alert("Error", "Network error or server issue while updating status. Please try again.");
    }
  };

  const showStatusOptions = (requestId) => {
    const statusOptions = ["Pending", "Responded", "Completed", "Cancelled", "Cancel"];
    Alert.alert(
      "Update Status",
      "Select a new status for this enquiry:",
      statusOptions.map((status) => ({
        text: status,
        onPress: () => {
          if (status !== "Cancel") {
            handleStatusUpdate(requestId, status);
          }
        },
        style: status === "Cancel" ? "cancel" : "default",
      }))
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Total Leads: <Text style={styles.count}>{requests.length}</Text>
      </Text>

      {requests.length === 0 ? (
        <Text style={styles.noData}>No enquiries found. Please try again later.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.buyerName}>{item?.buyer?.fullname || "Unknown Buyer"}</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    item.status === 'Pending' ? styles.statusPending :
                    item.status === 'Completed' ? styles.statusCompleted :
                    item.status === 'Responded' ? styles.statusResponded :
                    styles.statusCancelled
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="phone" size={18} color="#6B7280" style={styles.infoIcon} />
                <Text style={styles.label}>Call Buyer:</Text>
                {item?.buyer?.mobileNumber ? (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.buyer.mobileNumber}`)}>
                    <Text style={[styles.value, styles.linkText]}>
                      {item.buyer.mobileNumber}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.value}>N/A</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Icon name="tag" size={18} color="#6B7280" style={styles.infoIcon} />
                <Text style={styles.label}>Product Name:</Text>
                <Text style={styles.value}>{item?.product?.name || "N/A"}</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.quantityContainer}>
                  <Text style={styles.label}>Quantity:</Text>
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                  </View>
                </View>
                {item.unit && (
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Unit:</Text>
                    <Text style={styles.value}>{item.unit}</Text>
                  </View>
                )}
              </View>

              {item?.buyer?.mobileNumber && (
                <TouchableOpacity
                  onPress={() => openWhatsAppChat(item.buyer.mobileNumber, item.buyer.fullname, item.product.name)}
                  style={styles.whatsappButton}
                >
                  <Icon name="whatsapp" size={20} color="#fff" />
                  <Text style={styles.whatsappButtonText}>Chat with {item.buyer.fullname}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => showStatusOptions(item._id)}
                style={styles.updateStatusButton}
              >
                <Text style={styles.updateStatusButtonText}>Update Status</Text>
                <Icon name="chevron-down" size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },
  count: {
    color: "#2563EB",
  },
  noData: {
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
    color: "#6B7280",
    marginTop: 60,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // gray-100
  },
  buyerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937", // gray-900
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "400",
    color: "#1F2937",
    flexShrink: 1,
  },
  linkText: {
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  quantityBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  quantityText: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
    alignSelf: "flex-start",
    overflow: 'hidden',
  },
  statusPending: {
    backgroundColor: "#FCD34D",
    color: "#92400E",
  },
  statusResponded: {
    backgroundColor: "#93C5FD",
    color: "#1D4ED8",
  },
  statusCompleted: {
    backgroundColor: "#A7F3D0",
    color: "#065F46",
  },
  statusCancelled: {
    backgroundColor: "#FCA5A5",
    color: "#991B1B",
  },
  whatsappButton: {
    backgroundColor: "#22C55E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  whatsappButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  updateStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  updateStatusButtonText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
});

export default EnquiryScreen;