// src/components/WishlistScreen.js

import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

import {
  fetchUserWishlist,
  removeProductFromWishlist,
  clearWishlist,
} from '../redux/wishlistSlice';

const WishlistScreen = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const user = useSelector((state) => state.user.user);
  const navigation = useNavigation();

  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchUserWishlist());
    } else {
      console.log("WishlistScreen: User is NOT logged in or user._id is missing, clearing wishlist.");
      dispatch(clearWishlist());
    }
  }, [dispatch, user]);

  const SkeletonWishlistCard = () => (
    <View style={styles.cardContainer}>
      <View style={styles.skeletonImageContainer}>
        <View style={styles.skeletonCircle} />
      </View>
      <View style={styles.skeletonDetailsContainer}>
        <View style={[styles.skeletonLine, { width: '90%' }]} />
        <View style={[styles.skeletonLine, { width: '70%', marginTop: 5 }]} />
        <View style={[styles.skeletonLine, { width: '60%', marginTop: 5 }]} />
        <View style={[styles.skeletonLine, { width: '50%', marginTop: 5 }]} />
      </View>
    </View>
  );

  // === MODIFIED renderWishlistItem FUNCTION ===
  const renderWishlistItem = ({ item: product }) => (
    // Make the entire card a TouchableOpacity
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        navigation.navigate("ProductDetail", {
          productId: product._id,
          productslug: product.productslug,
        });
      }}
    >
      <View style={styles.productHeader}>
        <Image
          source={{ uri: product?.images?.[0]?.url || 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>Price: ₹{product.price} {product.currency || "INR"}</Text>
          <Text style={styles.productMoq}>MOQ: {product.minimumOrderQuantity} {product.moqUnit}</Text>
          <Text style={styles.productStatus}>
            Status:{" "}
            <Text style={product?.tradeShopping?.stockQuantity > 0 ? styles.inStock : styles.outOfStock}>
              {product?.tradeShopping?.stockQuantity > 0 ? "In stock" : "Out of stock"}
            </Text>
          </Text>
          <Text style={styles.productAddedDate}>
            Added: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => dispatch(removeProductFromWishlist(product._id))}
          disabled={loading}
        >
<Icon name="close" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
      {/* The cardFooter section is now completely removed */}
    </TouchableOpacity>
  );
  // === END MODIFIED SECTION ===

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Wishlist</Text>
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />
        <SkeletonWishlistCard />
        <SkeletonWishlistCard />
        <SkeletonWishlistCard />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error loading wishlist: {error}</Text>
        <Text style={styles.errorText}>Please try again later.</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.leadText}>Please log in to view and manage your wishlist.</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Your Wishlist is Empty</Text>
        <Text style={styles.leadText}>Start adding products you love!</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  leadText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#6c757d',
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  browseButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
productCard: {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 15,
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#e5e7eb', // Tailwind's gray-200
},

  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  productMoq: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  productStatus: {
    fontSize: 14,
    marginBottom: 2,
    color: '#6c757d',
  },
  inStock: {
    color: 'green',
    fontWeight: 'bold',
  },
  outOfStock: {
    color: 'red',
    fontWeight: 'bold',
  },
  productAddedDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  removeButton: {
    padding: 8,
  },
  // The old cardFooter styles are now unused and can be removed
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  viewDetailsButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonImageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  skeletonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bdbdbd',
  },
  skeletonDetailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skeletonLine: {
    height: 15,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
});

export default WishlistScreen;