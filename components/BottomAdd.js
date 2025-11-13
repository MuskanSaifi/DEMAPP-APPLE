import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const BottomAdd = () => {
  const screenWidth = Dimensions.get('window').width;
  const aspectRatio = 500 / 500; // height / width of your image

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/BootomAdd.png')}
        style={{
          width: screenWidth,
          height: screenWidth * aspectRatio,
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
});

export default BottomAdd;
