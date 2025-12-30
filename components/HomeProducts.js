import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const DEFAULT_IMAGE =
  "https://via.placeholder.com/150?text=No+Image";

const HomeProducts = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://dialexportmart.com/api/home/appapi/homeproducts");
      const data = await res.json();

      // SAFE DATA HANDLING
      setCategories(data?.categories || data || []);
    } catch (error) {
      console.log("Category fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImage = (uri) => {
    if (!uri || uri.trim() === "") {
      return DEFAULT_IMAGE;
    }
    return uri;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D4AAE" />
      </View>
    );
  }

  if (!categories.length) {
    return (
      <Text style={{ textAlign: "center", marginVertical: 30 }}>
        No categories found
      </Text>
    );
  }

  return (
    <FlatList
      data={categories.slice(0, 6)}
      keyExtractor={(item) => item._id}
      nestedScrollEnabled
      contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 10 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.dot} />
              <Image
                source={{ uri: getImage(item.icon) }}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryTitle}>{item.name}</Text>
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate("CategoryScreen", {
                    category: item,
                    
                })
              }
            >
              <Text style={styles.viewAll}>View All →</Text>
            </Pressable>
          </View>

          {/* PRODUCTS */}
          <FlatList
  data={item.subcategories?.slice(0, 6)}
  horizontal
  showsHorizontalScrollIndicator={false}
  keyExtractor={(sub) => sub._id}
  renderItem={({ item: sub }) => (
    <Pressable
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("SubcategoryScreen", {
          subcategory: sub,
          allSubcategories: item.subcategories,
        })
      }
      
    >
      <Image
        source={{ uri: getImage(sub.icon) }}
        style={styles.productImage}
      />
      <Text numberOfLines={2} style={styles.productName}>
        {sub.name}
      </Text>
    </Pressable>
  )}
/>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
    center: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 40,
    },
  
    card: {
      backgroundColor: "#fff",
      borderRadius: 18,
      padding: 14,
      marginBottom: 1,
    },
  
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
  
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  
    dot: {
      width: 6,
      height: 24,
      backgroundColor: "#6D4AAE",
      borderRadius: 10,
      marginRight: 8,
    },
  
    categoryTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#333",
    },
  
    viewAll: {
      color: "#6D4AAE",
      fontWeight: "500",
    },
  
    categoryImage: {
      width: 25,
      height: 25,
      resizeMode: "contain",
      marginRight: 12,
    },
  
    productCard: {
      width: 80,
      marginRight: 10,
      backgroundColor: "#F9F9F9",
      borderRadius: 7,
      padding: 8,
      alignItems: "center",
    },
  
    productImage: {
      width: 55,
      height: 55,
      resizeMode: "contain",
      marginBottom: 6,
    },
  
    productName: {
      fontSize: 11,
      textAlign: "center",
      fontWeight: "500",
      color: "#333",
    },
  });
  

export default HomeProducts;
