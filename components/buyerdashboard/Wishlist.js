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
import RoleBadge from "../../components/RoleBadge";

import {
  fetchUserWishlist,
  removeProductFromWishlist,
  clearWishlist,
} from '../../redux/wishlistSlice';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items: wishlistItems, loading, error } = useSelector((state) => state.wishlist);
  const user = useSelector((state) => state.user.user);
  const buyer = useSelector((state) => state.buyer.buyer);
  const navigation = useNavigation();

  // 🚫 Only buyer can access this screen
  if (!buyer) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.leadText}>
          This section is only available for buyers.
        </Text>

        {!user && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Log In as Buyer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ✅ Buyer is logged in — fetch wishlist
  useEffect(() => {
    if (buyer && buyer._id) {
      dispatch(fetchUserWishlist());
    } else {
      dispatch(clearWishlist());
    }
  }, [dispatch, buyer]);

  const renderWishlistItem = ({ item: product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate('ProductDetail', {
          productId: product._id,
          productslug: product.productslug,
        })
      }
    >
      <View style={styles.productHeader}>
        <Image
          source={{ uri: product?.images?.[0]?.url || 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            Price: ₹{product.price} {product.currency || 'INR'}
          </Text>
          <Text style={styles.productMoq}>
            MOQ: {product.minimumOrderQuantity} {product.moqUnit}
          </Text>
          <Text style={styles.productStatus}>
            Status:{' '}
            <Text
              style={
                product?.tradeShopping?.stockQuantity > 0
                  ? styles.inStock
                  : styles.outOfStock
              }
            >
              {product?.tradeShopping?.stockQuantity > 0
                ? 'In stock'
                : 'Out of stock'}
            </Text>
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <RoleBadge />
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Error loading wishlist: {error}</Text>
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
      <RoleBadge />
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
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
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  browseButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listContent: { paddingBottom: 20 },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productHeader: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  productDetails: { flex: 1 },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  productPrice: { fontSize: 14, color: '#6c757d', marginBottom: 2 },
  productMoq: { fontSize: 14, color: '#6c757d', marginBottom: 2 },
  productStatus: { fontSize: 14, marginBottom: 2, color: '#6c757d' },
  inStock: { color: 'green', fontWeight: 'bold' },
  outOfStock: { color: 'red', fontWeight: 'bold' },
  removeButton: { padding: 8 },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Wishlist;
