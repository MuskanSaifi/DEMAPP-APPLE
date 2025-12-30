import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform
} from "react-native";
import axios from "axios";

const { width } = Dimensions.get("window");
const aspectRatio = 453 / 1066; // height / width

const BannerSlider = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch banners from backend
  const fetchBanners = async () => {
    try {
      const res = await axios.get(
        "https://www.dialexportmart.com/api/adminprofile/banner?platform=app"
      );
  
      if (res.data.success) {
        setBanners(res.data.banners);
      }
    } catch (error) {
      console.error("Failed to load banners:", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchBanners();
  }, []);

  // 🖱 Handle tap on banner
  const handleBannerClick = (link) => {
    if (!link) return;
    if (link.startsWith("http")) {
      Linking.openURL(link);
    } else if (navigation) {
      navigation.navigate(link);
    }
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // ❌ No banners fallback
  if (banners.length === 0) {
    return (
      <View style={styles.noBanner}>
        <Image
          source={{
            uri: "https://via.placeholder.com/600x250.png?text=No+Banners+Available",
          }}
          style={styles.noBannerImage}
        />
      </View>
    );
  }

  // ✅ Render banners
  return (
    <View style={styles.wrapper}>
      <FlatList
  horizontal
  data={banners}
  renderItem={({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleBannerClick(item.link)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: width, height: width * aspectRatio }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  )}
  keyExtractor={(item) => item._id || item.id}
  showsHorizontalScrollIndicator={false}
  pagingEnabled
  snapToInterval={width}
  decelerationRate="fast"
  disableIntervalMomentum   // ✅ smooth scroll on Android
  removeClippedSubviews={false}  // ✅ prevents clipping issue
  automaticallyAdjustContentInsets={false} // ✅ ensures equal margin behavior
  contentContainerStyle={{ paddingTop: 0 }} // ✅ aligns top properly
/>

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
  marginTop: Platform.OS === "android" ? 45 : 1, // ✅ balance top spacing
  overflow: "hidden",
},

  loader: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
  },
  noBanner: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
  },
  noBannerImage: {
    width: 150,
    height: 100,
    resizeMode: "contain",
    opacity: 0.6,
  },
});

export default BannerSlider;
