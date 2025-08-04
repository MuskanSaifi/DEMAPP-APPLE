// PaymentScreen.js

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Linking } from 'react-native'; // Import Linking
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useNavigation
import { AuthContext } from '../context/AuthContext';
import { WebView } from 'react-native-webview';

const PaymentScreen = () => {
    const route = useRoute();
    const navigation = useNavigation(); // Get navigation object
    const { user } = useContext(AuthContext);
    const { amount, packageName, totalAmount } = route.params || {};
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentParams, setPaymentParams] = useState(null);
    const [paymentAction, setPaymentAction] = useState(null);

    useEffect(() => {
        const initiatePayment = async () => {
            if (!user || !amount || !packageName || !totalAmount) {
                console.error("Missing user or payment details");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("https://www.dialexportmart.com/api/payment/initiate", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: String(amount),
                        totalAmount: String(totalAmount),
                        email: user.email,
                        phone: user.mobileNumber,
                        name: user.fullname,
                        userId: user._id,
                        packageName: packageName,
                        productInfo: packageName,
                    }),
                });

                const data = await response.json();
                console.log("Payment Initiate Response:", data);

                if (data?.action && data?.params) {
                    setPaymentAction(data.action);
                    setPaymentParams(data.params);
                    setLoading(false);
                } else if (data?.paymentUrl) {
                    setPaymentUrl(data.paymentUrl);
                    setLoading(false);
                } else {
                    console.error("Invalid payment initiation response:", data);
                    setLoading(false);
                }

            } catch (error) {
                console.error("Error initiating payment:", error);
                setLoading(false);
            }
        };

        initiatePayment();
    }, [amount, packageName, totalAmount, user]);

    // This function will be called whenever the WebView tries to navigate
   const onNavigationStateChange = (navState) => {
    console.log("WebView Navigation State:", navState.url);

    // Check if the WebView is redirecting to your *frontend* success URL
    if (navState.url.includes("https://www.dialexportmart.com/payment-success")) {
        console.log("Detected frontend payment success redirect in WebView:", navState.url);
        // Parse the query parameters from the URL
        const urlParams = new URLSearchParams(navState.url.split('?')[1]);
        const txnid = urlParams.get('txnid');
        const amount = urlParams.get('amount');
        const packageName = urlParams.get('package');

        // Navigate to your in-app PaymentSuccessScreen and pass the data
        navigation.replace('PaymentSuccessScreen', { txnid, amount, package: packageName });
        return false; // Prevent WebView from loading this URL further, as we're navigating in-app
    } else if (navState.url.includes("https://www.dialexportmart.com/api/payment/failure") || navState.url.includes("https://www.dialexportmart.com/payment-failure")) { // Also check for frontend failure URL if you have one
        console.log("Detected failure callback in WebView:", navState.url);
        navigation.replace('PaymentFailureScreen'); // Make sure PaymentFailureScreen is also registered
        return false; // Prevent WebView from loading this URL
    }

    // Handle UPI deep links
    if (navState.url.startsWith('upi://') || navState.url.startsWith('paytm://') || navState.url.startsWith('gpay://')) {
        console.log("Attempting to open deep link:", navState.url);
        Linking.openURL(navState.url).catch(err => {
            console.error("Failed to open deep link:", navState.url, err);
        });
        return false; // Prevent WebView from loading this URL
    }

    return true; // Allow WebView to continue loading other URLs
};

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0a84ff" />
                <Text style={styles.loadingText}>Redirecting to payment...</Text>
            </View>
        );
    }

    if (paymentUrl) {
        return <WebView source={{ uri: paymentUrl }} onNavigationStateChange={onNavigationStateChange} />;
    }

    if (paymentAction && paymentParams) {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Redirecting to Payment Gateway</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            </head>
            <body>
                <form id="paymentForm" action="${paymentAction}" method="post">
                    ${Object.keys(paymentParams)
                        .map(key => `<input type="hidden" name="${key}" value="${paymentParams[key]}">`)
                        .join('')}
                    <script type="text/javascript">
                        document.getElementById('paymentForm').submit();
                    </script>
                </form>
            </body>
            </html>
        `;
        return (
            <WebView
                source={{ html: htmlContent }}
                originWhitelist={['*']} // Important for allowing redirects
                onNavigationStateChange={onNavigationStateChange}
                javaScriptEnabled={true} // Enable JavaScript for form submission
                domStorageEnabled={true} // Enable DOM storage
                // For Android, sometimes useMixedContentMode is needed
                // mixedContentMode="always" 
            />
        );
    }

    return (
        <View style={styles.container}>
            <Text>Could not initiate payment. Please try again later.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
});

export default PaymentScreen;