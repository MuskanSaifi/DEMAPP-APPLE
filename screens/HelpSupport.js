import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

// Enable layout animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpDeskScreen = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  // ✅ detect user type
  const buyer = useSelector((state) => state.buyer?.buyer);
  const seller = useSelector((state) => state.user.user);
  const isBuyer = !!buyer;
  const isSeller = !!seller;
  const isLoggedIn = isBuyer || isSeller;
  const navigation = useNavigation();

  // ✅ Buyer FAQs
  const buyerFaqs = [
    { question: "How can I contact a seller?", answer: "You can contact a seller directly from the product page using the 'Chat with Seller' or 'Send Inquiry' button." },
    { question: "How do I unblock a seller?", answer: "Go to Buyer Dashboard → Blocked Sellers → Tap 'Unblock' beside the seller you wish to unblock." },
    { question: "Didn’t receive confirmation email?", answer: "Please check your spam or junk folder. If missing, contact our support team below." },
    { question: "How can I report a seller?", answer: "Visit the seller’s profile and tap 'Report Seller'. Fill out the issue form." },
    { question: "Can I update my registered details?", answer: "Yes. Go to your Buyer Profile → Edit Profile and verify new contact info." },
  ];

  // ✅ Seller FAQs
  const sellerFaqs = [
    { question: "How can I add a new product?", answer: "Go to Seller Dashboard → Manage Products → Add New Product and fill the required details." },
    { question: "How can I edit or delete my product?", answer: "Open Manage Products → My Product → tap Edit or Delete on the selected item." },
    { question: "How can I view leads or inquiries?", answer: "Navigate to Leads & Enquiry → View All to check messages and inquiries from buyers." },
    { question: "How do I manage my business profile?", answer: "Go to Profile → Business Profile to edit your business details, GST info, and address." },
    { question: "How can I contact my assigned support person?", answer: "You can check your Support Person details under the ‘Support Person’ tab or contact us directly via phone or WhatsApp below." },
  ];

  const handleToggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert("Please fill all fields");
      return;
    }
    Alert.alert("✅ Query Submitted", "Our team will contact you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  const handleEmailPress = () => Linking.openURL("mailto:support@dialexportmart.com");
  const handlePhonePress = () => Linking.openURL("tel:+918448668076");
  const handleWhatsAppPress = () =>
    Linking.openURL("https://wa.me/918448668076?text=Hello%20Support%2C%20I%20need%20help");

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={["#6A5ACD", "#7B68EE"]} style={styles.header}>
        <Icon name="headset" size={52} color="#fff" />
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>Find quick answers or contact our support team.</Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

      {/* ✅ CASE 1: BOTH buyer and seller logged in */}
      {isBuyer && isSeller ? (
        <>
          <Text style={[styles.sectionTitle, { color: "#2563EB" }]}>Buyer FAQs</Text>
          {buyerFaqs.map((faq, index) => (
            <View key={`buyer-${index}`} style={styles.faqCard}>
              <TouchableOpacity onPress={() => handleToggle(`buyer-${index}`)} style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon
                  name={openIndex === `buyer-${index}` ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#6A5ACD"
                />
              </TouchableOpacity>
              {openIndex === `buyer-${index}` && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </View>
          ))}

          <Text style={[styles.sectionTitle, { color: "#9333EA", marginTop: 20 }]}>Seller FAQs</Text>
          {sellerFaqs.map((faq, index) => (
            <View key={`seller-${index}`} style={styles.faqCard}>
              <TouchableOpacity onPress={() => handleToggle(`seller-${index}`)} style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon
                  name={openIndex === `seller-${index}` ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#6A5ACD"
                />
              </TouchableOpacity>
              {openIndex === `seller-${index}` && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </View>
          ))}
        </>
      ) : isBuyer ? (
        // ✅ CASE 2: Only buyer logged in
        buyerFaqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <TouchableOpacity onPress={() => handleToggle(index)} style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Icon name={openIndex === index ? "chevron-up" : "chevron-down"} size={22} color="#6A5ACD" />
            </TouchableOpacity>
            {openIndex === index && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </View>
        ))
      ) : isSeller ? (
        // ✅ CASE 3: Only seller logged in
        sellerFaqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <TouchableOpacity onPress={() => handleToggle(index)} style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Icon name={openIndex === index ? "chevron-up" : "chevron-down"} size={22} color="#6A5ACD" />
            </TouchableOpacity>
            {openIndex === index && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
          </View>
        ))
      ) : (
        // ✅ CASE 4: Not logged in → show both together
        <View style={styles.loginRequiredCard}>
          <Icon name="information-outline" size={30} color="#2563EB" />
          <Text style={styles.loginRequiredText}>Showing FAQs for both Buyers & Sellers</Text>
      <TouchableOpacity onPress={() => navigation.navigate("BuySell")}>
        <Text style={[styles.loginRequiredSubText, { color: "#6A5ACD", textDecorationLine: "underline" }]}>
          Login to view personalized help content.
        </Text>
      </TouchableOpacity>
          <Text style={[styles.sectionTitle, { color: "#2563EB" }]}>Buyer FAQs</Text>
          {buyerFaqs.map((faq, index) => (
            <View key={`b-${index}`} style={styles.faqCard}>
              <TouchableOpacity onPress={() => handleToggle(`b-${index}`)} style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon name={openIndex === `b-${index}` ? "chevron-up" : "chevron-down"} size={22} color="#6A5ACD" />
              </TouchableOpacity>
              {openIndex === `b-${index}` && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </View>
          ))}

          <Text style={[styles.sectionTitle, { color: "#9333EA", marginTop: 20 }]}>Seller FAQs</Text>
          {sellerFaqs.map((faq, index) => (
            <View key={`s-${index}`} style={styles.faqCard}>
              <TouchableOpacity onPress={() => handleToggle(`s-${index}`)} style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon name={openIndex === `s-${index}` ? "chevron-up" : "chevron-down"} size={22} color="#6A5ACD" />
              </TouchableOpacity>
              {openIndex === `s-${index}` && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Contact Support</Text>
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress}>
          <Icon name="email-outline" size={34} color="#3B82F6" />
          <Text style={styles.contactTitle}>Email Us</Text>
          <Text style={styles.contactInfo}>support@dialexportmart.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handlePhonePress}>
          <Icon name="phone-outline" size={34} color="#22C55E" />
          <Text style={styles.contactTitle}>Call Support</Text>
          <Text style={styles.contactInfo}>+91 84486 68076</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handleWhatsAppPress}>
          <Icon name="whatsapp" size={34} color="#25D366" />
          <Text style={styles.contactTitle}>Live Chat</Text>
          <Text style={styles.contactInfo}>10 AM – 7 PM</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Submit a Query</Text>
      <Text style={styles.formSubtitle}>Didn’t find what you were looking for? Send us a message below.</Text>

      <View style={styles.form}>
        <TextInput placeholder="Full Name" style={styles.input} value={form.name} onChangeText={(text) => setForm({ ...form, name: text })} />
        <TextInput placeholder="Email Address" keyboardType="email-address" style={styles.input} value={form.email} onChangeText={(text) => setForm({ ...form, email: text })} />
        <TextInput placeholder="Your Message" multiline numberOfLines={4} style={[styles.input, { height: 100, textAlignVertical: "top" }]} value={form.message} onChangeText={(text) => setForm({ ...form, message: text })} />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <LinearGradient colors={["#6A5ACD", "#7B68EE"]} style={styles.submitGradient}>
            <Text style={styles.submitText}>Submit Query</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { borderRadius: 18, padding: 24, alignItems: "center", marginBottom: 20, elevation: 5 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 10 },
  headerSubtitle: { color: "#E0E7FF", fontSize: 14, textAlign: "center", marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#6A5ACD", marginVertical: 10 },
  faqCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, elevation: 2 },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { fontSize: 15, fontWeight: "600", color: "#1F2937", flex: 1 },
  faqAnswer: { marginTop: 8, color: "#475569", fontSize: 14, lineHeight: 20 },
  loginRequiredCard: { backgroundColor: "#E0E7FF", borderRadius: 12, padding: 20, marginBottom: 8 },
  loginRequiredText: { fontSize: 16, fontWeight: "600", color: "#4338CA", textAlign: "center", marginBottom: 6 },
  loginRequiredSubText: { fontSize: 14, color: "#4F46E5", textAlign: "center", marginBottom: 10 },
  contactRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  contactCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", width: "31%", marginVertical: 6, elevation: 2 },
  contactTitle: { fontWeight: "600", fontSize: 12, color: "#1E293B", marginTop: 8 },
  contactInfo: { fontSize: 12, color: "#475569", textAlign: "center", marginTop: 4 },
  form: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 2, marginTop: 10 },
  formSubtitle: { color: "#475569", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
  submitBtn: { borderRadius: 10, overflow: "hidden" },
  submitGradient: { paddingVertical: 12, alignItems: "center" },
  submitText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

export default HelpDeskScreen;
