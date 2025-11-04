import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux'; // <-- New import

const { width } = Dimensions.get('window');

const SearchBarWithSuggestions = ({ toggleSidebar }) => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { token, isLoading: authLoading } = useContext(AuthContext);
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(false);
const buyer = useSelector((state) => state.buyer.buyer);
  // Use useSelector to get the wishlist items and count
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    fetchUser();
  }, [token]);

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        "https://www.dialexportmart.com/api/userprofile/profile/userprofile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserDetail(res.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim() === '') {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('https://www.dialexportmart.com/api/adminprofile/seller');
        const data = await response.json();

        if (response.ok) {
          const filtered = data.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSuggestions(filtered);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleSelectSuggestion = (productslug, name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    Keyboard.dismiss();
    navigation.navigate('ProductsScreen', { productslug });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item.productslug, item.name)}
    >
      <Text style={styles.suggestionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
<SafeAreaView style={styles.wrapper} edges={['left', 'right']}>
      <View style={styles.searchHeaderContainer}>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
      <Image
        source={require('../assets/company_logo.png')}
        style={styles.companyLogoInsideSearch}
      />
    </TouchableOpacity>
          <TextInput
            placeholder="Search Products & Suppliers"
            placeholderTextColor="#888"
            style={styles.input}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => { /* Handle search submit or clear */ }}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIconRight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.rightIconWrapper}
          onPress={() => navigation.navigate('NotificationsScreen')}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rightIconWrapper}
          onPress={() => navigation.navigate('WishlistScreen')}
        >
          <Ionicons name="heart-outline" size={24} color="#333" />
          {wishlistCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{wishlistCount}</Text>
            </View>
          )}
        </TouchableOpacity>

<TouchableOpacity
  onPress={() => {
    if (buyer || token) {
      // ✅ either buyer or seller logged in
      toggleSidebar();
    } else {
      // 🚫 no one logged in — go to BuySell
      navigation.navigate("BuySell");
    }
  }}
  style={styles.rightIconWrapper}
>
{buyer ? (
  // If buyer is logged in
  buyer.profilePic ? (
    <Image source={{ uri: buyer.profilePic }} style={styles.profileImage} />
  ) : (
    <View style={styles.placeholderAvatar}>
      <Text style={styles.avatarText}>
        {buyer.fullname?.charAt(0).toUpperCase() || "B"}
      </Text>
    </View>
  )
) : userDetail ? (
  // If seller (userDetail) is logged in
  userDetail.icon ? (
    <Image source={{ uri: userDetail.icon }} style={styles.profileImage} />
  ) : (
    <View style={styles.placeholderAvatar}>
      <Text style={styles.avatarText}>
        {userDetail.fullname?.charAt(0).toUpperCase() || "S"}
      </Text>
    </View>
  )
) : (
  // If no one logged in
  <View style={styles.placeholderAvatar}>
    <Text style={styles.avatarText}>U</Text>
  </View>
)}

</TouchableOpacity>
      </View>
      {loading && <ActivityIndicator style={styles.loading} color="#6D4AAE" />}

      {showSuggestions && (
        <View style={styles.suggestionList}>
          {suggestions.length > 0 ? (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            !loading && searchTerm.length > 0 && (
              <Text style={styles.noProductsText}>No products found.</Text>
            )
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
  },
  searchHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  companyLogoInsideSearch: {
    width: 35,
    height: 15,
    resizeMode: 'cover',
  },
  profileImage: {
    width: 25,
    height: 25,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  placeholderAvatar: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: '#6D4AAE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: Platform.OS === 'ios' ? 7 : 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  clearIcon: {
    paddingLeft: 5,
  },
  searchIconRight: {
    marginLeft: 7,
  },
  rightIconWrapper: {
    paddingLeft: 7,
  },
  loading: {
    marginTop: 10,
    alignSelf: 'center',
  },
  suggestionList: {
    marginTop: 0,
    marginHorizontal: 1,
    marginVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    maxHeight: 300,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  suggestionItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  noProductsText: {
    padding: 12,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  // New styles for the badge
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SearchBarWithSuggestions;