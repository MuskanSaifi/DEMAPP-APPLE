import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from "@expo/vector-icons"; // top import

export default function LoginScreen() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [callingCode, setCallingCode] = useState('91');
  const [countryFlag, setCountryFlag] = useState('🇮🇳');

  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  const onSelectCountry = (country) => {
    setCallingCode(country.dial_code.replace('+', ''));
    setCountryFlag(country.flag);
    setShowCountryPicker(false);
  };

  const sendOtp = async () => {
    setError('');
    setMessage('');

    if (!mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    setLoading(true);
    try {
      const fullMobile = `+${callingCode}${mobileNumber}`;
      const response = await axios.post('https://www.dialexportmart.com/api/auth/login', {
        mobileNumber: fullMobile,
      });

      if (response.status === 200 && !response.data.error) {
        setShowOtpField(true);
        setMessage(response.data.message || 'OTP sent successfully');
        setOtp('');
      } else {
        setError(response.data.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

const verifyOtp = async () => {
  setError('');
  setMessage('');

  if (!otp.trim()) {
    Alert.alert('Error', 'Please enter the OTP');
    return;
  }

  setLoading(true);
  try {
    const fullMobile = `+${callingCode}${mobileNumber}`;
    const response = await axios.post('https://www.dialexportmart.com/api/auth/login', {
      mobileNumber: fullMobile,
      otp: otp,
    });

    if (response.status === 200 && !response.data.error) {
      if (response.data.token) {
        await login(response.data.user, response.data.token);
      }
      // ✅ Direct navigation to Home/Dashboard after login
      navigation.reset({
        index: 0,
        routes: [{ name: 'DashboardScreen' }], // ya 'Home' agar uska naam HomeScreen hai
      });
    } else {
      setError(response.data.error || 'Invalid OTP');
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Something went wrong while verifying OTP');
  } finally {
    setLoading(false);
  }
};

return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
       <Image
  source={require('../assets/company_logo.png')} // ✅ Correct for local image
  style={styles.productImage}
  resizeMode="contain"
/>

        <Text style={styles.title}>Welcome Back 👋</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {message ? <Text style={styles.message}>{message}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.phoneContainer}>
          <TouchableOpacity onPress={() => setShowCountryPicker(true)} style={styles.flagButton}>
            <Text style={styles.flagText}>{countryFlag} +{callingCode}</Text>
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

        <CountryPicker
          show={showCountryPicker}
          pickerButtonOnPress={onSelectCountry}
          onBackdropPress={() => setShowCountryPicker(false)}
        />

        {!showOtpField ? (
          <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="Enter OTP"
              keyboardType="numeric"
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor="#666"
            />
            <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.loginLink}>
            Don't have an account? <Text style={{ fontWeight: 'bold' }}>Register</Text>
          </Text>
        </TouchableOpacity>
        {/* ✅ Home Button */}
<TouchableOpacity
  style={styles.homeButton}
  onPress={() => navigation.navigate("Home")} // ya 'Home' agar tumhara home screen ka naam alag hai
>
  <Ionicons name="home-outline" size={28} color="#1E3A8A" />
  <Text style={{ marginTop: 3, color: "#1E3A8A" }}>Home</Text>
</TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
  },
  productImage: {
  width: '80',
  height: '80',
  alignSelf: 'center',
},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  homeButton: {
  marginTop: 30,
  alignItems: "center",
  justifyContent: "center",
},

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  otpInput: {
    borderColor: '#1E3A8A',
    backgroundColor: '#E0ECFF',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#E4E9FF',
    borderRadius: 12,
  },
  flagText: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 10,
    textAlign: 'center',
    color: '#1E3A8A',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
