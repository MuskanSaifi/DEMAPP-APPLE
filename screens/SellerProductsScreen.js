// SellerProductsScreen.js
import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
  UIManager,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { addProductToWishlist, removeProductFromWishlist } from '../redux/wishlistSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBarWithSuggestions from '../components/SearchBar';
import Buyfrom from "../components/BuyForm"; 
import BottomTabs from '../components/BottomTabs';
import Sidebar from "../components/Sidebar";

const { width } = Dimensions.get("window");
const isDesktop = width > 768;

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const decodeSlugForComparison = (str) => decodeURIComponent(str || '').toLowerCase();
const formatSlugForDisplay = (str) => decodeSlugForComparison(str).replace(/-/g, ' ');

// --- New dedicated components for better readability ---
const SubcategoryList = ({ subcategories, loading, routeSubcategorySlug, handleSubcategoryNav }) => {
  if (subcategories.length === 0 && !loading) return null;

  const renderItem = ({ item, index }) => {
    const isActive = decodeSlugForComparison(item.subcategoryslug) === decodeSlugForComparison(routeSubcategorySlug);
    
    if (loading) {
      return <View style={styles.subcategoryItemSkeleton} />;
    }
    
    return (
      <TouchableOpacity
        style={[styles.subcategoryItem, isActive && styles.subcategoryItemActive]}
        onPress={() => handleSubcategoryNav(item)}
      >
          <Image
              source={{ uri: item.icon || 'https://via.placeholder.com/80/E0E0E0/000000?text=Subcat' }}
              style={[styles.subcategoryImage, isActive && styles.subcategoryImageActive]}
              resizeMode="cover"
            />
        <Text style={[styles.subcategoryName, isActive && styles.subcategoryItemTextActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.subcategoriesContainer}>
      <Text style={styles.subcategoriesTitle}>Subcategories</Text>
      <FlatList
        horizontal
        data={loading ? Array(5).fill({}) : subcategories}
        keyExtractor={(item, index) => item._id || `skeleton-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subcategoriesList}
        renderItem={renderItem}
      />
    </View>
  );
};

const ProductCard = React.memo(({ item, handleProductPress, handleWishlistToggle, isProductInWishlist, handleCompanyProfileNav }) => {
  const shouldDisplay = (value) => {
    if (value === null || typeof value === 'undefined') return false;
    if (typeof value === 'string' && (value.trim() === '' || value.trim().toLowerCase() === 'n/a')) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  };
  
  const productPrice = item.tradeShopping?.fixedSellingPrice || item.price;
  const productImageUrl = item.images?.[0]?.url || "https://via.placeholder.com/300/F0F0F0/000000?text=Product";
  
  const formattedDescription = item.description ? item.description.split(" ").slice(0, 15).join(" ") + (item.description.split(" ").length > 15 ? "..." : "") : '';

  return (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => handleProductPress(item)} style={styles.productImageWrapper}>
        <Image source={{ uri: productImageUrl }} style={styles.productImage} resizeMode="contain" />
        <TouchableOpacity style={styles.wishlistButton} onPress={() => handleWishlistToggle(item._id)}>
          <Ionicons name={isProductInWishlist ? 'heart' : 'heart-outline'} size={24} color={isProductInWishlist ? '#E74C3C' : '#333'} />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {shouldDisplay(item.description) && (
          <Text style={styles.productDescription} numberOfLines={2}>{formattedDescription}</Text>
        )}

        {item.businessProfile && shouldDisplay(item.businessProfile.companyName) && (
          <View style={styles.companyInfo}>
              <Text style={styles.companyNameText}>{item.businessProfile.companyName}</Text>
            <View style={styles.companyMetaRow}>
              {shouldDisplay(item.businessProfile.city) && (
                <View style={styles.companyMetaItem}>
                  <Ionicons name="location-sharp" size={14} color="#888" style={{ marginRight: 4 }} />
                  <Text style={styles.companyMetaText}>{item.businessProfile.city}</Text>
                </View>
              )}
              {shouldDisplay(item.businessProfile.gstNumber) && (
                <View style={styles.companyMetaItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#2ECC71" style={{ marginRight: 4 }} />
                  <Text style={styles.companyMetaTextSuccess}>GST</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.priceAndMOQ}>
          {shouldDisplay(productPrice) && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.priceValue}>₹{productPrice} {item.currency || "INR"}</Text>
            </View>
          )}
          {shouldDisplay(item.minimumOrderQuantity) && (
            <View style={styles.moqContainer}>
              <Text style={styles.moqLabel}>MOQ:</Text>
              <Text style={styles.moqValue}>{item.minimumOrderQuantity}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.bottomButtonsContainer}>
          <Buyfrom product={item} sellerId={item?.userId?._id} />
        </View>
      </View>
    </View>
  );
});

// Main Component
const SellerProductsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const isFocused = useIsFocused();

  const { categorySlug: routeCategorySlug, subcategorySlug: routeSubcategorySlug } = route.params || {};

  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategoryName, setCurrentCategoryName] = useState("");
  const [currentSubcategoryName, setCurrentSubcategoryName] = useState("");

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-width * 0.8)).current;

  // Handles the sidebar toggle logic
  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };
  
  // New useEffect to handle the animation based on sidebarVisible state
  useEffect(() => {
    const toValue = sidebarVisible ? 0 : -width * 0.8;
    Animated.timing(sidebarX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible]);

  // Close sidebar on screen blur
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // We no longer need to call toggleSidebar, just set the state to false
      if (sidebarVisible) {
        setSidebarVisible(false);
      }
    });
    return unsubscribe;
  }, [navigation, sidebarVisible]);

  useEffect(() => {
    const fetchData = async () => {
      if (!routeCategorySlug || !routeSubcategorySlug) {
        setLoading(false);
        setError("Category or subcategory slug is missing.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`https://www.dialexportmart.com/api/adminprofile/category`);
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.statusText}`);
        }
        const data = await res.json();

        const decodedRouteCategorySlug = decodeSlugForComparison(routeCategorySlug);
        const decodedRouteSubcategorySlug = decodeSlugForComparison(routeSubcategorySlug);

        const foundCategory = data.find(
          (cat) => cat.categoryslug && decodeSlugForComparison(cat.categoryslug) === decodedRouteCategorySlug
        );

        if (!foundCategory) {
          throw new Error(`Category not found for slug: ${routeCategorySlug}`);
        }

        setCurrentCategoryName(foundCategory.name);
        setSubcategories(foundCategory.subcategories || []);

        const foundSubcat = (foundCategory.subcategories || []).find(
          (sub) => sub.subcategoryslug && decodeSlugForComparison(sub.subcategoryslug) === decodedRouteSubcategorySlug
        );

        if (!foundSubcat) {
          throw new Error(`Subcategory not found for slug: ${routeSubcategorySlug}`);
        }

        setCurrentSubcategoryName(foundSubcat.name);
        setProducts(foundSubcat.products || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Could not load products for this subcategory.");
        setProducts([]);
        setSubcategories([]);
        setCurrentCategoryName("");
        setCurrentSubcategoryName("");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [routeCategorySlug, routeSubcategorySlug]);

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#F6F9FF');
    }
    navigation.setOptions({
        headerShown: false,
    });
  }, [navigation, currentSubcategoryName]);

  const handleProductPress = (product) => {
    const productId = product._id || product.productslug;
    if (productId) {
      navigation.navigate("ProductDetail", { productId: productId });
    } else {
      console.warn("Cannot navigate to product detail, no ID found for product:", product.name || 'Unknown Product');
    }
  };

  const handleSubcategoryNav = (sub) => {
    if (routeCategorySlug && sub.subcategoryslug) {
      navigation.replace("SellerProductsScreen", {
        categorySlug: routeCategorySlug,
        subcategorySlug: sub.subcategoryslug,
      });
    } else {
      console.error("Cannot navigate to subcategory, missing slugs:", { routeCategorySlug, subcategoryslug: sub.subcategoryslug });
    }
  };

  const handleCompanyProfileNav = (userId) => {
    if (userId) {
      navigation.navigate("CompanyProfileScreen", { userId: userId });
    } else {
      console.warn("User ID not available for company profile navigation.");
    }
  };
  
  const handleWishlistToggle = (productId) => {
    const isProductInWishlist = wishlistItems.some(
      (item) => item._id === productId || (item.product && item.product._id === productId)
    );
    if (isProductInWishlist) {
      dispatch(removeProductFromWishlist(productId));
    } else {
      dispatch(addProductToWishlist(productId));
    }
  };

  const renderHeader = () => (
    <View>
      <SubcategoryList
        subcategories={subcategories}
        loading={loading}
        routeSubcategorySlug={routeSubcategorySlug}
        handleSubcategoryNav={handleSubcategoryNav}
      />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.noProductsContainer}>
      <Ionicons name="sad-outline" size={50} color="#95A5A6" />
      <Text style={styles.noProductsText}>No products found in this subcategory.</Text>
    </View>
  );

  // --- Main rendering logic with new components ---
  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Sidebar and Backdrop are only rendered if the sidebar is visible and the screen is focused */}
      {sidebarVisible && isFocused && (
        <>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={toggleSidebar} />
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
            <Sidebar
              activeScreen={null}
              setActiveScreen={() => {}}
              toggleSidebar={toggleSidebar}
              navigation={navigation}
            />
          </Animated.View>
        </>
      )}
      
      {/* SearchBar */}
      <View style={styles.searchBarWrapper}>
        <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
      </View>

      {/* Main Content (conditionally rendered) */}
      {loading ? (
        <>
          <View style={styles.subcategoriesContainer}>
            <Text style={styles.subcategoriesTitle}>Subcategories</Text>
            <FlatList
              horizontal
              data={Array(5).fill({})}
              keyExtractor={(item, index) => `skeleton-sub-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcategoriesList}
              renderItem={() => <View style={styles.subcategoryItemSkeleton} />}
            />
          </View>
          <View style={styles.productGridSkeletonContainer}>
            {[...Array(isDesktop ? 4 : 2)].map((_, i) => <ProductSkeleton key={i} />)}
          </View>
        </>
      ) : error ? (
        <View style={styles.centeredContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#FF6347" style={{ marginBottom: 10 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
            <Text style={{ color: '#6D4AAE' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={isDesktop ? 2 : 1}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => {
            const isProductInWishlist = wishlistItems.some(
              (wishlistItem) => wishlistItem._id === item._id || (wishlistItem.product && wishlistItem.product._id === item._id)
            );
            return (
              <ProductCard
                item={item}
                handleProductPress={handleProductPress}
                handleWishlistToggle={handleWishlistToggle}
                isProductInWishlist={isProductInWishlist}
                handleCompanyProfileNav={handleCompanyProfileNav}
              />
            );
          }}
        />
      )}
      
      {/* BottomTabs (always visible) */}
      <View style={styles.bottomTabsContainer}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

// --- SKELETON COMPONENTS ---
const ProductSkeleton = () => (
  <View style={styles.productCardSkeleton}>
    <View style={styles.productImageSkeleton} />
    <View style={styles.productInfoSkeleton}>
      <View style={styles.productNameSkeleton} />
      <View style={styles.productDescSkeleton} />
      <View style={styles.companyInfoSkeleton} />
      <View style={styles.priceAndMOQSkeleton} />
      <View style={styles.buttonSkeleton} />
    </View>
  </View>
);
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6347',
    textAlign: 'center',
  },
  goBackButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  flatListContent: {
    padding: 10,
    paddingBottom: 70, // To make space for the BottomTabs
  },
  productCard: {
 width: '96%', // Takes full width of the FlatList container
 marginVertical: 8, // Adds vertical space between cards
 marginHorizontal: 8,
 backgroundColor: '#fff',
 borderRadius: 10,
 padding: 10, // Increased padding for better spacing inside the card
  borderWidth: 1,
  borderColor: '#e5e7eb', // Tailwind's gray-200
  },
  subcategoriesContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 70,
  },
  subcategoriesTitle: {
    fontWeight: 'bold',
  fontSize: 14,
  marginTop: 5,
  marginBottom: 8,
  color: '#333',
  },
  subcategoriesList: {
    paddingHorizontal: 15,
    paddingRight: 30, // For better scroll experience
  },
  subcategoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 60,
  },
  subcategoryItemActive: {
    borderColor: '#6D4AAE',
  },
  subcategoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subcategoryImageActive: {
    borderWidth: 1,
    borderColor: '#6D4AAE',
  },
  subcategoryName: {
    fontSize: 10,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  subcategoryItemTextActive: {
    color: '#6D4AAE',
    fontWeight: '600',
  },
  subcategoryItemSkeleton: {
    width: 100,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    marginRight: 10,
  },
  productImageWrapper: {
    width: '100%',
    height: isDesktop ? 200 : 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: "#7F8C8D",
    marginBottom: 10,
  },
  companyInfo: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EBEFF2',
    marginBottom: 10,
  },
  companyNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498DB',
  },
  companyMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  companyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  companyMetaText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  companyMetaTextSuccess: {
    fontSize: 12,
    color: '#2ECC71',
    fontWeight: '600',
  },
  priceAndMOQ: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  priceContainer: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
    padding: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 2,
  },
  moqContainer: {
    flex: 1,
    marginLeft: 5,
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
    padding: 8,
  },
  moqLabel: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  moqValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 2,
  },
  noProductsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  noProductsText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginTop: 10,
    textAlign: 'center',
  },
  bottomTabsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
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
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  wishlistButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 5,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  productGridSkeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
productCardSkeleton: {
  width: isDesktop ? (width / 2) - 30 : width - 20,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  margin: 8,
  alignSelf: "center", // ✅ This centers it horizontally
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
  overflow: "hidden",
},

  productImageSkeleton: {
    width: '100%',
    height: isDesktop ? 200 : 180,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfoSkeleton: {
    padding: 15,
  },
  productNameSkeleton: {
    width: '80%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  productDescSkeleton: {
    width: '90%',
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
  },
  companyInfoSkeleton: {
    width: '70%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
  },
  priceAndMOQSkeleton: {
    width: '100%',
    height: 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonSkeleton: {
    width: '100%',
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 10,
  },
});

export default SellerProductsScreen;