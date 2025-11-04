import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const tabItems = [
  { label: 'Home', icon: 'home-outline' },
  { label: 'Message', icon: 'chatbubbles-outline' },
  { label: 'Services', icon: 'layers-outline', type: 'special' },
  { label: 'Category', icon: 'grid-outline' },
  { label: 'Account', icon: 'person-outline' },
];

const BottomTabs = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  const serviceIconAnim = useRef(new Animated.Value(1)).current;
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const user = useSelector((state) => state.user.user);

  const serviceItems = [
{ name: 'Buy Leads', icon: 'bulb-outline' },
{ name: 'Our Plans', icon: 'wallet-outline', route: 'PricingPlans' },
{ name: 'Google Listing', icon: 'globe-outline' },
{ name: 'Wishlist', icon: 'heart-outline', route: 'WishlistScreen', count: wishlistCount },
{ name: 'GetDomain', icon: 'at-outline' },
{ name: 'Categories', icon: 'list-outline', route: 'AllCategories' },
{ name: 'Notifications', icon: 'notifications-outline', route: 'NotificationsScreen'},
{ name: 'Buyer Dashboard', icon: 'notifications-outline', route: 'BuyerDashboardScreen'},
{ name: 'Buy Sell', icon: 'notifications-outline', route: 'BuySell'},
// { name: 'More...', icon: 'ellipsis-horizontal-circle-outline' },
  ];

  const animateServiceIcon = () => {
    serviceIconAnim.setValue(1);
    Animated.spring(serviceIconAnim, {
      toValue: 1.2,
      friction: 2,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(serviceIconAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);

    if (tab === 'Services') {
      setIsModalVisible(true);
      animateServiceIcon();
    } else {
      setIsModalVisible(false);
    }

    if (tab === 'Home') {
      navigation.navigate('Home');
    } else if (tab === 'Category') {
      navigation.navigate('AllCategories');
    } else if (tab === 'Account') {
      if (user) {
        navigation.navigate("DashboardScreen");
      } else {
        navigation.navigate("Login");
      }
    } else if (tab === 'Message') {
      navigation.navigate('NotificationsScreen');
    }
  };

  const handleServiceItemPress = (item) => {
    setIsModalVisible(false);
    if (item.route) {
      navigation.navigate(item.route);
    } else {
      console.log(`Service "${item.name}" clicked!`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Your main screen content goes here */}

      {/* Services Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Useful Links</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.serviceGrid}>
              {serviceItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.serviceItem}
                  onPress={() => handleServiceItemPress(item)}
                >
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name={item.icon} size={30} color="#6D4AAE" />
                    {item.count > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{item.count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.serviceLabel}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabItems.map((tab, index) => {
          const isActive = activeTab === tab.label;
          const isSpecialTab = tab.type === 'special';

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleTabPress(tab.label)}
              style={[
                styles.tabItem,
                isSpecialTab ? styles.specialTabItem : styles.regularTabItem,
              ]}
            >
              {isSpecialTab ? (
                <Animated.View style={{ transform: [{ scale: serviceIconAnim }] }}>
                  <Ionicons name={tab.icon} size={32} color={'#fff'} />
                </Animated.View>
              ) : (
                <Ionicons
                  name={tab.icon}
                  size={22}
                  color={isActive ? '#6D4AAE' : '#888'}
                />
              )}
              {!isSpecialTab && (
                <Text
                  style={[styles.tabLabel, isActive && styles.activeTabLabel]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
tabBar: {
  position: 'absolute',
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingVertical: Platform.OS === "ios" ? 12 : 10,
  minHeight: 60,
},

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  regularTabItem: {
    width: width / 6,
  },
  specialTabItem: {
    backgroundColor: '#6D4AAE',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
    transform: [{ translateY: -5 }],
    flex: 0,
  },
  tabLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#6D4AAE',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: height * 0.65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D4AAE',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  serviceItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 25,
  },
  serviceIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
    marginTop: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BottomTabs;
