import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import * as ImagePicker from 'expo-image-picker';

const UserProfile = () => {
  const { token, isLoading: authLoading } = useContext(AuthContext);
  const [userDetail, setUserDetail] = useState(null);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [token]);

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        "https://www.dialexportmart.com/api/userprofile/profile/userprofile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserDetail(res.data.user);
      setFormData(res.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImagePick = async () => {
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant media library access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.1, // lower quality for smaller image size
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        const selectedAsset = result.assets[0];
        const base64Image = `data:image/webp;base64,${selectedAsset.base64}`;
        console.log("Base64 image size (MB):", (base64Image.length / (1024 * 1024)).toFixed(2), "MB");

        setFormData((prev) => ({
          ...prev,
          icon: base64Image,
        }));
      } else {
        console.log("Image pick canceled.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong while picking the image.");
      console.error(error);
    } finally {
      setPickingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.patch(
        "https://www.dialexportmart.com/api/userprofile/profile/userprofile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUserDetail(res.data.user);
      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user data:", error.response?.data || error.message);
      Alert.alert("Save Failed", error.response?.data?.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Loading profile...</Text>
      </View>
    );
  }

  if (!userDetail) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", fontSize: 16 }}>User profile data could not be loaded.</Text>
      </View>
    );
  }

  const fields = [
    { label: "Email", key: "email" },
    { label: "Alternate Email", key: "alternateEmail" },
    { label: "Mobile Number", key: "mobileNumber" },
    { label: "Alternate Mobile", key: "alternateMobileNumber" },
    { label: "WhatsApp Number", key: "whatsappNumber" },
    { label: "Company Name", key: "companyName" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={editMode ? handleImagePick : null} disabled={!editMode}>
          <View style={styles.avatar}>
            {pickingImage ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : formData.icon ? (
              <Image source={{ uri: formData.icon }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarText}>
                {userDetail.fullname?.charAt(0).toUpperCase() || "U"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{userDetail.fullname}</Text>
        <Text style={styles.company}>{userDetail.companyName}</Text>
      </View>

      <View style={styles.detailsBox}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        {fields.map(({ label, key }) => (
          <View key={key} style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            {editMode ? (
              <TextInput
                value={formData[key] || ""}
                onChangeText={(text) => handleChange(key, text)}
                style={styles.input}
                keyboardType={key.includes("Email") ? "email-address" : key.includes("Number") ? "numeric" : "default"}
                autoCapitalize={key.includes("Email") ? "none" : "words"}
              />
            ) : (
              <Text style={styles.value}>{userDetail[key] || "N/A"}</Text>
            )}
          </View>
        ))}

        <View style={styles.buttonRow}>
          {editMode ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={() => {
                  setEditMode(false);
                  setFormData(userDetail);
                }}
                disabled={saving}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.save]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.save]}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  avatar: {
    backgroundColor: "#E0F2FE",
    borderRadius: 999,
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarText: {
    color: "#0C4A6E",
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    color: "#0F172A",
  },
  company: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  detailsBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#1E40AF",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1E293B",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
  cancel: {
    backgroundColor: "#9CA3AF",
  },
  save: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
});

export default UserProfile;
