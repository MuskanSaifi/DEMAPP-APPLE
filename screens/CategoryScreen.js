import React, { useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Define a consistent margin for all sides of the items
const ITEM_MARGIN = 8;
const NUM_COLUMNS = 4;

// Calculate ITEM_WIDTH to fit perfectly, accounting for margins
// Total width available for items = screen_width - 2 * (container_horizontal_padding)
// Total margin space = (NUM_COLUMNS + 1) * ITEM_MARGIN (for left, right, and in-between items)
const ITEM_WIDTH = (width - (ITEM_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;


const CategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: category.name,
    });
  }, [navigation, category.name]);

  const renderSubcategory = ({ item }) => (
    <TouchableOpacity
      style={styles.subcategoryItem}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate('SubcategoryScreen', {
          subcategory: item,
          allSubcategories: category.subcategories,
        })
      }
    >
      <Image
        source={{ uri: item.icon || 'https://via.placeholder.com/60/ccc' }} // Updated placeholder size for better visual
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.subcategoryText} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={category.subcategories}
        keyExtractor={(item, index) => `${item._id || 'subcat'}-${index}`}
        renderItem={renderSubcategory}
        numColumns={NUM_COLUMNS} // Use the defined number of columns
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No subcategories found.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Lighter background
    paddingHorizontal: ITEM_MARGIN, // Apply horizontal padding equal to item margin
    paddingTop: 15, // Keep some top padding
  },
  // heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 }, // Uncomment if needed
  columnWrapper: {
    // No 'justifyContent: space-between' here.
    // Margins on subcategoryItem will handle spacing.
    marginBottom: ITEM_MARGIN, // Vertical space between rows
  },
  subcategoryItem: {
    width: ITEM_WIDTH, // Use the calculated width
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: ITEM_MARGIN / 2, // Half margin on each side for consistent spacing
    // borderWidth: 1, // Optional: remove if you prefer no border
    // borderColor: '#ddd', // Optional: remove if you prefer no border
    borderRadius: 12, // Slightly more rounded corners
    backgroundColor: '#ffffff', // White background for cards

    // Enhanced Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
    shadowOpacity: 0.08, // Subtle opacity
    shadowRadius: 8, // More diffused shadow

    // Enhanced Shadow for Android
    elevation: 5, // Higher elevation
  },
  icon: {
    width: 50, // Slightly larger icon
    height: 50,
    marginBottom: 8,
    borderRadius: 10, // Optional: small border radius for icons
  },
  subcategoryText: {
    fontSize: 11, // Slightly smaller for better fit
    color: '#333', // Darker text for readability
    textAlign: 'center',
    paddingHorizontal: 5, // Add padding to text if it wraps
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#888',
  },
});

export default CategoryScreen;