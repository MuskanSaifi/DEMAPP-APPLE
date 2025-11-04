import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBarWithSuggestions from '../components/SearchBar';
import BannerSlider from '../components/BannerSlider';
import TopCategory from '../components/TopCategories';
import BottomTabs from '../components/BottomTabs';
import ProductSections from '../components/ProductSections';
import BottomAdd from '../components/BottomAdd';
import Sidebar from '../components/Sidebar';
import Frames from '../components/Frames';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarX = useRef(new Animated.Value(-width * 0.8)).current;
  const [activeScreen, setActiveScreen] = useState('Dashboard');

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

  const renderContent = () => [
    <BannerSlider key="banner" />,
    <TopCategory key="topcategory" />,
    <Frames key="Frames"/>,
    <ProductSections key="productsections1" tag="trending" Name="Trending" />,
    <ProductSections key="productsections2" tag="diwaliOffer" Name="Featured Products" />,
    <ProductSections key="productsections3" tag="holiOffer" Name="Products You May Like" />,
    <BottomAdd key="bottomadd" />,
  ];

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarX }] }]}>
        <Sidebar
          activeScreen={activeScreen}
          setActiveScreen={setActiveScreen}
          toggleSidebar={toggleSidebar}
          navigation={navigation}
        />
      </Animated.View>

      {/* Backdrop */}
      {sidebarVisible && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={toggleSidebar} />
      )}

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <SearchBarWithSuggestions toggleSidebar={toggleSidebar} />
      </View>

      {/* Scrollable Content */}
      <FlatList
        data={renderContent()}
        renderItem={({ item }) => <View style={styles.section}>{item}</View>}
        keyExtractor={(_, index) => index.toString()}
        ListFooterComponent={<View style={{ height: 20 }} />}
        contentContainerStyle={{ paddingTop: 8 }}
        style={styles.content}
      />

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
    backgroundColor: '#fff',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: Dimensions.get('window').height + (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0),
    zIndex: 999,
    elevation: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 5,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: width * 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  searchBarWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    paddingVertical: 0,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    marginBottom: 1,
  },
  section: {
    marginBottom: 6,
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

export default HomeScreen;
