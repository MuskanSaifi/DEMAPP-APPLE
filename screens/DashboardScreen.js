import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Sidebar from '../components/dashboard/Sidebar';
import BottomTabs from '../components/BottomTabs';
import AllPayments from '../components/dashboard/AllPayments';
import DashboardMain from '../components/dashboard/DashboardMain';
import SupportPerson from '../components/dashboard/SupportPerson';
import CustomerLeads from '../components/dashboard/CustomerLeads';
import UserProfile from '../components/dashboard/UserProfile';
import BusinessProfile from '../components/dashboard/BusinessProfile';
import BankDetails from '../components/dashboard/BankDetails';
import MyProducts from '../components/dashboard/MyProducts';
import AddProduct from '../components/dashboard/AddProducts';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-width * 0.8)).current;
  const [activeScreen, setActiveScreen] = useState('Dashboard');
  const route = useRoute();
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook to check if the screen is focused

  useEffect(() => {
    if (route.params?.selectedTab) {
      setActiveScreen(route.params.selectedTab);
      navigation.setParams({ selectedTab: undefined });
    }
  }, [route.params?.selectedTab]);

  // Use useEffect to close the sidebar when the screen is blurred
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Close the sidebar when the screen loses focus
      if (sidebarVisible) {
        toggleSidebar();
      }
    });

    return unsubscribe;
  }, [navigation, sidebarVisible]);

const toggleSidebar = () => {
  if (!sidebarVisible) {
    // OPEN: First show sidebar, then animate in
    setSidebarVisible(true);
    Animated.timing(sidebarX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  } else {
    // CLOSE: Animate out, then hide sidebar
    Animated.timing(sidebarX, {
      toValue: -width * 0.8,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
  }
};


  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Sidebar and Backdrop are only rendered if the sidebar is visible */}
      {sidebarVisible && isFocused && (
        <>
          {/* Sidebar */}
          <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
            <Sidebar
              activeScreen={activeScreen}
              setActiveScreen={setActiveScreen}
              toggleSidebar={toggleSidebar}
              isVisible={sidebarVisible}
              navigation={navigation}
            />
          </Animated.View>

          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={toggleSidebar}
          />
        </>
      )}

      {/* Header */}
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>{activeScreen}</Text>
            <TouchableOpacity style={styles.hamburger} onPress={toggleSidebar}>
              <Icon name="menu" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      {activeScreen === 'Dashboard' && <DashboardMain setActiveScreen={setActiveScreen} />}
      {activeScreen === 'Payments' && <AllPayments />}
      {activeScreen === 'Support Person' && <SupportPerson />}
      {activeScreen === 'Customer Leads' && <CustomerLeads />}
      {activeScreen === 'User Profile' && <UserProfile />}
      {activeScreen === 'Business Profile' && <BusinessProfile />}
      {activeScreen === 'Bank Details' && <BankDetails />}
      {activeScreen === 'My Products' && <MyProducts />}
      {activeScreen === 'Add Product' && <AddProduct />}

      {/* Bottom Tabs */}
      <View style={styles.bottomTabsContainer}>
        <BottomTabs />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {

    flex: 1,
    backgroundColor: '#FFF', // Very light grey background for overall app
  },

  safeArea: {
    backgroundColor: '#FFF', // White header background
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop:10,
     borderBottomWidth: 1,
  borderBottomColor: '#e0e0e0', // light gray (you can change as needed)
  },

  header: {
    width: '100%',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6D4AAE',
    marginLeft: 12,
    textTransform: 'capitalize',
  },

  hamburger: {
    margin: 5,
  },
  
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: Dimensions.get('window').height + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    zIndex: 999,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly lighter backdrop
  },
  bottomTabsContainer: {
  position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
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

export default DashboardScreen;