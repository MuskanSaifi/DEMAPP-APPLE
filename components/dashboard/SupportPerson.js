import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";

const SupportPerson = () => {
  const [supportPerson, setSupportPerson] = useState(undefined);
  const [error, setError] = useState("");
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchSupportPerson = async () => {
      try {
        if (!token) return;
        const response = await axios.get(
          "https://www.dialexportmart.com/api/userprofile/profile/supportperson",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSupportPerson(response.data.supportperson);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch support person");
        setSupportPerson(null);
      }
    };

    fetchSupportPerson();
  }, [token]);

  if (error) {
    return <Text style={styles.errorText}>❌ Error: {error}</Text>;
  }

  if (supportPerson === undefined) {
    return <ActivityIndicator size="large" color="#007bff" style={styles.loader} />;
  }

  if (supportPerson === null) {
    return <Text style={styles.noSupport}>No Support Person Assigned Yet 🙁</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Icon instead of image */}
        <View style={styles.iconContainer}>
          <Icon name="support-agent" size={100} color="#1a73e8" />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.title}>Support Person Info</Text>
          <Text style={styles.description}>
            Our support team is here to help you succeed. Whether it’s about memberships, upgrades,
            or payment concerns — share your issue, and we’ll take care of it swiftly.
          </Text>

          <View style={styles.detailBox}>
            <Text style={styles.detail}><Text style={styles.label}>👤 Name:</Text> {supportPerson.name}</Text>
            <Text style={styles.detail}><Text style={styles.label}>📧 Email:</Text> {supportPerson.email}</Text>
            <Text style={styles.detail}><Text style={styles.label}>📞 Contact No:</Text> {supportPerson.number}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F3F6FF",
    flexGrow: 1,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    width: "100%",
    paddingBottom: 20,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#E8F0FE",
  },
  infoBox: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
  },
  detailBox: {
    backgroundColor: "#f0f4ff",
    borderRadius: 10,
    padding: 15,
  },
  detail: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  label: {
    fontWeight: "600",
    color: "#1a73e8",
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    marginTop: 50,
    color: "red",
    fontWeight: "600",
    textAlign: "center",
  },
  noSupport: {
    marginTop: 50,
    color: "#ff9900",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default SupportPerson;
