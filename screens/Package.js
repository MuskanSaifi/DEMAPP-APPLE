import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  SafeAreaView, // Use SafeAreaView for better iOS handling
  StatusBar, // For status bar styling
  Platform, // For platform-specific adjustments
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext'; // Assuming you have an AuthContext
import { plans } from '../components/PlansData'; // Assuming PlansData.js exists

const PricingPlans = () => {
  const { user, token } = useContext(AuthContext); // user and token might be used for payment
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const navigation = useNavigation();

  // Set status bar style for a cleaner look when this screen is active
  React.useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F0F2F5'); // Match container background
    }
  }, []);

  const handlePayNowClick = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleFixedAmount = () => {
    const numericPrice = parseFloat(selectedPlan.price);
    const numericAmount = numericPrice + (numericPrice * 0.18); // Apply 18% GST
    setShowModal(false); // Close modal before navigating
    navigation.navigate('PaymentScreen', {
      amount: numericAmount,
      packageName: selectedPlan.title,
      totalAmount: numericAmount, // Total amount including GST
      gstPercentage: 18,
      basePrice: numericPrice,
    });
  };

  const handleProceedCustom = () => {
    const amount = Number(customAmount);
    if (!amount || isNaN(amount) || amount < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
      return;
    }
    setShowModal(false); // Close modal before navigating
    navigation.navigate('PaymentScreen', {
      amount: amount, // Custom amount is the total amount
      packageName: selectedPlan.title,
      totalAmount: amount,
      gstPercentage: 0, // Assuming custom amount might be inclusive of GST, or handled separately
      basePrice: amount, // For custom, base and total might be same unless you calculate GST separately
    });
  };

  const renderFeature = ([text, included], index) => (
    <View key={index} style={styles.featureItem}>
      <Ionicons
        name={included ? 'checkmark-circle' : 'close-circle-outline'} // Changed 'close-circle' to 'close-circle-outline' for better visual
        size={20} // Slightly larger icons
        color={included ? '#2ECC71' : '#E74C3C'} // Brighter green and red
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
      <Text style={[styles.cardTitle, item.highlighted && styles.highlightedCardTitle]}>
        {item.title}
      </Text>
      <View style={styles.featuresContainer}>
        {item.features.map(renderFeature)}
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹ {Number(item.price).toLocaleString('en-IN')}</Text>
        <Text style={styles.gst}>+ 18% GST Per Year</Text>
      </View>
      <TouchableOpacity
        onPress={() => handlePayNowClick(item)}
        style={[styles.payButton, item.highlighted && styles.highlightedPayButton]}
      >
        <Text style={styles.payButtonText}>Choose Plan</Text>
        <Ionicons name="arrow-forward-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.title}>
        Choose Your Perfect <Text style={styles.titleHighlight}>Plan</Text>
      </Text>
      <Text style={styles.subtitle}>
        Unlock powerful features and grow your business with our tailored subscription plans.
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

      {/* MODAL */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade" // Changed to fade for smoother appearance
        onRequestClose={() => {
          setShowModal(false);
          setShowCustomInput(false);
          setCustomAmount('');
        }}
      >
        <TouchableOpacity // Overlay for closing modal on tap outside
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowModal(false);
            setShowCustomInput(false);
            setCustomAmount('');
          }}
        >
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowModal(false);
                setShowCustomInput(false);
                setCustomAmount('');
              }}
            >
              <Ionicons name="close" size={28} color="#777" />
            </TouchableOpacity>

            <Text style={styles.modalHeaderTitle}>
              Confirm <Text style={{ fontWeight: 'bold', color: '#6A0DAD' }}>{selectedPlan?.title}</Text> Purchase
            </Text>
            <Text style={styles.modalSubtitle}>
              You are about to subscribe to the {selectedPlan?.title} plan.
              Please choose your payment option.
            </Text>

            {!showCustomInput ? (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.fullAmountButton}
                  onPress={handleFixedAmount}
                >
                  <Text style={styles.fullAmountButtonText}>
                    Pay Full Amount (₹ {Number(selectedPlan?.price * 1.18 || 0).toLocaleString('en-IN')})
                  </Text>
                  <Text style={styles.buttonSubtext}>Includes 18% GST</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.customAmountButton}
                  onPress={() => setShowCustomInput(true)}
                >
                  <Text style={styles.customAmountButtonText}>Pay Custom Amount</Text>
                  <Text style={styles.buttonSubtext}>Define your own payment amount</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter custom amount (e.g., 5000)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                />
                <TouchableOpacity
                  style={styles.proceedButton}
                  onPress={handleProceedCustom}
                >
                  <Text style={styles.proceedButtonText}>
                    Proceed to Pay ₹{Number(customAmount || 0).toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowCustomInput(false)}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light grey background
  },
  flatListContent: {
    paddingTop: 10,
    paddingHorizontal: 20, // Keep some horizontal padding
    paddingBottom: 20, // Add padding at the bottom of the list
  },
  headerSection: {
    paddingVertical: 25,
    paddingHorizontal: 5, // Match flatListContent padding
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background for header
    marginBottom: 20, // Space below the header
    borderRadius: 15, // Rounded corners for header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32, // Larger, more impactful title
    fontWeight: '800', // Extra bold
    textAlign: 'center',
    color: '#333333', // Darker text
    marginBottom: 8,
  },
  titleHighlight: {
    color: '#6A0DAD', // A vibrant purple for highlights
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  headerSeparator: {
    width: '40%', // Shorter, more subtle separator
    height: 4,
    backgroundColor: '#D1C4E9', // Lighter purple accent
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20, // More rounded corners
    marginBottom: 25, // Increased space between cards
    elevation: 8, // More pronounced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden', // Ensure ribbon doesn't overflow
  },
  highlightedCard: {
    borderColor: '#6A0DAD', // Highlighted with the primary accent color
    borderWidth: 2, // Thicker border for highlight
    shadowColor: '#6A0DAD', // Shadow also matches accent color
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
  },
  ribbon: {
    position: 'absolute',
    top: 45,
    right: -45, // Adjust to make it look like it's coming from the corner
    backgroundColor: '#FF6F00', // Orange accent for popular
    paddingVertical: 8,
    paddingHorizontal: 25,
    transform: [{ rotate: '45deg' }], // Diagonal ribbon
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  ribbonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 24, // Larger title for cards
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333333',
  },
  highlightedCardTitle: {
    color: '#6A0DAD',
  },
  featuresContainer: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0', // Subtle separator for features
    paddingTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    marginRight: 12, // More space
  },
  featureText: {
    fontSize: 16,
    color: '#444444',
    flexShrink: 1, // Allow text to wrap
  },
  priceContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  price: {
    fontSize: 30, // Large and prominent price
    fontWeight: '800',
    color: '#2C3E50', // Darker grey for price
  },
  gst: {
    fontSize: 13,
    color: '#7F8C8D', // Muted grey for GST
    marginTop: 5,
  },
  payButton: {
    flexDirection: 'row', // Align icon and text
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A0DAD', // Primary accent color
    paddingVertical: 14, // Taller button
    borderRadius: 12, // More rounded button
    elevation: 5,
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  highlightedPayButton: {
    backgroundColor: '#8E44AD', // Slightly darker purple for highlighted button
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17, // Larger text
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // More rounded
    padding: 30,
    width: '90%',
    maxWidth: 450,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 15,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 8,
    backgroundColor: '#F0F0F0', // Light background for close button
    borderRadius: 20,
    zIndex: 1,
  },
  modalHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButtons: {
    width: '100%',
    gap: 15, // Increased gap
  },
  fullAmountButton: {
    backgroundColor: '#27AE60', // Green for positive action
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  fullAmountButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',  
    fontSize: 17,
  },
  buttonSubtext: {
    color: '#E0E0E0',
    fontSize: 12,
    marginTop: 3,
  },
  customAmountButton: {
    borderColor: '#6A0DAD', // Primary accent color border
    borderWidth: 2,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAmountButtonText: {
    color: '#6A0DAD',
    fontWeight: '700',
    fontSize: 17,
  },
  customInputContainer: {
    width: '100%',
    gap: 15,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#BBDEFB', // Light blue border
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F8F8', // Slightly grey background for input
  },
  proceedButton: {
    backgroundColor: '#6A0DAD',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#6A0DAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#7F8C8D', // Muted grey
    fontSize: 15,
    fontWeight: '600',
  },
});

export default PricingPlans;