import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from "../context/AuthContext";

const CustomerLeads = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Removed currentPage and itemsPerPage as pagination is being removed

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!user?._id) {
          console.error("User ID not found in context.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://dialexportmart.com/api/userprofile/leadandwnquiry/recieveenquiry/${user._id}`
        );

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  // Removed pagination logic (indexOfLastRequest, indexOfFirstRequest, currentRequests, totalPages, handlePrevPage, handleNextPage)

  // Helper to format date if available
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A0DAD" />
        <Text style={styles.loadingText}>Fetching your leads...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>
        Total Enquiries <Text style={styles.count}>({requests.length})</Text>
      </Text>

      {requests.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Icon name="information-outline" size={60} color="#B0BEC5" />
          <Text style={styles.noData}>No enquiries found for your account.</Text>
          <Text style={styles.noDataSubtext}>Start exploring products to receive leads!</Text>
        </View>
      ) : (
        <FlatList
          data={requests} // Now directly using 'requests' array, no slicing needed
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{item?.product?.name || "Product Name N/A"}</Text>
                <View style={styles.statusBadge}>
                  <Icon
                    name={
                      item.status === "Pending"
                        ? "clock-outline"
                        : item.status === "Completed"
                          ? "check-circle-outline"
                          : "close-circle-outline"
                    }
                    size={16}
                    color={
                      item.status === "Pending"
                        ? "#F59E0B"
                        : item.status === "Completed"
                          ? "#10B981"
                          : "#EF4444"
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      item.status === "Pending"
                        ? styles.pending
                        : item.status === "Completed"
                          ? styles.completed
                          : styles.rejected,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Icon name="phone" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.label}>Buyer Contact:</Text>
                  <Text style={styles.value}>{item?.buyer?.mobileNumber || "N/A"}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="calendar-range" size={18} color="#6B7280" style={styles.infoIcon} />
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Quantity:</Text>
                    <Text style={styles.value}>{item.quantity || "N/A"}</Text>
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Unit:</Text>
                    <Text style={styles.value}>{item.unit || "N/A"}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#555",
    fontWeight: '600',
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    color: "#2C3E50",
    marginTop: 20,
  },
  count: {
    color: "#4A90E2",
    fontSize: 24,
    fontWeight: 'bold',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  noData: {
    textAlign: "center",
    fontSize: 18,
    fontStyle: "italic",
    color: "#7F8C8D",
    marginTop: 15,
    fontWeight: '500',
  },
  noDataSubtext: {
    textAlign: "center",
    fontSize: 14,
    color: "#95A5A6",
    marginTop: 5,
  },
  flatListContent: {
    paddingVertical: 5, // Added padding at top and bottom of the list
    paddingHorizontal: 5, // A little extra horizontal padding for the cards
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20, // Increased margin between cards
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
    marginHorizontal: 5, // Added horizontal margin to the cards themselves
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  productName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#2C3E50",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  pending: {
    color: "#D97706",
  },
  completed: {
    color: "#059669",
  },
  rejected: {
    color: "#DC2626",
  },
  infoSection: {
    marginTop: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 8,
    width: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495E",
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
});

export default CustomerLeads;