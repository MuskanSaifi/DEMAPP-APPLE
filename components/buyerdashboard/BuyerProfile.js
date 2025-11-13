// buyerdashboard/BuyerProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { logoutBuyer } from "../../redux/buyerSlice";

const BuyerProfile = () => {
  const token = useSelector((state) => state.buyer.token);
  const dispatch = useDispatch();
  const [buyerDetail, setBuyerDetail] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token) fetchBuyerData();
  }, [token]);

  const fetchBuyerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://www.dialexportmart.com/api/buyer/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBuyerDetail(response.data.buyer);
      setFormData(response.data.buyer);
    } catch (error) {
      console.error("Error fetching buyer data:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to fetch buyer details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setFormData({ ...formData, icon: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await axios.patch(
        "https://www.dialexportmart.com/api/buyer/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setBuyerDetail(response.data.buyer);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error saving buyer data:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete("https://www.dialexportmart.com/api/buyer/delete", {
                headers: { Authorization: `Bearer ${token}` },
              });
              dispatch(logoutBuyer());
              Alert.alert("Deleted", "Your account has been deleted");
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!buyerDetail) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Buyer not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} >
      {/* Header Section */}
      <LinearGradient colors={["#F9FAFB", "#F9FAFB"]} style={styles.header}>
        <TouchableOpacity onPress={editMode ? handleImageUpload : null}>
          {formData.icon ? (
            <Image source={{ uri: formData.icon }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.avatarText}>
                {buyerDetail.fullname?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.nameText}>{buyerDetail.fullname}</Text>
        <Text style={styles.emailText}>{buyerDetail.email || "Email not set"}</Text>
      </LinearGradient>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        {[
          { label: "Full Name", name: "fullname" },
          { label: "Email", name: "email" },
          { label: "Mobile Number", name: "mobileNumber" },
          { label: "Product Interested", name: "productname" },
          { label: "Quantity", name: "quantity" },
          { label: "Unit", name: "unit" },
          { label: "Currency", name: "currency" },
        ].map(({ label, name }) => (
          <View key={name} style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            {editMode ? (
              <TextInput
                style={styles.input}
                value={formData[name]?.toString() || ""}
                onChangeText={(text) => handleChange(name, text)}
              />
            ) : (
              <Text style={styles.cardValue}>{buyerDetail[name] || "N/A"}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {editMode ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setEditMode(false)}
              disabled={saving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    paddingVertical: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#fff",
  },
  placeholderAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#A5B4FC",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 36, color: "#ffffffff", fontWeight: "bold" },
  nameText: { color: "#000000ff", fontSize: 22, fontWeight: "700", marginTop: 10 },
  emailText: { color: "#000000ff", fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  detailsContainer: { paddingHorizontal: 16, marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 3,
  },
  cardLabel: { color: "#6B7280", fontSize: 13 },
  cardValue: { color: "#111827", fontSize: 15, marginTop: 2, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    marginTop: 4,
    backgroundColor: "#F9FAFB",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Platform.OS === "ios" ? 80 : 100, // 👈 iOS = 80, Android = 100
  },
  button: {
    flex: 0.45,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  editButton: { backgroundColor: "#6366F1" },
  saveButton: { backgroundColor: "#22C55E" },
  cancelButton: { backgroundColor: "#6B7280" },
  deleteButton: { backgroundColor: "#EF4444" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default BuyerProfile;
