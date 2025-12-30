import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
   Modal, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Collapsible from 'react-native-collapsible';
import { useSelector } from 'react-redux';
import { useNavigation } from "@react-navigation/native";


// --- COLLAPSIBLE SECTION COMPONENT ---
const CollapsibleSection = ({ title, features, renderFeature }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  return (
    <View style={sectionStyles.container}>
      <TouchableOpacity
        style={sectionStyles.header}
        onPress={() => setIsCollapsed(!isCollapsed)}
        activeOpacity={0.8}
      >
        <Text style={sectionStyles.title}>{title}</Text>
        <Ionicons
          name={isCollapsed ? 'chevron-down' : 'chevron-up'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed}>
        <View style={sectionStyles.content}>
          {features?.map(renderFeature)}
        </View>
      </Collapsible>
    </View>
  );
};

// --- MAIN PRICING PLANS COMPONENT ---
const PricingPlans = () => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  
  useEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#F0F2F5');
    }

    const fetchPlans = async () => {
      try {
        const response = await fetch('https://www.dialexportmart.com/api/adminprofile/plans');
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('❌ Error fetching plans:', error);
        Alert.alert('Error', 'Unable to load plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleWhatsAppEnquiry = (plan) => {
    const phoneNumber = '+918287427279';
    const message = `Hello, I am interested in the "${plan.title}" plan. Please provide more details.`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'WhatsApp Not Installed',
        'Please ensure WhatsApp is installed on your device to continue.'
      );
    });
  };

  const renderFeature = (feature, index) => {
    const text = Array.isArray(feature) ? feature[0] : feature.text;
    const included = Array.isArray(feature)
      ? feature[1]
      : feature.included;

    return (
      <View key={index} style={styles.featureItem}>
        <Ionicons
          name={included ? 'checkmark-circle' : 'close-circle-outline'}
          size={20}
          color={included ? '#2ECC71' : '#E74C3C'}
          style={styles.featureIcon}
        />
        <Text style={styles.featureText}>{text}</Text>
      </View>
    );
  };

  const renderPlan = ({ item }) => {
    const featureCategories = [
      { title: 'Top Service', data: item.topService },
      { title: 'Website Packages', data: item.website },
      { title: 'SEO (Search Engine Optimization)', data: item.seo },
      { title: 'SMO (Social Media Optimization)', data: item.smo },
    ];

    return (
      <View style={[styles.card, item.highlighted && styles.highlightedCard]}>
        {item.highlighted && (
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>⭐ Popular Choice ⭐</Text>
          </View>
        )}
        <Text
          style={[styles.cardTitle, item.highlighted && styles.highlightedCardTitle]}
        >
          {item.title}
        </Text>

        <View style={styles.featuresContainer}>
          {featureCategories.map((category, index) => (
            <CollapsibleSection
              key={index}
              title={category.title}
              features={category.data}
              renderFeature={renderFeature}
            />
          ))}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ₹ {Number(item.price).toLocaleString('en-IN')}
          </Text>
          <Text style={styles.gst}>+ 18% GST Per Year</Text>
        </View>

          <TouchableOpacity
            style={styles.payButton} // ✅ Added style
           onPress={() => {
  if (!user) {
    Alert.alert("Login Required", "Please login to purchase a plan.", [
      { text: "OK", onPress: () => navigation.navigate("Login") },
    ]);
    return;
  }
  setSelectedPlan(item);
  setShowModal(true);
}}
          >
            <Text style={styles.payButtonText}>Buy Now</Text>
            <Ionicons
              name="card-outline"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>

      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6A0DAD" />
        <Text style={{ marginTop: 10, color: '#555' }}>Loading plans...</Text>
      </View>
    );
  }

  if (!plans.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: '#888' }}>No plans available</Text>
      </View>
    );
  }

  const ListHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.title}>
        Choose Your Perfect <Text style={styles.titleHighlight}>Plan</Text>
      </Text>
      <Text style={styles.subtitle}>
        Unlock powerful features and grow your business with our tailored
        subscription plans.
      </Text>
      <View style={styles.headerSeparator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.flatListContent}
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
      />
      <Modal
  visible={showModal}
  animationType="fade"
  transparent
  onRequestClose={() => {
    setShowModal(false);
    setCustomAmount("");
  }}
>
  <View style={{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)"
  }}>
    <View style={{
      width: "85%",
      backgroundColor: "#fff",
      borderRadius: 15,
      padding: 20
    }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 15 }}>
        Select Payment Option for {selectedPlan?.title}
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: "#28A745", padding: 12, borderRadius: 8, marginBottom: 10 }}
        onPress={() => {
          setShowModal(false);
          navigation.navigate("PaymentScreen", {
            amount: selectedPlan.price,
            totalAmount: selectedPlan.price * 1.18,
            packageName: selectedPlan.title,
          });
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Full Amount</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Enter custom amount"
        keyboardType="numeric"
        value={customAmount}
        onChangeText={setCustomAmount}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginBottom: 10
        }}
      />

      <TouchableOpacity
        style={{ backgroundColor: "#007BFF", padding: 12, borderRadius: 8 }}
        onPress={() => {
          if (!customAmount || isNaN(customAmount) || Number(customAmount) < 1) {
            Alert.alert("Invalid", "Please enter a valid custom amount.");
            return;
          }
          setShowModal(false);
          navigation.navigate("PaymentScreen", {
            amount: customAmount,
            totalAmount: customAmount,
            packageName: selectedPlan.title,
          });
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          Proceed with Custom ₹{customAmount || ""}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

// --- STYLES ---
const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#6A0DAD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#D1C4E9',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  flatListContent: { paddingTop: 10, paddingHorizontal: 10, paddingBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSection: {
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  titleHighlight: { color: '#6A0DAD' },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  headerSeparator: {
    width: '40%',
    height: 4,
    backgroundColor: '#D1C4E9',
    borderRadius: 2,
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    marginBottom: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  highlightedCard: {
    borderColor: '#6A0DAD',
    borderWidth: 3,
    shadowColor: '#6A0DAD',
    shadowOpacity: 0.3,
    elevation: 12,
    backgroundColor: '#F7F4FA',
  },
  ribbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6F00',
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 10,
    zIndex: 1,
  },
  ribbonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  highlightedCardTitle: { color: '#6A0DAD' },
  featuresContainer: { marginBottom: 20 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: { marginRight: 12 },
  featureText: { fontSize: 15, color: '#444', flexShrink: 1 },
  priceContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 15,
  },
  price: { fontSize: 36, fontWeight: '800', color: '#6A0DAD' },
  gst: { fontSize: 13, color: '#7F8C8D', marginTop: 5 },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A0DAD',
    paddingVertical: 14,
    borderRadius: 12,
  },
  highlightedPayButton: { backgroundColor: '#8E44AD' },
  payButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});

export default PricingPlans;
