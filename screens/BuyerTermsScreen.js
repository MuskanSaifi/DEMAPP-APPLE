import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";

export default function BuyerTermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Buyer Terms & Conditions</Text>

        <Text style={styles.section}>
          By registering and using this app as a Buyer, you agree to comply with
          the following terms and conditions:
        </Text>

        <Text style={styles.section}>
          1. You must provide accurate and complete information during registration
          including your name, contact details, and business information.
        </Text>

        <Text style={styles.section}>
          2. You are responsible for maintaining the confidentiality of your account
          and OTP verification details.
        </Text>

        <Text style={styles.section}>
          3. You must not post, request, or share any objectionable, abusive,
          misleading, fraudulent, or illegal content or product inquiries.
        </Text>

        <Text style={styles.section}>
          4. Communication with sellers must be respectful and business-focused.
          Any misuse of chat or contact features may result in account suspension.
        </Text>

        <Text style={styles.section}>
          5. We reserve the right to review, verify, and remove any Buyer profiles
          or requests that violate these terms.
        </Text>

        <Text style={styles.section}>
          6. Buyers are prohibited from sharing fake product requests or misleading
          business details.
        </Text>

        <Text style={styles.section}>
          7. Reports of objectionable or abusive content will be reviewed within 24 hours,
          and appropriate action will be taken.
        </Text>

        <Text style={styles.section}>
          8. We may update these Terms from time to time. Continued use of the app
          means you agree to the updated terms.
        </Text>

        <Text style={styles.section}>
          9. This platform maintains zero tolerance for spam, scams, or misuse of Buyer
          accounts. Offending accounts may be permanently suspended.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, color: "#1E3A8A" },
  section: { fontSize: 14, marginBottom: 12, color: "#333", lineHeight: 20 },
});
