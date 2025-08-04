// ProductDetailScreen.js

import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Buyfrom from '../components/BuyForm';
import SearchBarWithSuggestions from '../components/SearchBar';
import BottomTabs from '../components/BottomTabs';
import Sidebar from "../components/Sidebar";
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  addProductToWishlist,
  removeProductFromWishlist,
} from '../redux/wishlistSlice';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;

  const dispatch = useDispatch();
  const { items: wishlistItems, loading: wishlistLoading } = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedCategories, setRelatedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-width * 0.8)).current;

  // FIX: This is the critical change. We check both potential locations for the product ID.
  const isProductInWishlist = wishlistItems.some(
    (item) => item._id === productId || (item.product && item.product._id === productId)
  );

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

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F6F9FF');
    }
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://www.dialexportmart.com/api/products/${productId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error fetching product.');
        }
        setProduct(data);
        setRelatedProducts(data.relatedProducts || []);
        setRelatedCategories(data.relatedCategories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
      setHoveredImage(null);
    }
  }, [productId]);

  useEffect(() => {
    if (product && product.images && product.images.length > 0 && !hoveredImage) {
      setHoveredImage(product.images[0]);
    }
  }, [product, hoveredImage]);

  const stripHTML = (html) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const handleWishlistToggle = () => {
    if (isProductInWishlist) {
      dispatch(removeProductFromWishlist(productId));
    } else {
      dispatch(addProductToWishlist(productId));
    }
  };

  // --- Render based on state ---
  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
        <View style={styles.searchBarWrapper}>
          <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading product details...</Text>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomTabsContainer}>
          <BottomTabs />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
        <View style={styles.searchBarWrapper}>
          <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
        </View>
        <View style={styles.noProductContainer}>
          <Text style={styles.noProductText}>No product found.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomTabsContainer}>
          <BottomTabs />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <Sidebar
          activeScreen={null}
          setActiveScreen={() => {}}
          toggleSidebar={toggleSidebar}
          navigation={navigation}
        />
      </Animated.View>

      {/* Backdrop for sidebar */}
      {sidebarVisible && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={toggleSidebar} />
      )}

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
      </View>

      {/* Main content, now inside a ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.productCard}>
          {/* Images Section */}
          <View style={styles.imageSection}>
            {/* Thumbnails */}
            <View style={styles.thumbnailContainer}>
              {product.images?.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setHoveredImage(img)}
                  style={[
                    styles.thumbnail,
                    hoveredImage === img ? styles.thumbnailActive : null,
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Main Image */}
            <TouchableOpacity style={styles.mainImageContainer} onPress={() => setShowZoomModal(true)}>
              <Image
                source={{ uri: hoveredImage || product.images?.[0] || 'https://via.placeholder.com/500' }}
                style={styles.mainImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Product Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.productName}>{product.name}</Text>
    {/* Wishlist Button - NOW INSIDE THE IMAGE SECTION */}
            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              <Ionicons
                name={isProductInWishlist ? 'heart' : 'heart-outline'}
                size={24}
                color={isProductInWishlist ? 'red' : 'black'}
              />
            </TouchableOpacity>
            <View style={styles.metaInfo}>
              {product.userId?.fullname && <Text style={styles.metaText}>👤 {product.userId.fullname}</Text>}
              {product.userId?.companyName && <Text style={styles.metaText}>🏢 {product.userId.companyName}</Text>}
            </View>
            {/* <Text style={styles.ratingText}>⭐⭐⭐⭐ Rating</Text> */}

            <View style={styles.priceMooContainer}>
              <View style={styles.priceBox}>
                <Text style={styles.priceText}>
                  ₹{product.tradeShopping?.slabPricing?.[0]?.price || 'N/A'}
                </Text>
              </View>
              <Text style={styles.moqText}>
                Minimum Order Quantity: <Text style={styles.moqValue}>{product.minimumOrderQuantity || 'N/A'}</Text>
              </Text>
            </View>

            <View style={styles.sectionDivider}>
              <Text style={styles.descriptionText}>
                {product.description || 'No description available.'}
              </Text>
            </View>

            <View style={styles.sectionDivider}>
              <View style={styles.tableRowWrapper}>
                {/* Specifications Table */}
                <View style={styles.tableColumn}>
                  <Text style={styles.subTitle}>Specifications</Text>
                  <View style={styles.table}>
                    {[
                      { label: 'Product Type', value: product.specifications?.productType },
                      { label: 'Material', value: product.specifications?.material },
                      { label: 'Finish', value: product.specifications?.finish },
                      {
                        label: 'Thickness',
                        value: `${product.specifications?.thicknessTolerance ?? ''} ${product.specifications?.thicknessToleranceUnit ?? ''}`
                      },
                      {
                        label: 'Width',
                        value: `${product.specifications?.width ?? ''} ${product.specifications?.widthUnit ?? ''}`
                      },
                      {
                        label: 'Length',
                        value: `${product.specifications?.length ?? ''} ${product.specifications?.lengthUnit ?? ''}`
                      },
                      {
                        label: 'Weight',
                        value: `${product.specifications?.weight ?? ''} ${product.specifications?.weightUnit ?? ''}`
                      },
                      { label: 'Metals Type', value: product.specifications?.metalsType },
                      {
                        label: 'Width Tolerance',
                        value: `${product.specifications?.widthTolerance ?? ''} ${product.specifications?.widthToleranceUnit ?? ''}`
                      },
                    ]
                      .filter(item => item.value && item.value !== 'N/A')
                      .map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCellLabel}>{item.label}</Text>
                          <Text style={styles.tableCellValue}>{item.value}</Text>
                        </View>
                      ))}
                  </View>
                </View>

                {/* Trade Info Table */}
                <View style={styles.tableColumn}>
                  <Text style={styles.subTitle}>Trade Info</Text>
                  <View style={styles.table}>
                    {Object.entries(product.tradeInformation || {})
                      .filter(([_, value]) => {
                        if (Array.isArray(value)) return value.length > 0;
                        return value && value !== 'N/A';
                      })
                      .map(([key, value]) => (
                        <View key={key} style={styles.tableRow}>
                          <Text style={styles.tableCellLabel}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </Text>
                          <Text style={styles.tableCellValue}>
                            {Array.isArray(value) ? value.join(', ') : value}
                          </Text>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Business Profile */}
            {product.businessProfile && (
              <View style={styles.sectionDivider}>
                <Text style={styles.businessProfileTitle}>Business Profile</Text>
                {product.businessProfile.companyDescription && (
                  <Text style={styles.companyDescription}>
                    {stripHTML(product.businessProfile.companyDescription)}
                  </Text>
                )}
                <View style={styles.businessProfileGrid}>
                  <View style={styles.businessProfileItem}>
                    <View style={styles.iconCircle}><Text>🛍️</Text></View>
                    <View>
                      <Text style={styles.profileItemLabel}>Business Type</Text>
                      <Text style={styles.profileItemValue}>
                        {product.businessProfile.businessType?.join(', ') || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.businessProfileItem}>
                    <View style={styles.iconCircle}><Text>👥</Text></View>
                    <View>
                      <Text style={styles.profileItemLabel}>Employee Count</Text>
                      <Text style={styles.profileItemValue}>
                        {product.businessProfile.numberOfEmployees || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.businessProfileItem}>
                    <View style={styles.iconCircle}><Text>🎖️</Text></View>
                    <View>
                      <Text style={styles.profileItemLabel}>Establishment</Text>
                      <Text style={styles.profileItemValue}>
                        {product.businessProfile.yearOfEstablishment || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.businessProfileItem}>
                    <View style={styles.iconCircle}><Text>✅</Text></View>
                    <View>
                      <Text style={styles.profileItemLabel}>GST NO</Text>
                      <Text style={styles.profileItemValue}>
                        {product.businessProfile.gstNumber || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.businessProfileItem}>
                    <View style={styles.iconCircle}><Text>💳</Text></View>
                    <View>
                      <Text style={styles.profileItemLabel}>Payment Mode</Text>
                      <Text style={styles.profileItemValue}>
                        {product.tradeInformation?.samplePolicy || 'N/A'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.businessProfileItem}>
                    <View style={styles.iconCircle}><Text>📅</Text></View>
                    <View>
                      <Text style={styles.profileItemLabel}>Working Days</Text>
                      <Text style={styles.profileItemValue}>
                        {product.businessProfile.workingDays?.join(' To ') || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
                {product.businessProfile.companyLogo && (
                  <View style={styles.companyLogoContainer}>
                    <Image
                      source={{ uri: product.businessProfile.companyLogo }}
                      style={styles.companyLogo}
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
            )}

            <View style={styles.buyFromContainer}>
              <Buyfrom product={product} sellerId={product?.userId?._id} />
            </View>
          </View>
        </View>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedSectionTitle}>Related Products</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedProductsScroll}>
              {relatedProducts.map((relatedProduct) => (
                <TouchableOpacity
                  key={relatedProduct._id}
                  onPress={() => navigation.push('ProductDetail', { productId: relatedProduct._id })}
                  style={styles.relatedProductCard}
                >
                  <View style={styles.relatedProductImageContainer}>
                    <Image
                      source={{ uri: relatedProduct.images?.[0] || 'https://via.placeholder.com/200' }}
                      style={styles.relatedProductImage}
                      resizeMode="contain"
                    />
                    <View style={styles.imageCountBadge}>
                      <Text style={styles.imageCountText}>+{relatedProduct.images?.length || 0}</Text>
                    </View>
                  </View>
                  <View style={styles.relatedProductInfo}>
                    <Text style={styles.relatedProductName} numberOfLines={2}>
                      {relatedProduct.name}
                    </Text>
                    <Text style={styles.relatedProductPrice}>
                      {relatedProduct.tradeShopping?.slabPricing?.[0]?.price
                        ? `₹${relatedProduct.tradeShopping.slabPricing[0].price}`
                        : 'Ask Price'}
                    </Text>
                    <View style={styles.relatedProductSpecs}>
                      {relatedProduct.specifications?.usage && (
                        <Text style={styles.relatedProductSpecText}>
                          <Text style={styles.specLabel}>Usage:</Text> {relatedProduct.specifications.usage}
                        </Text>
                      )}
                      {relatedProduct.specifications?.woodType && (
                        <Text style={styles.relatedProductSpecText}>
                          <Text style={styles.specLabel}>Wood Type:</Text> {relatedProduct.specifications.woodType}
                        </Text>
                      )}
                      {relatedProduct.specifications?.design && (
                        <Text style={styles.relatedProductSpecText}>
                          <Text style={styles.specLabel}>Design:</Text> {relatedProduct.specifications.design}
                        </Text>
                      )}
                      {relatedProduct.specifications?.finish && (
                        <Text style={styles.relatedProductSpecText}>
                          <Text style={styles.specLabel}>Finish:</Text> {relatedProduct.specifications.finish}
                        </Text>
                      )}
                      {relatedProduct.tradeInformation?.mainExportMarkets?.length > 0 && (
                        <Text style={styles.relatedProductSpecText}>
                          <Text style={styles.specLabel}>Export Markets:</Text> {relatedProduct.tradeInformation.mainExportMarkets.join(', ')}
                        </Text>
                      )}
                      {relatedProduct.tradeInformation?.mainDomesticMarket && (
                        <Text style={styles.relatedProductSpecText}>
                          <Text style={styles.specLabel}>Domestic Market:</Text> {relatedProduct.tradeInformation.mainDomesticMarket}
                        </Text>
                      )}
                    </View>
                    {(relatedProduct.userId?.companyName || relatedProduct.userId?.fullname) && (
                      <Text style={styles.relatedSellerName}>
                        {relatedProduct.userId?.companyName || relatedProduct.userId?.fullname}
                      </Text>
                    )}
                    <View style={styles.sellerBadges}>
                      {relatedProduct.businessProfile?.gstNumber && (
                        <Text style={styles.gstBadge}>✅ GST</Text>
                      )}
                      {relatedProduct.businessProfile?.yearOfEstablishment && (
                        <Text style={styles.yearsBadge}>
                          👤 {new Date().getFullYear() - relatedProduct.businessProfile.yearOfEstablishment} yrs
                        </Text>
                      )}
                    </View>
                    <Text style={styles.relatedProductRating}>⭐⭐⭐⭐ 4.2 (79)</Text>
                    <View style={styles.buyFromContainer}>
                      <Buyfrom product={product} sellerId={product?.userId?._id} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Related Categories Section */}
        {relatedCategories.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedSectionTitle}>Explore More in Similar Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedCategoriesScroll}>
              {relatedCategories.map((rc) => (
                <TouchableOpacity
                  key={rc._id}
                  onPress={() =>
                    navigation.navigate(
                      rc.type === 'product_as_category_display' ? 'ProductsScreen' : 'CategoryScreen',
                      rc.type === 'product_as_category_display'
                        ? { productslug: rc.productslug }
                        : { slug: rc.slug, categoryId: rc._id }
                    )
                  }
                  style={styles.relatedCategoryCard}
                >
                  <View style={styles.relatedCategoryImageContainer}>
                    <Image
                      source={{ uri: rc.image || 'https://via.placeholder.com/100' }}
                      style={styles.relatedCategoryImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.relatedCategoryName} numberOfLines={2}>
                    {rc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Zoom Modal */}
      <Modal visible={showZoomModal} transparent={true} animationType="fade">
        <TouchableOpacity style={styles.zoomModalOverlay} onPress={() => setShowZoomModal(false)}>
          <View style={styles.zoomModalContent}>
            <Image
              source={{ uri: hoveredImage || product.images?.[0] || 'https://via.placeholder.com/500' }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowZoomModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
   safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  }, 
 imageSection: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative', // Add this to make absolute positioning work for children
  },
  
  wishlistButton: {
    position: 'absolute',
    top: 2,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)', // A semi-transparent background for better visibility
    padding: 8,
    borderRadius: 20,
    // Add these for iOS and Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  noProductContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  noProductText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonHeader: {
    backgroundColor: '#e0f2f7', // Corresponds to blue-50
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
    alignSelf: 'flex-start', // Adjust as needed for full width or self-align
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0288d1', // Corresponds to blue-700
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 55,
    padding: 15,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'column', // For smaller screens
  },
  imageSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  thumbnailContainer: {
    width: '20%', // Adjust as needed
    marginRight: 10,
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailActive: {
    borderColor: '#3b82f6', // Corresponds to ring-2 ring-blue-500
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  mainImageContainer: {
    width: '75%', // Adjust as needed
    height: 200,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    flex: 1,
    paddingVertical: 10,
  },
  productName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a202c', // Corresponds to gray-900
    marginBottom: 5,
  },
  metaInfo: {
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280', // Corresponds to gray-500
    marginRight: 15,
  },
  ratingText: {
    color: '#fcd34d', // Corresponds to yellow-500
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
  },
  priceMooContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceBox: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 20,
  },
  priceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6D4AAE', // Corresponds to green-700
  },
  moqText: {
    fontSize: 13,
    color: '#4a5568', // Corresponds to gray-700
    fontWeight: '500',
  },
  moqValue: {
    fontWeight: 'bold',
    color: '#1a202c', // Corresponds to gray-900
  },
  sectionDivider: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0', // Corresponds to border-t
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4, 

  },
  descriptionText: {
  fontSize: 11, // Adjusted font size
    color: "#666",
    lineHeight: 13,
  },


tableColumn: {
  flex: 1,
  minWidth: '48%',
},

subTitle: {
  fontWeight: 'bold',
  fontSize: 14,
  marginTop: 15,
  marginBottom: 8,
  color: '#333',
},

table: {
  backgroundColor: '#f9f9f9',
  padding: 10,
  borderRadius: 8,
},

tableRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 6,
},

tableCellLabel: {
  fontWeight: 'bold',
  flex: 1,
  color: '#555',
},

tableCellValue: {
  flex: 1,
  textAlign: 'right',
  color: '#333',
},

  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7', // Corresponds to even:bg-gray-50
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableCellLabel: {
    flex: 1,
    fontSize: 10,
    fontWeight: '500',
    color: '#4a5568', // Corresponds to gray-600
  },
  tableCellValue: {
    flex: 2,
    fontSize: 10,
    color: '#4a5568', // Corresponds to gray-700
  },
  businessProfileTitle: {
  fontWeight: 'bold',
  fontSize: 14,
  marginTop: 15,
  marginBottom: 8,
  color: '#333',
  },
  companyDescription: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 20,
  },
  businessProfileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  businessProfileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Approx half width for two columns
    marginBottom: 14,
  },
  iconCircle: {
    backgroundColor: '#fff0d9', // Corresponds to orange-100
    padding: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  profileItemLabel: {
    color: '#4a5568',
    fontWeight: '600',
        fontSize: 12,
    marginBottom: 2,
  },
  profileItemValue: {
    color: '#6b7280',
    fontSize: 10,
  },
  companyLogoContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 5,
    alignSelf: 'flex-start', // Aligns logo to start
  },
  companyLogo: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  buyFromContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  relatedSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 20, 
  },
  relatedSectionTitle: {
    fontWeight: 'bold',
  fontSize: 14,
  marginTop: 15,
  marginBottom: 8,
  color: '#333',
  },
  relatedProductsScroll: {
    paddingBottom: 10, // Gives some space for horizontal scroll
  },
  relatedProductCard: {
    width: width * 0.46, // Adjust width for horizontal scroll
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  relatedProductImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  relatedProductImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 11,
  },
  relatedProductInfo: {
    padding: 12,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  relatedProductName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 5,
  },
  relatedProductPrice: {
    color: '#2b6cb0',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  relatedProductSpecs: {
    marginBottom: 10,
  },
  relatedProductSpecText: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 2,
  },
  specLabel: {
    fontWeight: '500',
    color: '#4a5568',
  },
  relatedSellerName: {
    color: '#2d3748',
    fontWeight: '600',
    fontSize: 11,
    marginTop: 8,
  },
  sellerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  gstBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 8,
  },
  yearsBadge: {
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 15,
  },
  relatedProductRating: {
    color: '#fcd34d',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  relatedCategoriesScroll: {
    paddingBottom: 10,
  },
  relatedCategoryCard: {
    width: width * 0.20, // Adjust width for horizontal scroll
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
    padding: 10,
    marginBottom: 100,
  },
  relatedCategoryImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  relatedCategoryImage: {
     width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  relatedCategoryName: {
     fontSize: 10,
    color: "#555",
    fontWeight: "500",
    textAlign: "center",
  },
  zoomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomModalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#000',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
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