import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // adjust path if needed

const BankDetails = () => {
  const { token } = useContext(AuthContext); // ✅ get token from context
  const [formData, setFormData] = useState({
    accountType: "",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    mobileLinked: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get(`https://www.dialexportmart.com/api/userprofile/profile/bankdetails`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.data) {
          setFormData(response.data.data);
        } else {
          console.error("Error fetching bank details:", response.data.message);
        }
      } catch (error) {
        console.error("Error:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, [token]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!token) return Alert.alert("Error", "User not authenticated");

      const response = await axios.patch(`https://www.dialexportmart.com/api/userprofile/profile/bankdetails`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Bank details updated successfully!");
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error("Update error:", error.response?.data?.message || error.message);
      Alert.alert("Error", "Failed to update bank details.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.title}>
        Bank <Text style={{ color: "#007bff" }}>Details</Text>
      </Text> */}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Type</Text>
            <TextInput
              placeholder="Saving / Current"
              style={styles.input}
              value={formData.accountType}
              onChangeText={(val) => handleChange("accountType", val)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              placeholder="Enter full name"
              style={styles.input}
              value={formData.accountHolderName}
              onChangeText={(val) => handleChange("accountHolderName", val)}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              placeholder="Enter account number"
              style={styles.input}
              value={formData.accountNumber}
              onChangeText={(val) => handleChange("accountNumber", val)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Account Number</Text>
            <TextInput
              placeholder="Re-enter account number"
              style={styles.input}
              value={formData.confirmAccountNumber}
              onChangeText={(val) => handleChange("confirmAccountNumber", val)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              placeholder="e.g. SBIN0001234"
              style={styles.input}
              value={formData.ifscCode}
              autoCapitalize="characters"
              onChangeText={(val) => handleChange("ifscCode", val.toUpperCase())}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Linked to Account</Text>
            <TextInput
              placeholder="Enter mobile number"
              style={styles.input}
              value={formData.mobileLinked}
              onChangeText={(val) => handleChange("mobileLinked", val)}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Update Bank Details</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 14,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  button: {
   backgroundColor: '#4CAF50', // Green color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // for Android shadow
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default BankDetails;
