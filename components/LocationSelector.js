// src/components/LocationSelector.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LocationSelector = ({ selectedState, selectedCity, onStateChange, onCityChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>State Selector (Placeholder)</Text>
      {/* You'll add Picker or TextInput components here */}
      <Text style={styles.label}>City Selector (Placeholder)</Text>
      {/* You'll add Picker or TextInput components here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
});

export default LocationSelector;