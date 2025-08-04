import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSelector } from 'react-redux'; // This will now work correctly!
import AsyncStorage from '@react-native-async-storage/async-storage'; // For persistent storage

const Buyfrom = ({ product, sellerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [countryCode] = useState('+91'); // Assuming India
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [buyerId, setBuyerId] = useState(null);
  const [isLoadingBuyer, setIsLoadingBuyer] = useState(false);

  // This useSelector will now correctly retrieve the user from the Redux store
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const initializeBuyer = async () => {
      setIsLoadingBuyer(true);
      const currentProductName = product?.name || 'Unknown Product';

      let buyerDataToSend = {};
      let initialStep = 1;

      // Prioritize logged-in user data from Redux
      if (user && user._id) {
        buyerDataToSend = {
          fullname: user.fullname || '',
          email: user.email || '',
          mobileNumber: user.mobileNumber || '',
          countryCode: user.countryCode || '+91',
          productname: currentProductName,
        };
        initialStep = 2;
        // Also pre-fill the form fields with user data from Redux
        setFullname(user.fullname || '');
        setEmail(user.email || '');
        setPhone(user.mobileNumber || '');
      } else {
        // Fallback to AsyncStorage for guests
        try {
          const savedPhone = await AsyncStorage.getItem('buyerPhone');
          const savedFullname = await AsyncStorage.getItem('buyerFullname');
          const savedEmail = await AsyncStorage.getItem('buyerEmail');

          if (savedPhone && savedFullname && savedEmail) {
            buyerDataToSend = {
              fullname: savedFullname,
              email: savedEmail,
              mobileNumber: savedPhone,
              countryCode, // Assuming default +91 for guests from AsyncStorage
              productname: currentProductName,
            };
            initialStep = 2;
            // Pre-fill the form fields with guest data
            setFullname(savedFullname);
            setEmail(savedEmail);
            setPhone(savedPhone);
          } else {
            initialStep = 1;
          }
        } catch (e) {
          console.error('Failed to load guest data from AsyncStorage:', e);
          initialStep = 1;
        }
      }

      if (Object.keys(buyerDataToSend).length > 0) {
        // We already set phone, fullname, email above based on user/asyncStorage
        setStep(initialStep);

        try {
          // Replace with your actual API endpoint
          const res = await fetch('https://www.dialexportmart.com/api/buyer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buyerDataToSend),
          });

          const data = await res.json();

          if (res.ok && data.buyer && data.buyer._id) {
            setBuyerId(data.buyer._id);
            // Update form fields with data returned from API, if they differ or are more complete
            setFullname(data.buyer.fullname || fullname); // Keep current if API sends empty
            setEmail(data.buyer.email || email);
            setPhone(data.buyer.mobileNumber || phone);
            setStep(2);
            console.log('Buyer initialized/updated successfully:', data.message);
          } else {
            console.warn('Failed to initialize/authenticate buyer:', data.error || 'Unknown error');
            setStep(1); // Force to step 1 if API fails to provide buyer ID
            setBuyerId(null);
            if (!user?._id) { // Only clear AsyncStorage if it's a guest session
              await AsyncStorage.multiRemove(['buyerPhone', 'buyerFullname', 'buyerEmail']);
            }
          }
        } catch (error) {
          console.error('Error during buyer initialization:', error);
          setStep(1); // Force to step 1 on network error
          setBuyerId(null);
          if (!user?._id) { // Only clear AsyncStorage if it's a guest session
            await AsyncStorage.multiRemove(['buyerPhone', 'buyerFullname', 'buyerEmail']);
          }
        }
      } else {
        setStep(1);
        setBuyerId(null);
      }
      setIsLoadingBuyer(false);
    };

    if (isOpen) {
      initializeBuyer();
    }
  }, [isOpen, user, product?.name]); // Dependency array: user is now a dependency

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (isOpen && !buyerId) { // Only reset if closing and no buyerId was established
      setStep(1);
      setPhone('');
      setFullname('');
      setEmail('');
      setBuyerId(null);
    }
  };

  const handleNext = async () => {
    if (phone.trim() === '' || phone.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid 10-digit phone number.');
      return;
    }

    if (!fullname.trim() || !email.trim()) {
      Alert.alert('Missing Information', 'Please fill in your full name and email.');
      return;
    }

    try {
      // Save guest data only if not logged in (user will be null or undefined if not logged in via Redux)
      if (!user?._id) {
        await AsyncStorage.setItem('buyerPhone', phone);
        await AsyncStorage.setItem('buyerFullname', fullname);
        await AsyncStorage.setItem('buyerEmail', email);
      }

      const buyerPayload = {
        fullname,
        email,
        mobileNumber: phone,
        countryCode,
        productname: product?.name || 'Unknown Product',
      };

      // Replace with your actual API endpoint
      const res = await fetch('https://www.dialexportmart.com/api/buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buyerPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Error creating/retrieving buyer:', data.error);
        Alert.alert('Error', data.error || 'Error saving buyer information. Please try again.');
        return;
      }

      if (data.buyer && data.buyer._id) {
        setBuyerId(data.buyer._id);
        setStep(2);
      } else {
        Alert.alert('Error', 'Failed to obtain buyer ID from server. Please try again.');
      }
    } catch (error) {
      console.error('Network or server error during buyer registration:', error);
      Alert.alert('Network Error', 'Server error during buyer registration. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!buyerId) {
        Alert.alert('Error', 'Buyer information not established. Please go back to step 1.');
        setStep(1); // Force to step 1
        return;
    }
    if (quantity <= 0 || !Number.isInteger(quantity)) {
        Alert.alert('Invalid Quantity', 'Please enter a valid positive whole number for quantity.');
        return;
    }

    const orderData = {
      product: product._id,
      quantity,
      unit: product.unit,
      approxOrderValue: {
        amount: product.tradeShopping?.slabPricing?.[0]?.price || product.price,
        currency: 'INR',
      },
      buyer: buyerId,
      requirementFrequency: 'one-time',
      seller: sellerId,
    };

    try {
      // Replace with your actual API endpoint
      const res = await fetch('https://www.dialexportmart.com/api/purchaserequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.warn('No JSON response or empty response from /api/purchaserequest:', jsonErr);
      }

      if (res.ok) {
        Alert.alert('Order Submitted!', 'Your order has been submitted successfully!', [
          { text: 'OK', onPress: () => setIsOpen(false) }
        ]);
      } else {
        console.error('Error response from /api/purchaserequest:', data);
        Alert.alert('Order Failed', data?.error || 'Something went wrong submitting your order.');
      }
    } catch (err) {
      console.error('API Error during order submission:', err);
      Alert.alert('Server Error', 'Server error during order submission. Please try again.');
    }
  };

  return (
    <>
      <TouchableOpacity onPress={toggleModal} style={styles.purchaseButton}>
        <Text style={styles.purchaseButtonText}>🛒 Send Enquiry</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={toggleModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>&times;</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Confirm Purchase</Text>

            {isLoadingBuyer ? (
              <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            ) : (
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {step === 1 && (
                  <>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      value={fullname}
                      onChangeText={setFullname}
                      placeholder="Your full name"
                      autoCapitalize="words"
                    />
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                      <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                  </>
                )}

                {step === 2 && (
                  <View>
                    <Text style={styles.productName}>Product: {product.name}</Text>
                    <View style={styles.quantityContainer}>
                      <Text style={styles.label}>Quantity</Text>
                      <TextInput
                        style={styles.input}
                        value={quantity === 0 || quantity === '' ? '' : String(quantity)}
                        onChangeText={(val) => {
                          if (val === '') {
                            setQuantity('');
                          } else {
                            const parsedVal = parseInt(val, 10);
                            if (!isNaN(parsedVal)) {
                              setQuantity(parsedVal);
                            }
                          }
                        }}
                        keyboardType="numeric"
                        min="1"
                      />
                    </View>
                    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                      <Text style={styles.buttonText}>Submit Order</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  purchaseButton: {
    width: '100%',
 backgroundColor: '#3CB371', // solid dark green
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  purchaseButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeButtonText: {
    color: '#6b7280', // gray-600
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
  label: {
    marginBottom: 8,
    color: '#374151', // gray-700
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  quantityContainer: {
    marginBottom: 15,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default Buyfrom;
