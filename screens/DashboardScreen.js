import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
   Platform, StatusBar 
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
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

  useEffect(() => {
    if (route.params?.selectedTab) {
      setActiveScreen(route.params.selectedTab);
      navigation.setParams({ selectedTab: undefined });
    }
  }, [route.params?.selectedTab]);

  const toggleSidebar = () => {
    const toValue = sidebarVisible ? -width * 0.8 : 0;
    Animated.timing(sidebarX, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(!sidebarVisible);
    });
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <Sidebar
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          toggleSidebar={toggleSidebar}
          isVisible={sidebarVisible}
        />
      </Animated.View>

      {/* Backdrop */}
      {sidebarVisible && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
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
      {activeScreen === 'View Products' && <MyProducts />}
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
    backgroundColor: '#f3f4f6', // Very light grey background for overall app
  },
  safeArea: {
    backgroundColor: '#fff', // White header background
    borderBottomLeftRadius: 12, // Slightly less rounded corners
    borderBottomRightRadius: 12,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 5,
    elevation: 2, // For Android shadow
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
  fontSize: 18,
  fontWeight: '600',
  color: '#1F2937',
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd', // Lighter grey border
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: -1 },
  },
  // You'll still need to style the individual BottomTabs component
});

export default DashboardScreen;