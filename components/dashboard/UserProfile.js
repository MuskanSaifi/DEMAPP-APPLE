import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
  Platform ,
  Share 
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Snackbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const UserProfile = () => {
  const { token, isLoading: authLoading, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: "",
    type: "info", // success | error | info
  });

  const navigation = useNavigation();
  const isMounted = useRef(true);
const APP_PACKAGE_ID = "com.nazim_saifi.dialexportmart";
const IOS_APP_STORE_ID = "<your_app_id>"; 

const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.nazim_saifi.dialexportmart";
const IOS_APP_URL = "https://apps.apple.com/us/app/dialexportmart/id<your_app_id>";

useEffect(() => {
    isMounted.current = true;
    if (token) {
      fetchUser();
    } else {
      setLoading(false); // don’t fetch if no token
    }
    return () => {
      isMounted.current = false;
    };
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://www.dialexportmart.com/api/userprofile/profile/userprofile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (isMounted.current) {
        setFormData(res.data.user);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error(
          "Error fetching user data:",
          err.response?.data || err.message
        );
        setSnackbar({
          visible: true,
          message: "Could not load user profile.",
          type: "error",
        });
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImagePick = async () => {
    setPickingImage(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setSnackbar({
          visible: true,
          message: "Permission required: Please grant media access.",
          type: "error",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData((prev) => ({ ...prev, icon: base64Image }));
      }
    } catch (error) {
      setSnackbar({
        visible: true,
        message: "Something went wrong while picking the image.",
        type: "error",
      });
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
      setFormData(res.data.user);
      setSnackbar({
        visible: true,
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error(
        "Error saving user data:",
        error.response?.data || error.message
      );
      setSnackbar({
        visible: true,
        message: error.response?.data?.message || "An error occurred.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => performDeleteAccount(),
        },
      ],
      { cancelable: true }
    );
  };

  const performDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await axios.delete(
        "https://www.dialexportmart.com/api/userprofile/delete",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSnackbar({
        visible: true,
        message: res.data.message || "Account deleted successfully",
        type: "success",
      });

      await logout();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      console.error("Delete account error:", err.response?.data || err.message);
      setSnackbar({
        visible: true,
        message: err.response?.data?.message || "Failed to delete account",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" animating color="#1D4ED8" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  const fields = [
    { label: "Email", key: "email", keyboardType: "email-address" },
    {
      label: "Alternate Email",
      key: "alternateEmail",
      keyboardType: "email-address",
    },
    { label: "Mobile Number", key: "mobileNumber", keyboardType: "phone-pad" },
    {
      label: "Alternate Mobile",
      key: "alternateMobileNumber",
      keyboardType: "phone-pad",
    },
    { label: "WhatsApp Number", key: "whatsappNumber", keyboardType: "phone-pad" },
    { label: "Company Name", key: "companyName", keyboardType: "default" },
  ];

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={handleImagePick}
            disabled={saving || pickingImage}
          >
            <View style={styles.avatar}>
              {pickingImage ? (
                <ActivityIndicator size="small" animating color="#2563EB" />
              ) : formData.icon ? (
                <Image source={{ uri: formData.icon }} style={styles.profileImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {formData.fullname?.charAt(0).toUpperCase() || "U"}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{formData.fullname}</Text>
          <Text style={styles.company}>{formData.companyName}</Text>
{formData.userProfileSlug ? (
  <TouchableOpacity
    onPress={() =>
      Linking.openURL(`https://dialexportmart.com/company/${formData.userProfileSlug}`)
    }
    style={styles.linkButton}
  >
    <Text style={styles.linkText}>
      {`dialexportmart.com/company/${formData.userProfileSlug}`}
    </Text>
  </TouchableOpacity>
) : (
  <Text style={styles.incompleteText}>
    Complete profile to generate your website
  </Text>
)}
          {/* Settings Icon */}
          <TouchableOpacity
            style={styles.settingsIcon}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsBox}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          {fields.map(({ label, key, keyboardType }) => (
            <View key={key} style={styles.formGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                value={formData[key] || ""}
                onChangeText={(text) => handleChange(key, text)}
                style={styles.input}
                keyboardType={keyboardType}
                autoCapitalize={key.includes("Email") ? "none" : "words"}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#2563EB" }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" animating />
            ) : (
              <Text style={styles.buttonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

{/* Settings Modal */}
<Modal
  visible={settingsVisible}
  animationType="slide"
  transparent
  onRequestClose={() => setSettingsVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Support & Setting</Text>

      {/* ==== Support & Help ==== */}
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Linking.openURL("mailto:support@dialexportmart.com")}
      >
        <Ionicons name="mail-outline" size={20} color="#2563EB" />
        <Text style={styles.settingText}>Contact Support (Email)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Alert.alert("Help Center", "FAQs & Help coming soon!")}
      >
        <Ionicons name="help-circle-outline" size={20} color="#F59E0B" />
        <Text style={styles.settingText}>Help Center / FAQs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Alert.alert("Feedback", "Feature coming soon!")}
      >
        <Ionicons name="chatbox-ellipses-outline" size={20} color="#7C3AED" />
        <Text style={styles.settingText}>Report a Problem / Feedback</Text>
      </TouchableOpacity>

      {/* ==== App Info ==== */}
<TouchableOpacity
  style={styles.settingItem}
  onPress={() => {
    // Determine the correct URL based on the platform
    const appUrl = Platform.OS === 'ios' ? IOS_APP_URL : ANDROID_APP_URL;

    // Define the content to be shared
    const shareContent = {
      message: `Check out Dial Export Mart, India's B2B marketplace! Download it here: ${appUrl}`,
      url: appUrl,
      title: 'Dial Export Mart',
    };

    // Use the native Share API to open the sharing dialog
    Share.share(shareContent)
      .then(result => {
        if (result.action === Share.sharedAction) {
          console.log('App shared successfully');
        } else if (result.action === Share.dismissedAction) {
          console.log('Share dismissed');
        }
      })
      .catch(error => {
        console.error('Sharing failed:', error);
        Alert.alert("Error", "Could not share the app. Please try again later.");
      });
  }}
>
  <Ionicons name="share-social-outline" size={20} color="#10B981" />
  <Text style={styles.settingText}>Share App</Text>
</TouchableOpacity>


<TouchableOpacity
  style={styles.settingItem}
  onPress={() => {
    let url = '';
    if (Platform.OS === 'android') {
      // Directs to the Google Play Store review section.
      url = `market://details?id=${APP_PACKAGE_ID}&showAllReviews=true`;
    } else if (Platform.OS === 'ios') {
      // Directs to the Apple App Store review section.
      url = `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
    }

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error('Failed to open app store link:', err);
        // Alert the user if the app store link fails to open
        Alert.alert("Error", "Could not open the app store. Please try again later.");
      });
    }
  }}
>
  <Ionicons name="star-outline" size={20} color="#FACC15" />
  <Text style={styles.settingText}>Rate Us</Text>
</TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Linking.openURL("https://dialexportmart.com/privacy-policy")}
      >
        <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
        <Text style={styles.settingText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Linking.openURL("https://dialexportmart.com/terms")}
      >
        <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
        <Text style={styles.settingText}>Terms of Use</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Linking.openURL("https://dialexportmart.com/refund-policy")}
      >
        <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
        <Text style={styles.settingText}>Refund Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => Alert.alert("About App", "Dial Export Mart v1.0\nIndia’s B2B Marketplace")}
      >
        <Ionicons name="information-circle-outline" size={20} color="#06B6D4" />
        <Text style={styles.settingText}>About App</Text>
      </TouchableOpacity>

      {/* ==== Delete Account ==== */}
 <TouchableOpacity
  style={styles.settingItem}
  onPress={handleDeleteAccount}
  disabled={deleting}
>
  {deleting ? (
    <ActivityIndicator />
  ) : (
    <>
      <Ionicons name="trash-outline" size={20} color="#DC2626" />
      <Text style={[styles.settingText, { color: "#DC2626" }]}>
        Delete Account
      </Text>
    </>
  )}
</TouchableOpacity>


      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#6B7280", marginTop: 12 }]}
        onPress={() => setSettingsVisible(false)}
      >
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


<Snackbar
  visible={snackbar.visible}
  onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
  duration={3000}
  wrapperStyle={{ top: 50 }}
  style={{
    backgroundColor:
      snackbar.type === "success"
        ? "#4CAF50"
        : snackbar.type === "error"
        ? "#DC2626"
        : "#2563EB",
  }}
>
  <Text style={{ color: "#fff" }}>{snackbar.message || ""}</Text>
</Snackbar>


    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingHorizontal: 16, paddingTop: 20 },
  card: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, alignItems: "center", marginBottom: 24, elevation: 4, position: "relative" },
  avatar: { backgroundColor: "#E0F2FE", borderRadius: 999, width: 72, height: 72, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  profileImage: { width: "100%", height: "100%", borderRadius: 999 },
    linkButton: { 
    backgroundColor: "#DBEAFE", // same as bg-blue-100
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop:10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: "flex-center",
  },
  linkText: {
    color: "#1D4ED8", // text-blue-700
    fontSize: 11,
    fontWeight: "500",
    textAlign:"center",
  },
  incompleteText: {
    fontSize: 13,
    color: "gray",
    marginTop: 4,
  },
  settingItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#E5E7EB",
  width: "100%",
},
settingText: {
  fontSize: 15,
  marginLeft: 12,
  color: "#374151",
  fontWeight: "500",
},

  avatarText: { color: "#0C4A6E", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "bold", marginTop: 12, color: "#0F172A" },
  company: { fontSize: 14, color: "#64748B", marginTop: 4 },
  settingsIcon: { position: "absolute", top: 10, right: 10, padding: 6 },
  detailsBox: { backgroundColor: "#FFFFFF", padding: 20, borderRadius: 16, elevation: 2, marginBottom: 120 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#1E40AF" },
  formGroup: { marginBottom: 15 },
  label: { fontWeight: "600", marginBottom: 6, fontSize: 14, color: "#333" },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: "#1E293B" },
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", elevation: 3 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20, color: "#1E40AF" },
});

export default UserProfile;
