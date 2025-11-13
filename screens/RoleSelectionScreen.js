import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const RoleSelectionScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Introduction/Title Section */}
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Select your dashboard access to continue.</Text>

      {/* Buyer Card Button */}
      <TouchableOpacity
        style={styles.roleCard}
        onPress={() => navigation.navigate("BuyerDashboardScreen")}
        activeOpacity={0.8}
      >
        <Image
          source={require("../assets/buyercard.png")}  // 👈 your image file (icon+text)
          style={styles.cardImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Seller Card Button */}
      <TouchableOpacity
        style={[styles.roleCard, styles.sellerCard]}
        onPress={() => navigation.navigate("DashboardScreen")}
        activeOpacity={0.8}
      >
        <Image
          source={require("../assets/sellercard.png")}  // 👈 your image file (icon+text)
          style={styles.cardImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 60,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginVertical: 12,
    width: width * 0.9,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sellerCard: {
    backgroundColor: "#f9fff9",
  },
  cardImage: {
    width: "100%",
    height: 200, // adjust as per your image
    borderRadius: 10,
  },
});
