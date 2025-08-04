import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.75;
const SPACING = 20;
const SIDE_SPACING = (width - CARD_WIDTH) / 2;

const testimonials = [
  {
    id: '1',
    name: 'Anjali Sharma',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    testimonial: 'Amazing platform! Found the best suppliers here.',
    company: 'Kraft India',
  },
  {
    id: '2',
    name: 'Rohit Verma',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    testimonial: 'Helped me scale my export business easily.',
    company: 'Global Traders',
  },
  {
    id: '3',
    name: 'Neha Kapoor',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    testimonial: 'Smooth experience and great support!',
    company: 'Elite Exports',
  },
  {
    id: '4',
    name: 'Amit Joshi',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    testimonial: 'Reliable and fast service every time.',
    company: 'Prime Exports',
  },
  {
    id: '5',
    name: 'Sunita Reddy',
    avatar: 'https://randomuser.me/api/portraits/women/77.jpg',
    testimonial: 'The best export platform I have ever used.',
    company: 'Sunshine Traders',
  },
];

const TestimonialSlider = () => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      setCurrentIndex(nextIndex);
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderItem = ({ item, index }) => {
    // Animated scale for active card
    const inputRange = [
      (index - 1) * (CARD_WIDTH + SPACING),
      index * (CARD_WIDTH + SPACING),
      (index + 1) * (CARD_WIDTH + SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        </View>
        <Text style={styles.testimonial}>"{item.testimonial}"</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.company}>{item.company}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>What Our Users Say</Text>

      <Animated.FlatList
        ref={flatListRef}
        data={testimonials}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SIDE_SPACING }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={ev => {
          const newIndex = Math.round(ev.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
          setCurrentIndex(newIndex);
        }}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH + SPACING,
          offset: (CARD_WIDTH + SPACING) * index,
          index,
        })}
      />

      {/* Dot Indicator */}
      <View style={styles.dotContainer}>
        {testimonials.map((_, i) => {
          const opacity = currentIndex === i ? 1 : 0.3;
          const scale = currentIndex === i ? 1.3 : 1;
          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, { opacity, transform: [{ scale }] }]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingVertical: 15,
    backgroundColor: '#f0f4ff', // light bluish background for contrast
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4B0082', // deep purple
    textShadowColor: 'rgba(75,0,130,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    marginRight: SPACING,
    marginVertical: SPACING / 2,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#6D4AAE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d3d0f7',
  },
  avatarContainer: {
    borderWidth: 4,
    borderColor: '#6D4AAE',
    borderRadius: 40,
    padding: 2,
    marginBottom: 15,
    backgroundColor: '#EDE7F6',
    shadowColor: '#6D4AAE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  testimonial: {
    fontStyle: 'italic',
    fontSize: 18,
    textAlign: 'center',
    color: '#4B0082',
    marginBottom: 14,
    lineHeight: 24,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#311B92',
  },
  company: {
    color: '#7E57C2',
    fontSize: 14,
    marginTop: 4,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6D4AAE',
    marginHorizontal: 6,
  },
});

export default TestimonialSlider;
