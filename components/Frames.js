import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 30) / 2; // two columns with 20px total margin
const cardHeight = 77.5;

const imageSources = {
  sellOn: require('../assets/homeframes/Frame1.png'),
  buyRequirement: require('../assets/homeframes/Frame2.png'),
  appointment: require('../assets/homeframes/Frame3.png'),
};

const ImageCard = ({ source, onPress, customStyle }) => (
  <TouchableOpacity style={[styles.card, customStyle]} onPress={onPress}>
<Image source={source} style={styles.image} resizeMode="contain" />
  </TouchableOpacity>
);

const Frames = () => {
  return (
    <View style={styles.container}>
            {/* Heading and View All */}
            <View style={styles.headerRow}>
              <Text style={styles.heading}>Sasta Service Dhamaka</Text>
            </View>
      <View style={styles.row}>
        {/* Left side: SellOn */}
        <ImageCard
          source={imageSources.sellOn}
          onPress={() => console.log('Sell on TradeIndia clicked')}
          customStyle={{ height: cardHeight * 2 + 10 }} // Make it full height of right column
        />

        {/* Right side: two stacked cards */}
        <View style={styles.column}>
          <ImageCard
            source={imageSources.buyRequirement}
            onPress={() => console.log('Buy Requirement clicked')}
          />
          <ImageCard
            source={imageSources.appointment}
            onPress={() => console.log('Appointment clicked')}
            customStyle={{ marginTop: 5 }}
          />
        </View>
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
  column: {
    flexDirection: 'column',
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
