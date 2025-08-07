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
  Image,
} from 'react-native';
import { CountryPicker } from 'react-native-country-codes-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('IN'); // ISO code
  const [callingCode, setCallingCode] = useState('91'); // dialing code
  const [mobileNumber, setMobileNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [loginNumber, setLoginNumber] = useState('');
  const [signup, setSignup] = useState(false);

  const { login } = useContext(AuthContext);
  const navigation = useNavigation();

  // CountryPicker state (to control visibility)
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Called when user selects a country
  const onSelectCountry = (country) => {
    setCountryCode(country.code); // ISO2 code, e.g. 'IN'
    setCallingCode(country.dial_code.replace('+', '')); // e.g. '91'
    setShowCountryPicker(false);
  };

  // Registration submit
  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    const fullMobileNumber = `+${callingCode}${mobileNumber}`;

    try {
      const res = await axios.post('https://www.dialexportmart.com/api/auth/sendotp', {
        fullname,
        email,
        mobileNumber: fullMobileNumber,
        pincode,
        companyName,
      });

      if (res.status === 200) {
        setMessage(res.data.message);
        setLoginNumber(fullMobileNumber);
        setSignup(true);
      } else {
        setError(res.data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  // OTP verification
  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('https://www.dialexportmart.com/api/auth/verifyotp', {
        mobileNumber: loginNumber,
        otp,
      });

      if (res.status === 200) {
        setMessage('OTP verified successfully!');

        if (res.data.token) {
          await login(res.data.user, res.data.token);
        }

        Alert.alert('Registered Success', 'You are now logged in');
        setSignup(false);
      } else {
        setError(res.data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Invalid OTP or something went wrong!');
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
      
        <Text style={styles.title}>{signup ? 'Verify OTP' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {signup ? 'Enter the OTP sent to your mobile' : 'Fill in the details below to register'}
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
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
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
                // You can add more props here (like theme, searchable, etc.)
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
              autoCapitalize="words"
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>
                Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#FFF',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 24,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  otpInput: {
    borderColor: '#2563EB',
    backgroundColor: '#E0ECFF',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  countryPickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  countryPickerText: {
    fontSize: 16,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
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
    marginTop: 20,
    textAlign: 'center',
    color: '#1E3A8A',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
