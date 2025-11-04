import React, { useState, useContext  } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { CountryPicker } from "react-native-country-codes-picker";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setReduxBuyer } from "../redux/buyerSlice";
import { useNavigation } from "@react-navigation/native";
import { BuyerAuthContext } from "../context/BuyerAuthContext";

export default function BuyerRegisterScreen() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [productname, setProductname] = useState("");
  const [otp, setOtp] = useState("");
  const [signup, setSignup] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [callingCode, setCallingCode] = useState("91");
  const [countryCode, setCountryCode] = useState("IN");
  const [loginNumber, setLoginNumber] = useState("");

const { loginBuyer } = useContext(BuyerAuthContext);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const onSelectCountry = (country) => {
    setCountryCode(country.code);
    setCallingCode(country.dial_code.replace("+", ""));
    setShowCountryPicker(false);
  };

  // Send OTP
  const handleSubmit = async () => {
    if (!fullname || !mobileNumber) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const fullMobile = `+${callingCode}${mobileNumber}`;
      const res = await axios.post(
        "https://www.dialexportmart.com/api/buyer/sendotp",
        {
          fullname,
          email,
          mobileNumber,
          countryCode: `+${callingCode}`,
          productname,
        }
      );

      if (res.status === 200) {
        setMessage(res.data.message);
        setLoginNumber(fullMobile);
        setSignup(true);
      } else {
        setError(res.data.error || "Error sending OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Enter OTP");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        "https://www.dialexportmart.com/api/buyer/verifyotp",
        {
          mobileNumber: loginNumber,
          otp,
        }
      );

    if (res.status === 200) {
  loginBuyer(res.data.buyer, res.data.token); // ✅ Save to AsyncStorage + Context
  dispatch(setReduxBuyer({ buyer: res.data.buyer, token: res.data.token }));
  navigation.reset({ index: 0, routes: [{ name: "BuyerDashboardScreen" }] });
}
 else {
        setError(res.data.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Image
          source={require("../assets/company_logo.png")}
          style={styles.productImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>{signup ? "Verify OTP" : "Buyer Register"}</Text>
        <Text style={styles.subtitle}>
          {signup
            ? "Enter the OTP sent to your mobile"
            : "Fill in the details below to register as a Buyer"}
        </Text>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {signup ? (
          <>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullname}
              onChangeText={setFullname}
              autoCapitalize="words"
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#666"
            />

            {/* Country picker + Mobile input */}
            <View style={styles.phoneContainer}>
              <TouchableOpacity
                style={styles.countryPickerButton}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryPickerText}>
                  {countryCode} +{callingCode} ▼
                </Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 10 }]}
                placeholder="Mobile Number"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholderTextColor="#666"
              />
            </View>

            {showCountryPicker && (
              <CountryPicker
                show={showCountryPicker}
                onSelect={onSelectCountry}
                onClose={() => setShowCountryPicker(false)}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Interested Product"
              value={productname}
              onChangeText={setProductname}
              autoCapitalize="words"
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("BuyerLoginScreen")}>
              <Text style={styles.loginLink}>
                Already have an account?{" "}
                <Text style={{ fontWeight: "bold" }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#FFF",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E3A8A",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  otpInput: {
    borderColor: "#2563EB",
    backgroundColor: "#E0ECFF",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryPickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    position: "relative",
    bottom: 8,
  },
  countryPickerText: {
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  loginLink: {
    marginTop: 20,
    textAlign: "center",
    color: "#1E3A8A",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});
