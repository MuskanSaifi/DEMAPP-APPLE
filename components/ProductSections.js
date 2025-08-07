import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const ITEMS_PER_PAGE = 4;
const CARD_WIDTH = width / ITEMS_PER_PAGE - 20;

const ProductSections = ({ tag, Name }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://www.dialexportmart.com/api/adminprofile/seller");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to fetch products");
        const filtered = data.filter((item) => item?.tags?.[tag]);
        setProducts(filtered);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [tag]);

  useEffect(() => {
    if (!products.length) return;

    let currentIndex = 0;
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex >= totalPages) currentIndex = 0;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: currentIndex * width,
          animated: true,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

  const renderProduct = (product) => (
    <TouchableOpacity
      key={product._id}
      onPress={() =>
        navigation.navigate("ProductsScreen", {
          productslug: product.productslug,
        })
      }
      style={styles.card}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={
            product?.images?.[0]?.url
              ? { uri: product.images[0].url }
              : require("../assets/adaptive_icon_foreground.png")
          }
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name?.replace(/\b\w/g, (c) => c.toUpperCase())}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{Name}</Text>
        <TouchableOpacity>
          {/* <Text style={styles.viewAllText}>View All</Text> */}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#1976D2" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : products.length === 0 ? (
        <Text style={styles.noProductsText}>No products found.</Text>
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollRef}
          style={{ paddingVertical: 10 }}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        >
          {products.map(renderProduct)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 1,
  },
  heading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  noProductsText: {
    textAlign: "center",
    color: "#777",
    marginTop: 10,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    paddingVertical: 7,
    paddingHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    width: CARD_WIDTH * 0.94,
    height: CARD_WIDTH * 0.94,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  productName: {
    fontSize: 10,
    color: "#333",
    textAlign: "center",
    marginTop: 5,
    fontWeight: "500",
  },
});

export default ProductSections;
