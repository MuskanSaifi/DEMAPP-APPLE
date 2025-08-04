// SubcategoryScreen.js
import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar, // Import StatusBar
  Platform, // Import Platform
} from 'react-native';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH_RATIO = 0.35;
const PRODUCT_GRID_WIDTH_RATIO = 1 - SIDEBAR_WIDTH_RATIO;

const SIDEBAR_WIDTH = width * SIDEBAR_WIDTH_RATIO;
const PRODUCT_GRID_WIDTH = width * PRODUCT_GRID_WIDTH_RATIO;

const PRODUCT_ITEM_MARGIN = 8;
const NUM_PRODUCT_COLUMNS = 2;
const PRODUCT_FLATLIST_PADDING = 10;

const PRODUCT_ITEM_WIDTH =
  (PRODUCT_GRID_WIDTH - (PRODUCT_FLATLIST_PADDING * 2) - (PRODUCT_ITEM_MARGIN * (NUM_PRODUCT_COLUMNS + 1))) / NUM_PRODUCT_COLUMNS;


const SubcategoryScreen = ({ route, navigation }) => {
  const { subcategory, allSubcategories = [] } = route.params;

  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subcategory) {
      setLoading(false);
      return;
    }

    const fullSubcategory = allSubcategories.find((sub) => sub._id === subcategory._id);
    const finalSubcategory = fullSubcategory || subcategory;
    finalSubcategory.products = finalSubcategory.products || [];

    setSelectedSubcategory(finalSubcategory);
    setLoading(false);
  }, [subcategory, allSubcategories]);


  useLayoutEffect(() => {
    // ******************************************************
    // UPDATED: StatusBar configuration for white header
    // ******************************************************
    StatusBar.setBarStyle('dark-content', true); // Text/icons will be BLACK for a white header
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFFFFF'); // Set Android status bar background to white
    }
    // ******************************************************

    if (selectedSubcategory?.name) {
      navigation.setOptions({
        title: selectedSubcategory.name,
        // ************************************************
        // CHANGED: Header background to white and text/icons to black
        headerStyle: {
          backgroundColor: '#FFFFFF', // White header background
          shadowColor: '#000', // Re-add subtle shadow for separation
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 3, // Android shadow
        },
        headerTintColor: '#333', // Dark text/icons for white background
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // ************************************************
      });
    } else {
      navigation.setOptions({
        title: 'Subcategories', // Default title while loading
        // ************************************************
        // CHANGED: Header background to white and text/icons to black for default state too
        headerStyle: {
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 3,
        },
        headerTintColor: '#333', // Dark text/icons
        headerTitleStyle: { fontWeight: 'bold' },
        // ************************************************
      });
    }
  }, [navigation, selectedSubcategory]);

  const handleSidebarPress = (item) => {
    const fullSubcategoryData = allSubcategories.find((sub) => sub._id === item._id);
    setSelectedSubcategory(fullSubcategoryData || item);
  };

  const renderSidebarItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.sidebarItem,
        item._id === selectedSubcategory?._id && styles.activeSidebarItem,
      ]}
      onPress={() => handleSidebarPress(item)}
    >
      <Image
        source={{ uri: item.icon || 'https://via.placeholder.com/40/C0C0C0/FFFFFF?text=Icon' }}
        style={styles.sidebarIcon}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.sidebarText,
          item._id === selectedSubcategory?._id && styles.activeSidebarText,
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() =>
        navigation.navigate('ProductsScreen', { productslug: item.productslug })
      }
    >
      <Image
        source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100/D0D0D0/000000?text=Product' }}
        style={styles.productImage}
        resizeMode="contain"
      />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name || 'No name available'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6D4AAE" />
        <Text style={styles.loadingText}>Loading subcategory details...</Text>
      </View>
    );
  }

  if (!selectedSubcategory) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No subcategory selected or found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <FlatList
          data={allSubcategories}
          keyExtractor={(item, index) => `${item._id || 'sidebar-item'}-${index}`}
          renderItem={renderSidebarItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sidebarListContent}
        />
      </View>

      {/* Products grid */}
      <View style={styles.productsContainer}>
        {selectedSubcategory.products && selectedSubcategory.products.length > 0 ? (
          <FlatList
            data={selectedSubcategory.products}
            keyExtractor={(item, index) => `${item._id || 'product'}-${index}`}
            renderItem={renderProductItem}
            numColumns={NUM_PRODUCT_COLUMNS}
            columnWrapperStyle={styles.productColumnWrapper}
            contentContainerStyle={styles.productsGridContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyProductsContainer}>
            <Text style={styles.emptyProductsText}>No products found for this subcategory.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
  },

  // Centered State (Loading, Empty)
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: 16,
    color: '#A1A1A1',
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: '#A1A1A1',
    fontStyle: 'italic',
  },

  // Sidebar Styles
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFFEE',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingVertical: 15,
    paddingHorizontal: 8,
  },
  sidebarListContent: {
    paddingBottom: 30,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    marginVertical: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeSidebarItem: {
    backgroundColor: '#ECE3FF',
    shadowColor: '#9A7DFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sidebarIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E9E9E9',
    marginRight: 10,
  },
  sidebarText: {
    fontSize: 11,
    color: '#444',
    fontWeight: '500',
  },
  activeSidebarText: {
    color: '#6A42FF',
    fontWeight: '700',
  },

  // Products Container
  productsContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  productsGridContent: {
    padding: PRODUCT_FLATLIST_PADDING,
  },
  productColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: PRODUCT_ITEM_MARGIN + 8,
  },

  // Product Card
  productItem: {
    width: PRODUCT_ITEM_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: PRODUCT_ITEM_MARGIN / 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    minHeight: 38,
  },

  // No Product Message
  emptyProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyProductsText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});


export default SubcategoryScreen;