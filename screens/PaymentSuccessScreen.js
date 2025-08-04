// PaymentSuccessScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native'; // If you need to access route params

const PaymentSuccessScreen = () => {
    const route = useRoute();
    const { txnid, amount, package: packageName } = route.params || {}; // Access params from the URL

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Payment Successful!</Text>
            {txnid && <Text style={styles.detail}>Transaction ID: {txnid}</Text>}
            {amount && <Text style={styles.detail}>Amount Paid: ₹{amount}</Text>}
            {packageName && <Text style={styles.detail}>Package: {packageName}</Text>}
            <Text style={styles.message}>Thank you for your purchase!</Text>
            {/* You might want to add a button to go to home or dashboard */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f8ff', // Light blue background
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#28a745', // Green color
    },
    detail: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    message: {
        fontSize: 18,
        marginTop: 20,
        textAlign: 'center',
        color: '#666',
    },
});

export default PaymentSuccessScreen;