import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Packages = () => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const aspectRatio = 90 / 301; // height / width of your image

  const handleNavigate = () => {
    navigation.navigate('PricingPlans'); // 👈 Navigate to your payment screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigate} activeOpacity={0.8}>
        <Image
          source={require('../assets/packages.png')}
          style={{
            width: screenWidth,
            height: screenWidth * aspectRatio,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Packages;
