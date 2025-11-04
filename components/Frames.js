import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 30) / 2;
const cardHeight = cardWidth;

const imageSources = {
  Buyer: require('../assets/homeframes/Frame-1.png'),
  Seller: require('../assets/homeframes/Frame-2.png'),
};

const ImageCard = ({ source, onPress, customStyle }) => (
  <TouchableOpacity style={[styles.card, customStyle]} onPress={onPress}>
    <Image source={source} style={styles.image} resizeMode="contain" />
  </TouchableOpacity>
);

const Frames = () => {
  const navigation = useNavigation();

  // 🧠 Redux states
  const user = useSelector((state) => state.user.user);
  const userToken = useSelector((state) => state.user.token);
  const buyer = useSelector((state) => state.buyer.buyer);
  const buyerToken = useSelector((state) => state.buyer.token);

  // 🛒 Buyer navigation logic
  const handleBuyerClick = () => {
    if (buyer && buyerToken) {
      navigation.navigate('BuyerDashboardScreen');
    } else {
      navigation.navigate('BuyerLoginScreen');
    }
  };

  // 🏭 Seller navigation logic
  const handleSellerClick = () => {
    if (user && userToken) {
      navigation.navigate('DashboardScreen');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Sasta Service Dhamaka</Text>
      </View>

      {/* Two equal images side by side */}
      <View style={styles.row}>
        <ImageCard
          source={imageSources.Buyer}
          onPress={handleBuyerClick}
        />
        <ImageCard
          source={imageSources.Seller}
          onPress={handleSellerClick}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Frames;
