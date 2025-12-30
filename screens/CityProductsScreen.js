// screens/CityProductsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

const CityProductsScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();

  const { city, productslug } = params;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `https://dialexportmart.com/api/home/cities?city=${city}&productslug=${productslug}`
      );
      const data = await res.json();

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.log("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProductDetail", {
          productId: item._id,
        })
      }
    >
      <Image
        source={{ uri: item.images?.[0]?.url || "https://placehold.co/300" }}
        style={styles.image}
      />

      <Text numberOfLines={2} style={styles.title}>
        {item.name}
      </Text>

      <Text style={styles.price}>
        {item.price ? `₹${item.price}` : "Price on Request"}
      </Text>

      <Text style={styles.company}>
        {item.userId?.companyName || "Verified Supplier"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D4AAE" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Products in {city.charAt(0).toUpperCase() + city.slice(1)}
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    fontSize: 13,
    color: "#E53935",
    marginTop: 4,
    fontWeight: "600",
  },
  company: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});


export default CityProductsScreen;
