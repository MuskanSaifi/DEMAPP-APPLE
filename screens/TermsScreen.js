import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Use</Text>

        <Text style={styles.section}>
          By using this app, you agree to comply with the following terms:
        </Text>

        <Text style={styles.section}>
          1. You must not post or share any objectionable, abusive, hateful,
          sexually explicit, or illegal content.
        </Text>

        <Text style={styles.section}>
          2. We reserve the right to remove content and ban users who violate
          these terms.
        </Text>

        <Text style={styles.section}>
          3. You must not harass, threaten, or impersonate other users.
        </Text>

        <Text style={styles.section}>
          4. We may update these Terms of Use from time to time. Continued use
          of the app means you accept the updated terms.
        </Text>

        <Text style={styles.section}>
          5. Reports of objectionable content will be reviewed within 24 hours,
          and necessary action will be taken.
        </Text>
        <Text style={styles.section}>
          6. This app has zero tolerance for objectionable content or abusive behavior. 
   Users can report or block content, and our team takes action within 24 hours.
        </Text>
        <Text style={styles.section}>
          7. All user-submitted content (including products) is reviewed and verified 
   by our team before being published. Objectionable or abusive content is never displayed publicly.
     </Text>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  section: { fontSize: 14, marginBottom: 12, color: "#333" }
});
