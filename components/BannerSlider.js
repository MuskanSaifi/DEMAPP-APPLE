import React from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const aspectRatio = 453 / 1066; // height / width = 0.5

const banners = [
  { id: '1', image: require('../assets/banner-1.png') },
  { id: '2', image: require('../assets/banner-2.png') },
  { id: '3', image: require('../assets/banner-3.png') },
  { id: '4', image: require('../assets/banner-4.png') },
];

const BannerSlider = () => {
  return (
    <View style={styles.wrapper}>
      <FlatList
        horizontal
        data={banners}
        renderItem={({ item }) => (
          <Image
            source={item.image}
            style={{ width: width, height: width * aspectRatio }}
            resizeMode="contain" // Keeps full image visible
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
});

export default BannerSlider;
