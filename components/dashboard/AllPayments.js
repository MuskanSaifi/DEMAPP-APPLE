import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AllPayments = () => {
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayment();
  }, []);

  const getPayment = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('Authentication Error', 'No token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('https://www.dialexportmart.com/api/userprofile/profile/userprofile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPaymentDetail(response.data.user);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Unauthorized', 'Session expired or invalid token. Please login again.');
        } else {
          Alert.alert('API Error', error.response.data.message || 'Something went wrong!');
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'No response from server. Check your internet connection.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateSafe = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : format(date, 'dd MMM yyyy');
  };

  const getLatestPackage = () => {
    if (!paymentDetail?.userPackage || paymentDetail.userPackage.length === 0) return null;
    return paymentDetail.userPackage[paymentDetail.userPackage.length - 1];
  };

  const getTotalPayments = () => paymentDetail?.userPackage?.length || 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5A67D8" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.totalPaymentsCard}>
        <Text style={styles.totalLabel}>Total Payments Done</Text>
        <Text style={styles.totalNumber}>{getTotalPayments()}</Text>
      </View>

      {paymentDetail?.userPackage?.length > 0 ? (
        <View style={styles.packageCard}>
          <Text style={styles.packageName}>{getLatestPackage()?.packageName}</Text>
          <Text style={styles.packagePrice}>
            ₹{parseInt(getLatestPackage()?.totalAmount / 1.18)} (Excl. GST)
          </Text>

          <View style={styles.amountContainer}>
            {[
              { label: 'Total Amount with GST (18%)', value: `₹${getLatestPackage()?.totalAmount}`, color: '#4A5568' },
              { label: 'Paid Amount', value: `₹${getLatestPackage()?.paidAmount}`, color: '#38A169' },
              { label: 'Remaining Amount', value: `₹${getLatestPackage()?.remainingAmount}`, color: '#E53E3E' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.amountBox, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.amountLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={[styles.amountValue, { color: item.color, fontWeight: '700' }]}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>{formatDateSafe(getLatestPackage()?.packageStartDate)}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Expiry Date</Text>
              <Text style={styles.dateValue}>{formatDateSafe(getLatestPackage()?.packageExpiryDate)}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noPayments}>No Payments available</Text>
      )}

      {paymentDetail?.userPackage?.length > 1 && (
        <>
          <Text style={styles.sectionTitle}>Previous Packages</Text>
          {paymentDetail.userPackage
            .slice(0, -1)
            .reverse()
            .map((pkg, idx) => (
              <View key={idx} style={styles.oldPackageCard}>
                <Text style={styles.oldPackageName}>{pkg.packageName}</Text>
                <View style={styles.badges}>
                  <View style={[styles.badge, styles.badgeTotal]}>
                    <Text style={styles.badgeText}>Total: ₹{Number(pkg.totalAmount).toLocaleString()}</Text>
                  </View>
                  <View style={[styles.badge, styles.badgePaid]}>
                    <Text style={styles.badgeText}>Paid: ₹{Number(pkg.paidAmount).toLocaleString()}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      Number(pkg.remainingAmount) === 0 ? styles.badgeCleared : styles.badgeRemaining,
                    ]}
                  >
                    <Text style={styles.badgeText}>Remaining: ₹{Number(pkg.remainingAmount).toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.oldPackageDates}>
                  <Text style={styles.oldPackageDate}>
                    <Text style={{ fontWeight: '600' }}>From:</Text> {formatDateSafe(pkg.packageStartDate)}
                  </Text>
                  <Text style={styles.oldPackageDate}>
                    <Text style={{ fontWeight: '600' }}>To:</Text> {formatDateSafe(pkg.packageExpiryDate)}
                  </Text>
                </View>
              </View>
            ))}
        </>
      )}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F0F4F8',
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 12,
  },
  totalPaymentsCard: {
    backgroundColor: '#667EEA',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#E2E8F0',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '600',
  },
  totalNumber: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  packageCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 6,
  },
  packageName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2F855A',
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 18,
  },
  amountContainer: {
    marginBottom: 20,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#F7FAFC',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateBox: {
    backgroundColor: '#EDF2F7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '48%',
  },
  dateLabel: {
    fontSize: 13,
    color: '#4A5568',
    marginBottom: 4,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 15,
    color: '#2D3748',
  },
  noPayments: {
    color: '#E53E3E',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5A67D8',
    marginBottom: 12,
  },
  previousSection: {
    marginTop: 8,
  },
  oldPackageCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  oldPackageName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5568',
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '600',
  },
  badgeTotal: {
    backgroundColor: '#667EEA',
  },
  badgePaid: {
    backgroundColor: '#48BB78',
  },
  badgeRemaining: {
    backgroundColor: '#E53E3E',
  },
  badgeCleared: {
    backgroundColor: '#A0AEC0',
  },
  oldPackageDates: {
    marginTop: 6,
  },
  oldPackageDate: {
    fontSize: 14,
    color: '#4A5568',
  },
});


export default AllPayments;
