import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";

const PaymentScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const user = useSelector((state) => state.user.user);

  const [paymentUrl, setPaymentUrl] = useState(null);
  const [postBody, setPostBody] = useState(null);

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        const response = await fetch("https://www.dialexportmart.com/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: params.amount,
            totalAmount: params.totalAmount,
            email: user.email,
            phone: user.mobileNumber,
            name: user.fullname,
            userId: user._id,
            packageName: params.packageName,
            productInfo: params.packageName,
          }),
        });

        const data = await response.json();

        if (data?.action && data?.params) {
          const formBody = Object.entries(data.params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join("&");

          setPaymentUrl(data.action);
          setPostBody(formBody);
        } else {
          Alert.alert("Error", "Payment initiation failed.");
        }
      } catch (error) {
        console.error("❌ Payment initiation failed:", error);
        Alert.alert("Error", "Something went wrong. Please try again later.");
      }
    };

    initiatePayment();
  }, []);

  const handleNavChange = (navState) => {
    const { url } = navState;
    if (url.includes("/payment/success")) {
      navigation.replace("PaymentSuccessScreen", {
        amount: params.amount,
        packageName: params.packageName,
      });
    } else if (url.includes("/payment/failure")) {
      navigation.replace("PaymentFailureScreen", {
        amount: params.amount,
        packageName: params.packageName,
      });
    }
  };

  if (!paymentUrl || !postBody) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6A0DAD" />
      </View>
    );
  }

return (
  <WebView
    originWhitelist={["*"]}
    source={{
      uri: paymentUrl,
      method: "POST",
      body: postBody,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }}
    onNavigationStateChange={handleNavChange}
    startInLoadingState={true}
    renderLoading={() => (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6A0DAD" />
      </View>
    )}
    onShouldStartLoadWithRequest={(request) => {
      const url = request.url;
      if (!url) return false;

      if (url.includes("upiLoader")) return true;

      if (url.startsWith("intent://") || url.startsWith("upi://")) {
        try {
          Linking.openURL(url.replace("intent://", "https://"));
        } catch (error) {
          Alert.alert(
            "UPI App Not Found",
            "Please install a UPI app (PhonePe, Google Pay, Paytm, etc.) to complete your payment."
          );
        }
        return false;
      }
      return true;
    }}
    onError={(e) => {
      console.warn("❌ WebView error:", e.nativeEvent);
    }}
  />
);


};

export default PaymentScreen;
