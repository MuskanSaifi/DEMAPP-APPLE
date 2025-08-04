import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
  FlatList,
  StatusBar,
  Alert,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBarWithSuggestions from '../components/SearchBar';
import Buyfrom from "../components/BuyForm";
import BottomTabs from '../components/BottomTabs';
import Sidebar from "../components/Sidebar";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import { addProductToWishlist, removeProductFromWishlist, fetchUserWishlist } from '../redux/wishlistSlice';

const { width } = Dimensions.get("window");

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Subcategory Slider Component
const SubcategorySlider = ({ subcategories, onItemPress }) => {
  if (!subcategories || subcategories.length === 0) {
    return (
      <View style={styles.noSubcategoriesContainer}>
        <Text style={styles.noSubcategoriesText}>No subcategories available.</Text>
      </View>
    );
  }

  const renderSubcategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subcategoryItem}
      onPress={() => onItemPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.icon || 'https://via.placeholder.com/80/E0E0E0/000000?text=Subcat' }}
        style={styles.subcategoryImage}
        resizeMode="cover"
      />
      <Text style={styles.subcategoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.subcategorySliderContainer}>
      <Text style={styles.subcategorySliderTitle}>Browse Subcategories</Text>
      <FlatList
        horizontal
        data={subcategories}
        keyExtractor={(item) => item._id || item.name}
        renderItem={renderSubcategoryItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subcategoryListContent}
      />
    </View>
  );
};

const ProductsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productslug } = route.params || {};

  // Redux hooks
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistLoading = useSelector((state) => state.wishlist.loading);

  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State and ref for sidebar
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-width * 0.8)).current;

  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -width * 0.8 : 0;
    Animated.timing(sidebarX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(!sidebarVisible);
    });
  };

  useEffect(() => {
    // Fetch wishlist and product data
    dispatch(fetchUserWishlist());

    if (!productslug) {
      setLoading(false);
      setError("Product slug is missing.");
      return;
    }

    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      try {
        const encodedSlug = encodeURIComponent(productslug);
        const response = await fetch(`https://www.dialexportmart.com/api/manufacturers/${encodedSlug}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch product data: ${response.status}`);
        }
        const data = await response.json();

        setProducts(data.products || []);
        setSubcategories(data.subcategories || []);
        setBusinessProfile(data.businessProfile || null);
        setRelatedProducts(data.relatedProducts || []);

      } catch (err) {
        console.error("Error fetching product:", err?.message || err);
        setError("Could not load product details.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productslug, dispatch]);

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F6F9FF');
    }
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleSubcategoryPress = (subcategory) => {
    navigation.navigate("SellerProductsScreen", {
      categorySlug: subcategory?.category?.categoryslug,
      subcategorySlug: subcategory?.subcategoryslug,
    });
  };

  const handleRelatedProductPress = (product) => {
    navigation.push("ProductsScreen", { productslug: product.productslug });
  };
  
  // This is the core function for toggling wishlist status
  const toggleWishlist = (product) => {
    // Check if the product is already in the wishlist using the product's _id
    const isWishlisted = wishlistItems.some(item => item._id === product._id);
    
    if (isWishlisted) {
      // If it's wishlisted, remove it
      dispatch(removeProductFromWishlist(product._id));
    } else {
      // If it's not, add it.
      dispatch(addProductToWishlist(product));
    }
  };

  const renderRelatedProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedProductItem}
      onPress={() => handleRelatedProductPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: item.images?.[0]?.url || item.images?.[0] || 'https://via.placeholder.com/80/E0E0E0/000000?text=Related',
        }}
        style={styles.relatedProductImage}
        resizeMode="contain"
      />
      <Text style={styles.relatedProductName} numberOfLines={2}>
        {item.name || 'No name available'}
      </Text>
    </TouchableOpacity>
  );

  const handleContactSeller = () => {
    Alert.alert("Contact Seller", "This would initiate contact with the seller, e.g., via call, email, or an inquiry form.");
  };

  const renderProductItem = ({ item: product }) => {
    // Correctly check if the product is in the wishlist
    const isWishlisted = wishlistItems.some(item => item._id === product._id);
    
    // Fallback for image URI to handle different API response formats
    const imageUri = product?.images?.[0]?.url || product?.images?.[0] || "https://via.placeholder.com/300/F0F0F0/000000?text=Product+Image";
    console.log('Rendering product:', product.name, 'with image URI:', imageUri);

    return (
      <View style={styles.productInfoCard}>
        <View style={styles.imageCard}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("ProductDetail", {
                productId: product._id,
                productslug: product.productslug,
              });
            }}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.productImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() => toggleWishlist(product)}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={24}
              color={isWishlisted ? "#FF6347" : "#888"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("ProductDetail", {
              productId: product._id,
              productslug: product.productslug,
            });
          }}
        >
          <Text style={styles.productTitle}>{product.name}</Text>
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Price:</Text>
          <Text style={styles.infoValue}>
            ₹{product.price} {product.currency || "INR"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>MOQ:</Text>
          <Text style={styles.infoValue}>
            {product.minimumOrderQuantity || "N/A"} {product.moqUnit || "Number"}
          </Text>
        </View>

        {product.description && (
          <Text style={styles.productDescription}>
            {product.description.length > 120
              ? `${product.description.slice(0, 260)}...`
              : product.description}
          </Text>
        )}

        {businessProfile && (
          <View style={styles.businessProfileSection}>
            <View style={styles.companyRow}>
              <Ionicons name="business-outline" size={16} color="#007bff" style={styles.iconStyle} />
              <Text style={styles.companyNameText}>{businessProfile.companyName}</Text>
            </View>

            <View style={styles.badgesWrapper}>
              {businessProfile.yearOfEstablishment && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🏢 Est. {businessProfile.yearOfEstablishment}</Text>
                </View>
              )}
              {product?.tradeShopping?.gst && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>✅ GST: {product.tradeShopping.gst}%</Text>
                </View>
              )}
              <View style={[styles.badge, product.tradeShopping.isReturnable ? styles.returnableYes : styles.returnableNo]}>
                <Text style={styles.badgeText}>
                  🔁 Returnable: {product.tradeShopping.isReturnable ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.contactSellerButton} onPress={handleContactSeller}>
            <Buyfrom product={product} sellerId={product?.userId} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading || wishlistLoading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
        <View style={styles.searchBarWrapper}>
          <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
        </View>
        <View style={[styles.centeredContainer, { paddingTop: 50 }]}>
          <ActivityIndicator size="large" color="#6D4AAE" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
        <View style={styles.bottomTabsContainer}>
          <BottomTabs />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
        <View style={styles.searchBarWrapper}>
          <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
        </View>
        <View style={[styles.centeredContainer, { paddingTop: 50 }]}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF6347" style={{ marginBottom: 10 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <View style={styles.bottomTabsContainer}>
          <BottomTabs />
        </View>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
        <View style={styles.searchBarWrapper}>
          <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
        </View>
        <View style={[styles.centeredContainer, { paddingTop: 50 }]}>
          <Ionicons name="information-circle-outline" size={50} color="#888" style={{ marginBottom: 10 }} />
          <Text style={styles.errorText}>No products found for this slug.</Text>
        </View>
        <View style={styles.bottomTabsContainer}>
          <BottomTabs />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <Sidebar
          activeScreen={null}
          setActiveScreen={() => {}}
          toggleSidebar={toggleSidebar}
          navigation={navigation}
        />
      </Animated.View>
      
      {sidebarVisible && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={toggleSidebar} />
      )}
      
      <View style={styles.searchBarWrapper}>
        <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProductItem}
        ListHeaderComponent={() => (
          <>
            <SubcategorySlider
              subcategories={subcategories}
              onItemPress={handleSubcategoryPress}
            />
          </>
        )}
        ListFooterComponent={() => (
          <View>
            {relatedProducts && relatedProducts.length > 0 && (
              <View style={styles.relatedProductsSection}>
                <Text style={styles.relatedProductsTitle}>Related Products</Text>
                <FlatList
                  horizontal
                  data={relatedProducts}
                  keyExtractor={(item, index) => `${item._id || item.productslug || 'related'}-${index}`}
                  renderItem={renderRelatedProductItem}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedProductsListContent}
                />
              </View>
            )}
            {(!relatedProducts || relatedProducts.length === 0) && (
              <View style={styles.noRelatedProductsContainer}>
                <Text style={styles.noRelatedProductsText}>No related products available.</Text>
              </View>
            )}
            <View style={{ height: 70 }} />
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
      />
      <View style={styles.bottomTabsContainer}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingVertical: 0,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
   sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
height: Dimensions.get('window').height + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    zIndex: 999,
    elevation: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 5,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: width * 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
businessProfileSection: {
  marginVertical: 10,
  padding: 12,
  backgroundColor: "#fff",
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
},

companyRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6,
},

companyNameText: {
  fontSize: 11,
  fontWeight: "600",
  color: "#333",
  marginLeft: 6,
},

badgesWrapper: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 3,
},

badge: {
  backgroundColor: "#e9f5ff",
  paddingVertical: 5,
  paddingHorizontal: 5,
  borderRadius: 20,
  marginRight: 6,
  marginBottom: 2,
},

returnableYes: {
  backgroundColor: "#e6f4ea",
},

returnableNo: {
  backgroundColor: "#ffe5e5",
},

badgeText: {
  fontSize: 10,
  fontWeight: "600",
  color: "#333",
},

productInfoCard: {
 width: '95%', // Takes full width of the FlatList container
 marginVertical: 8, // Adds vertical space between cards
 marginHorizontal: 8,
 backgroundColor: '#fff',
 borderRadius: 10,
 padding: 10, // Increased padding for better spacing inside the card
 shadowColor: '#000',
 shadowOpacity: 0.1,
 shadowOffset: { width: 0, height: 1 },
 shadowRadius: 3,
 },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6D4AAE",
  },
  errorText: {
    fontSize: 18,
    color: "#FF6347",
    textAlign: "center",
    marginHorizontal: 20,
  },
  // Subcategory Slider Styles
  subcategorySliderContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 70,
  },
  subcategorySliderTitle: {
  fontWeight: 'bold',
  fontSize: 14,
  marginTop: 5,
  marginBottom: 8,
  color: '#333',
  },
  subcategoryListContent: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  subcategoryItem: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 60,
  },
  subcategoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subcategoryName: {
    fontSize: 10,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
  },
  noSubcategoriesContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  noSubcategoriesText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  // Existing Styles (adapted for FlatList structure)
  productImage: {
    width: '100%', // Make image take full width of its container
    height: 150, // Fixed height for consistency
    borderRadius: 8,
    resizeMode: 'contain',
  },
  imageCard: {
    width: '100%', // Ensure image card takes full width
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    padding: 5, // Reduced padding
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10, // Reduced margin
  },
  productTitle: {
    fontSize: 13, // Adjusted font size for grid
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8, // Reduced margin
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3, // Reduced margin
  },
  infoLabel: {
    fontSize: 11, // Adjusted font size
    fontWeight: "500",
    color: "#555",
  },
  infoValue: {
    fontSize: 11, // Adjusted font size
    color: "#333",
  },
  productDescription: {
    fontSize: 10, // Adjusted font size
    color: "#666",
    lineHeight: 13,
    marginTop: 6,
  },
  businessProfileSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10, // Reduced padding
    marginTop: 10, // Reduced margin
  },
  businessProfileTextBold: {
    fontSize: 12, // Adjusted font size
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 1,
  },
  businessProfileText: {
    fontSize: 12, // Adjusted font size
    color: '#666',
    marginBottom: 3,
  },
  tradeShoppingSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tradeShoppingText: {
    fontSize: 11, // Adjusted font size
    color: '#666',
    marginBottom: 2,
  },
  tradeShoppingTextBold: {
    fontWeight: 'bold',
    color: '#444',
  },
actionButtonsContainer: {
  flexDirection: "column", // 🔁 Change from "row" to "column"
  gap: 10, // Add vertical spacing between buttons
  marginTop: 15,
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#eee',
},

moreDetailsButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#007bff",
  paddingVertical: 11,
  paddingHorizontal: 1,
  borderRadius: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.15,
  shadowRadius: 2,
  elevation: 3,
},

contactSellerButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 20,
  paddingVertical: 1,
  paddingHorizontal: 1,
},
  moreDetailsButtonText: {
    color: "#fff",
    fontWeight: '600',
    fontSize: 13, // Adjusted font size
  },
  iconStyle: {
    marginRight: 5, // Reduced margin
    fontSize: 16, // Adjusted icon size
  },
  relatedProductsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom:40,
    borderRadius: 12,
  },
  relatedProductsTitle: {
    fontWeight: 'bold',
  fontSize: 14,
  marginTop: 15,
  marginBottom: 8,
  color: '#333',
  },
  relatedProductsListContent: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  relatedProductItem: {
   alignItems: "center",
    marginHorizontal: 8,
    width: 60,
  },
  relatedProductImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  relatedProductName: {
  fontSize: 10,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
  },
  noRelatedProductsContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  noRelatedProductsText: {
    fontSize: 14,
    color: "#888",
  },
 bottomTabsContainer: {
    position: 'absolute', // Use 'absolute' for fixed positioning
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, // Consistent height
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },

});

export default ProductsScreen;