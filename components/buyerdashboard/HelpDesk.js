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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HelpDeskScreen = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const faqs = [
    {
      question: "How can I contact a seller?",
      answer:
        "You can contact a seller directly from the product page using the 'Chat with Seller' or 'Send Inquiry' button. Make sure you are logged in as a buyer.",
    },
    {
      question: "How do I unblock a seller?",
      answer:
        "Go to your Buyer Dashboard → Blocked Sellers → Click on the 'Unblock' button beside the seller you want to unblock.",
    },
    {
      question: "I didn’t receive my order confirmation email. What should I do?",
      answer:
        "Please check your spam or junk folder. If the email is still missing, contact our support team using the form below.",
    },
    {
      question: "How can I report a seller?",
      answer:
        "Visit the seller’s profile or product page and click on 'Report Seller'. Fill out the form with the issue details.",
    },
    {
      question: "Can I update my registered email or phone number?",
      answer:
        "Yes. Go to your Buyer Profile → Edit Profile and update your contact information. Make sure to verify your new details.",
    },
  ];

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      Alert.alert("Please fill all fields");
      return;
    }
    Alert.alert("✅ Query Submitted", "Our team will contact you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@dialexportmart.com");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+918448668076");
  };

  const handleWhatsAppPress = () => {
    Linking.openURL("https://wa.me/918448668076?text=Hello%20Support%2C%20I%20need%20help%20with%20DialExportMart");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Icon name="help-circle-outline" size={50} color="#fff" />
        <View style={{ marginTop: 10 }}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSubtitle}>
            Find quick answers or contact our team for help.
          </Text>
        </View>
      </View>

      {/* ===== FAQ SECTION ===== */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqCard}>
          <TouchableOpacity
            onPress={() => setOpenIndex(openIndex === index ? null : index)}
            style={styles.faqHeader}
          >
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Icon
              name={openIndex === index ? "chevron-up" : "chevron-down"}
              size={22}
              color="#6A5ACD"
            />
          </TouchableOpacity>
          {openIndex === index && (
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          )}
        </View>
      ))}

      {/* ===== CONTACT SUPPORT ===== */}
      <Text style={styles.sectionTitle}>Contact Support</Text>
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress}>
          <Icon name="email-outline" size={32} color="#3B82F6" />
          <Text style={styles.contactTitle}>Email Us</Text>
          <Text style={[styles.contactInfo]}>
            support@dialexportmart.com
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactCard} onPress={handlePhonePress}>
          <Icon name="phone-outline" size={32} color="#22C55E" />
          <Text style={styles.contactTitle}>Support</Text>
          <Text style={[styles.contactInfo]}>
            +91 84486 68076
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleWhatsAppPress}
        >
          <Icon name="whatsapp" size={32} color="#25D366" />
          <Text style={styles.contactTitle}>Live Chat</Text>
          <Text style={styles.contactInfo}>Available 10AM – 7PM</Text>
        </TouchableOpacity>
      </View>

      {/* ===== SUBMIT QUERY ===== */}
      <Text style={styles.sectionTitle}>Submit a Query</Text>
      <Text style={styles.formSubtitle}>
        Can’t find what you’re looking for? Send us a message and our team will
        get back to you shortly.
      </Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />
        <TextInput
          placeholder="Email Address"
          keyboardType="email-address"
          style={styles.input}
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
        />
        <TextInput
          placeholder="Your Message"
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          value={form.message}
          onChangeText={(text) => setForm({ ...form, message: text })}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Query</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    backgroundColor: "#6A5ACD",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#E0E7FF",
    fontSize: 14,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6A5ACD",
    marginBottom: 10,
    marginTop: 10,
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  faqAnswer: {
    marginTop: 8,
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "31%",
    marginVertical: 6,
    elevation: 2,
  },
  contactTitle: {
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 8,
  },
  contactInfo: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    marginTop: 4,
  },
 
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginTop: 10,
  },
  formSubtitle: {
    color: "#475569",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  submitBtn: {
    backgroundColor: "#6A5ACD",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default HelpDeskScreen;
