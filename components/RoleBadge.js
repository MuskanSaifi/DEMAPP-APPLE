import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const RoleBadge = () => {
  const user = useSelector((state) => state.user.user);
  const buyer = useSelector((state) => state.buyer.buyer);

  // 🔹 Return null if no one is logged in
  if (!user && !buyer) return null;

  // 🔹 Determine role and name
  const role = buyer ? "Buyer" : "Seller";
  const name =
    buyer?.fullname ||
    user?.fullname ||
    user?.name ||
    user?.username ||
    "Unknown";

  return (
    <View
      style={[
        styles.badgeContainer,
        role === "Buyer" ? styles.buyerBadge : styles.userBadge,
      ]}
    >
      <Text style={styles.badgeText}>
        🧑‍💼 {role}: {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  userBadge: {
    backgroundColor: "#007bff", // 🔵 Blue for user
  },
  buyerBadge: {
    backgroundColor: "#28a745", // 🟢 Green for buyer
  },
});

export default RoleBadge;
