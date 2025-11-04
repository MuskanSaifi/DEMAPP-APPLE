import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator, // Added for loading state
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 4 - 20; // Adjusted for 4 columns with some margin

// Define a palette of light, vibrant colors
const CATEGORY_COLORS = [
  '#FFDDC1', // Light Peach
  '#D4EDDA', // Light Green
  '#CCE5FF', // Light Blue
  '#FFF3CD', // Light Yellow
  '#F8D7DA', // Light Red/Pink
  '#E2E3E5', // Light Grey (neutral but light)
  '#D1ECF1', // Light Cyan
  '#FDDDE6', // Light Pink
  '#E6FFDD', // Another light green
  '#DDDDFF', // Light Lavender
];

const TopCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://www.dialexportmart.com/api/adminprofile/category');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.slice(0, 8)); // Show top 8 categories
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderItem = ({ item, index }) => {
    // Get a color from the palette based on the item's index
    const backgroundColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('CategoryScreen', { category: item })}
      >
        <View style={[styles.iconWrapper, { backgroundColor }]}>
          <Image
            source={{ uri: item.icon || 'https://placehold.co/30x30/f0f0f0/000000?text=Icon' }} // Fallback placeholder
            style={styles.icon}
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/30x30/f0f0f0/000000?text=Icon'; }} // JS fallback
          />
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const SkeletonItem = () => (
    <View style={styles.item}>
      <View style={styles.skeletonIconWrapper}>
        <View style={styles.skeletonIcon} />
      </View>
      <View style={styles.skeletonText} />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Heading and View All */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Top Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllCategories')} style={styles.viewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Grid */}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          key={'4columns'} // Key for FlatList to ensure re-render on numColumns change (though not changing here)
          data={loading ? Array(8).fill({}) : categories} // Show 8 skeleton items while loading
          renderItem={loading ? () => <SkeletonItem /> : renderItem}
          keyExtractor={(item, index) => item._id || `skeleton-${index}`} // Unique key for skeleton items too
          numColumns={4}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.container}
          ListEmptyComponent={!loading && !error && categories.length === 0 ? (
            <Text style={styles.emptyMessage}>No categories available.</Text>
          ) : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff', // Overall background for the section
     paddingHorizontal: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 10, // Increased top margin for better spacing
    marginBottom: 10,
    alignItems: 'center',
  },
  heading: {
    fontSize: 15, // Slightly larger heading
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#5110b1ff',
    fontWeight: '500', // Added font weight
  },
  container: {
    paddingHorizontal: 15, // Padding for the FlatList content itself
    paddingBottom: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
    // marginHorizontal removed as it's now in contentContainerStyle
  },
item: {
  width: ITEM_WIDTH,
  alignItems: 'center',
  backgroundColor: '#ffffff',
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 4,

  // 🌟 Balanced shadow on all sides
  elevation: 3, // Android shadow depth
  shadowColor: '#000',
  shadowOpacity: 0.06, // slightly stronger for even visibility
  shadowRadius: 6, // smoother spread
  shadowOffset: { width: 0, height: 0 }, // 👈 makes it equal on all sides
},

  iconWrapper: {
    // backgroundColor will be set dynamically inline
    borderRadius: 25, // Circular background
    padding: 10, // Increased padding around the icon
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5, // Space between icon and text
  },
  icon: {
    width: 35, // Slightly larger icon
    height: 35, // Slightly larger icon
    resizeMode: 'contain',
  },
  name: {
    fontSize: 11, // Adjusted font size
    textAlign: 'center',
    color: '#444',
    marginTop: 0, // Adjusted margin
    lineHeight: 16, // Ensure text wraps nicely
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },

  // Skeleton styles
  skeletonIconWrapper: {
    borderRadius: 25,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    backgroundColor: '#e0e0e0', // Skeleton background color
  },
  skeletonIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5, // Half of width/height for perfect circle
    backgroundColor: '#cccccc', // Darker skeleton color for the icon part
  },
  skeletonText: {
    width: ITEM_WIDTH * 0.7, // Adjust width relative to item width
    height: 10, // Height for text line
    borderRadius: 5,
    backgroundColor: '#e0e0e0', // Skeleton background color
    marginTop: 8,
  },
});

export default TopCategory;