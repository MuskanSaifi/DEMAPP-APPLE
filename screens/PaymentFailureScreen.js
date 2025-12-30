import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PaymentFailureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { errorMessage, txnid, amount } = route.params || {};

  return (
    <View style={styles.container}>
      <Ionicons name="close-circle-outline" size={80} color="#E74C3C" />
      <Text style={styles.title}>Payment Failed</Text>

      {txnid && <Text style={styles.detail}>Transaction ID: {txnid}</Text>}
      {amount && <Text style={styles.detail}>Attempted Amount: ₹{amount}</Text>}

      <Text style={styles.message}>
        {errorMessage || "Something went wrong during your payment process."}
      </Text>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => navigation.navigate('PricingPlans')}
      >
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginTop: 10,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  message: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PaymentFailureScreen;
