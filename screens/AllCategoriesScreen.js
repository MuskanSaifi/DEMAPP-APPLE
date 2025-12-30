import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_COLORS = [
  '#FFDDC1', '#D4EDDA', '#CCE5FF', '#FFF3CD', '#F8D7DA',
  '#E2E3E5', '#D1ECF1', '#FDDDE6', '#E6FFDD', '#DDDDFF',
];

const AllCategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://dialexportmart.com/api/home/appapi/homecategories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
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
    const backgroundColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    const categoryName = typeof item.name === 'string' ? item.name : 'Unnamed';
    const iconUri = typeof item.icon === 'string' && item.icon.startsWith('http')
      ? item.icon
      : 'https://via.placeholder.com/44';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('CategoryScreen', { category: item })}
      >
        <View style={[styles.iconWrapper, { backgroundColor }]}>
          <Image source={{ uri: iconUri }} style={styles.icon} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{categoryName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  const SkeletonItem = () => (
    <View style={styles.card}>
      <View style={styles.skeletonIcon} />
      <View style={styles.textWrapper}>
        <View style={styles.skeletonText} />
      </View>
      <View style={styles.skeletonArrow} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[...Array(10).keys()]}
          renderItem={() => <SkeletonItem />}
          keyExtractor={(item, index) => `skeleton-${index}`}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#FF6347" />
        <Text style={styles.errorText}>Failed to load categories.</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={50} color="#888" />
            <Text style={styles.emptyText}>No categories found.</Text>
          </View>
        }
      />
    </View>
  );
};

export default AllCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  list: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ccc',
    marginRight: 15,
  },
  skeletonText: {
    width: '50%',
    height: 14,
    backgroundColor: '#ccc',
    borderRadius: 4,
  },
  skeletonArrow: {
    width: 20,
    height: 20,
    backgroundColor: '#ccc',
    borderRadius: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    marginTop: 10,
  },
  errorMessage: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
});
