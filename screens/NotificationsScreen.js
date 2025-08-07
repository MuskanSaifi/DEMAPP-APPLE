import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
  TextInput // Import TextInput for the search bar
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const API_URL = 'https://dialexportmart.com/api/admin/notifications'; 

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false); // New state for sort modal
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query
  const [sortBy, setSortBy] = useState('Newest First'); // New state for sorting

  const route = useRoute();
  const navigation = useNavigation();
  const { params } = route;

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setNotifications(res.data.data);
        setError(null);
      } else {
        setError('Failed to fetch notifications from the server.');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Network error: Could not connect to the server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Logic for filtering and sorting
    let sortedAndFiltered = [...notifications];

    if (searchQuery) {
      sortedAndFiltered = sortedAndFiltered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'Newest First') {
      sortedAndFiltered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'Oldest First') {
      sortedAndFiltered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'Title (A-Z)') {
      sortedAndFiltered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredNotifications(sortedAndFiltered);
  }, [notifications, searchQuery, sortBy]);

  useEffect(() => {
    if (params && params.notificationId) {
      const selected = notifications.find(n => n._id === params.notificationId);
      if (selected) {
        handleCardPress(selected);
      }
    }
  }, [params, notifications]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleCardPress = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };
  
  const handleSortBy = (option) => {
    setSortBy(option);
    setSortModalVisible(false);
  };

  const renderNotification = ({ item }) => {
    const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    const formattedDate = new Date(item.createdAt).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });

    return (
      <TouchableOpacity 
        onPress={() => handleCardPress(item)} 
        activeOpacity={0.7}
        style={styles.notificationCard}
      >
        <View style={styles.notificationContent}>
          <Ionicons name="notifications-outline" size={24} color="#688AF2" style={styles.notificationIcon} />
          <View style={styles.notificationTextContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.notificationDate}>
              {`${formattedTime} | ${formattedDate}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredNotifications.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You have no notification</Text>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#688AF2" />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f4f8" />
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or message..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.sortButton} onPress={() => setSortModalVisible(true)}>
          <Ionicons name="filter" size={20} color="#6B7280" style={styles.sortIcon} />
          <Text style={styles.sortText}>{sortBy}</Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#688AF2" />
        </View>
      ) : (
        renderContent()
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#2D2E49" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
              <Text style={styles.modalMessage}>{selectedNotification?.message}</Text>
              <Text style={styles.modalDate}>
                {selectedNotification ? new Date(selectedNotification.createdAt).toLocaleString() : ''}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* New Modal for sorting options */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity style={styles.sortModalOverlay} onPress={() => setSortModalVisible(false)}>
          <View style={styles.sortModalView}>
            {['Newest First', 'Oldest First', 'Title (A-Z)'].map((option) => (
              <TouchableOpacity 
                key={option}
                style={[styles.sortOption, sortBy === option && styles.activeSortOption]}
                onPress={() => handleSortBy(option)}
              >
                <Text style={[styles.sortOptionText, sortBy === option && styles.activeSortOptionText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  headerRightPlaceholder: {
    width: 28,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchInput: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sortIcon: {
    marginRight: 5,
  },
  sortText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginRight: 5,
  },
  sortModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingRight: 20,
    paddingTop: 150, // Adjust this to position the modal below the sort button
  },
  sortModalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: 150,
  },
  sortOption: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  activeSortOption: {
    backgroundColor: '#EDF2FE', // Light blue background for active option
  },
  activeSortOptionText: {
    color: '#688AF2', // Blue text for active option
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2E49',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
  },
  notificationDate: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyText: {
    fontSize: 16,
    color: '#2D2E49',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: '70%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  modalBody: {
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2E49',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  modalDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#688AF2',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NotificationsScreen;