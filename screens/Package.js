import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { plans } from '../components/PlansData';

const PricingPlans = () => {
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F0F2F5');
    }
  }, []);

  const handleWhatsAppEnquiry = (plan) => {
    const phoneNumber = '+918287427279';
    const message = `Hello, I am interested in the "${plan.title}" plan. Please provide more details.`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'WhatsApp Not Installed',
        'Please ensure WhatsApp is installed on your device to continue.'
      );
    });
  };

  const renderFeature = ([text, included], index) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons
        name={included ? 'checkmark-circle' : 'close-circle-outline'}
        size={20}
        color={included ? '#2ECC71' : '#E74C3C'}
        style={styles.featureIcon}
      />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  const renderPlan = ({ item }) => (
    <View style={[styles.card, item.highlighted && styles.highlightedCard]}>
      {item.highlighted && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>⭐ Popular Choice ⭐</Text>
        </View>
      )}
      <Text
        style={[styles.cardTitle, item.highlighted && styles.highlightedCardTitle]}
      >
        {item.title}
      </Text>

      <View style={styles.featuresContainer}>
        {item.features.map(renderFeature)}
      </View>

      {/* Price visible only on Android */}
      <View style={styles.priceContainer}>
        {Platform.OS !== 'ios' && (
          <>
            <Text style={styles.price}>
              ₹ {Number(item.price).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.gst}>+ 18% GST Per Year</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === 'ios') {
            Linking.openURL(
              'mailto:info@dialexportmart.com?subject=Membership Enquiry'
            );
          } else {
            handleWhatsAppEnquiry(item);
          }
        }}
        style={[styles.payButton, item.highlighted && styles.highlightedPayButton]}
      >
        <Text style={styles.payButtonText}>
          {Platform.OS === 'ios' ? 'Contact Us' : 'Enquire Now'}
        </Text>
        {Platform.OS !== 'ios' && (
          <Ionicons
            name="logo-whatsapp"
            size={20}
            color="#fff"
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.title}>
        Choose Your Perfect <Text style={styles.titleHighlight}>Plan</Text>
      </Text>
      <Text style={styles.subtitle}>
        Unlock powerful features and grow your business with our tailored
        subscription plans.
      </Text>
      <View style={styles.headerSeparator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.flatListContent}
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  flatListContent: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSection: {
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  titleHighlight: { color: '#6A0DAD' },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  headerSeparator: {
    width: '40%',
    height: 4,
    backgroundColor: '#D1C4E9',
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  highlightedCard: {
    borderColor: '#6A0DAD',
    borderWidth: 2,
    shadowColor: '#6A0DAD',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
  },
  ribbon: {
    position: 'absolute',
    top: 45,
    right: -45,
    backgroundColor: '#FF6F00',
    paddingVertical: 8,
    paddingHorizontal: 25,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  ribbonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  highlightedCardTitle: { color: '#6A0DAD' },
  featuresContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  featureIcon: { marginRight: 12 },
  featureText: { fontSize: 16, color: '#444', flexShrink: 1 },
  priceContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  price: { fontSize: 30, fontWeight: '800', color: '#2C3E50' },
  gst: { fontSize: 13, color: '#7F8C8D', marginTop: 5 },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A0DAD',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  highlightedPayButton: { backgroundColor: '#8E44AD' },
  payButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});

export default PricingPlans;
