import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const BuySell = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/company_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome text */}
      <Text style={styles.welcome}>Welcome</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Choose what you'd like to do below:</Text>

      {/* White card box */}
      <View style={styles.card}>
        {/* I Want to Buy */}
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => navigation.navigate("BuyerLoginScreen")}
        >
          <Icon name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>I Want to Buy</Text>
        </TouchableOpacity>

        {/* I Want to Sell */}
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => navigation.navigate("Login")}
        >
          <Icon name="storefront-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>I Want to Sell</Text>
        </TouchableOpacity>

        {/* Footer note */}
        <Text style={styles.note}>
          You'll be redirected to the respective login page.
        </Text>

      </View>
        {/* 🔗 Browse Products link */}
      <TouchableOpacity
  onPress={() => navigation.navigate("Home")}
  style={styles.browseLinkContainer}
>
  <View style={styles.browseRow}>
    <Icon name="arrow-back-outline" size={18} color="#2563EB" />
    <Text style={styles.browseLink}>Go back for Browse Products</Text>
  </View>
</TouchableOpacity>
    </View>
  );
};

export default BuySell;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  logo: {
    width: 100,
    height: 60,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  subtitle: {
    color: "#444",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 8,
  },
  buyButton: {
    backgroundColor: "#16A34A", // Tailwind green-600
  },
  sellButton: {
    backgroundColor: "#9333EA", // Tailwind purple-600
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
  },
 browseLinkContainer: {
  marginTop: 20,
  alignItems: "center",
},
browseRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
},
browseLink: {
  color: "#2563EB", // Tailwind blue-600
  fontSize: 14,
  fontWeight: "500",
  textDecorationLine: "underline",
},

});
