import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Assuming IndianLocation is an array of objects like:
// [{ state: "State A", cities: ["City 1", "City 2"] }, ...]
import { IndianLocation } from './Indianlocation';
import { Picker } from '@react-native-picker/picker'; // Install this package: npm install @react-native-picker/picker

const LocationSelector = ({ formData, setFormData }) => {
    // Determine the list of cities based on the selected state
    const selectedState = IndianLocation.find(
        (state) => state.state === formData.basicDetails?.state
    );
    const cities = selectedState ? selectedState.cities : [];

    // Handler for State change
    const handleStateChange = (itemValue) => {
        setFormData((prev) => ({
            ...prev,
            basicDetails: { 
                ...prev.basicDetails, 
                state: itemValue, 
                city: "" // Reset city when state changes
            },
        }));
    };

    // Handler for City change
    const handleCityChange = (itemValue) => {
        setFormData((prev) => ({
            ...prev,
            basicDetails: { 
                ...prev.basicDetails, 
                city: itemValue 
            },
        }));
    };

    const isCityDisabled = !formData.basicDetails?.state;

    return (
        <View style={styles.container}>
            {/* State Dropdown (Picker) */}
            <View style={styles.pickerWrapper}>
                <Text style={styles.label}>State</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={formData.basicDetails?.state || ''}
                        onValueChange={handleStateChange}
                        style={styles.picker}
                        // For Android, this sets the default item text color
                        itemStyle={{ color: 'black' }} 
                    >
                        <Picker.Item label="Select State" value="" />
                        {IndianLocation.map((state) => (
                            <Picker.Item 
                                key={state.state} 
                                label={state.state} 
                                value={state.state} 
                            />
                        ))}
                    </Picker>
                </View>
            </View>

            {/* City Dropdown (Picker) */}
            <View style={styles.pickerWrapper}>
                <Text style={styles.label}>City</Text>
                <View 
                    style={[
                        styles.pickerContainer, 
                        isCityDisabled && styles.disabledPicker
                    ]}
                >
                    <Picker
                        selectedValue={formData.basicDetails?.city || ''}
                        onValueChange={handleCityChange}
                        enabled={!isCityDisabled} // Disable interaction if no state is selected
                        style={styles.picker}
                        itemStyle={{ color: isCityDisabled ? 'gray' : 'black' }} 
                    >
                        <Picker.Item label="Select City" value="" />
                        {cities.map((city) => (
                            <Picker.Item 
                                key={city} 
                                label={city} 
                                value={city} 
                            />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        // Equivalent to d-flex justify-content-between
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pickerWrapper: {
        // Makes each picker take up roughly half the space
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
        color: '#333',
    },
    pickerContainer: {
        // Style equivalent to form-control wrapper
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        overflow: 'hidden',
        // Increased height here
        height: 150, 
        justifyContent: 'center',
        marginBottom: 15,
    },
    disabledPicker: {
        backgroundColor: '#f0f0f0',
        opacity: 0.6,
    },
    picker: {
        width: '100%',
        height: 145, 
    },
});

export default LocationSelector;