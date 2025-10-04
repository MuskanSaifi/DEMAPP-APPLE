import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { List } from 'react-native-paper';

import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { AuthContext } from "../../context/AuthContext"; // adjust path accordingly

const BusinessProfile = () => {
  const { token } = useContext(AuthContext);
  const richText = useRef();

  const [error, setError] = useState(null);
 const [expanded, setExpanded] = React.useState({
    company: true,
    address: false,
    taxation: false,
    additional: false,
  });
    const handlePress = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };
  const allStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    // add all other states here
  ];

  const allCities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Ahmedabad",
    "Pune",
    "Jaipur",
    "Surat",
    // add more cities as needed
  ];

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    officeContact: "",
    faxNumber: "",
    ownershipType: "",
    annualTurnover: "",
    yearOfEstablishment: "", // Ensure this is initialized as a string
    numberOfEmployees: "",   // Ensure this is initialized as a string
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
    gstNumber: "",
    aadharNumber: "",
    panNumber: "",
    iecNumber: "",
    tanNumber: "",
    vatNumber: "",
    companyDescription: "",
    workingDays: [],
    workingTime: { from: "", to: "" },
    businessType: [],
    preferredBusinessStates: [],
    preferredBusinessCities: [],
    nonBusinessCities: [],
    companyLogo: null,
    companyPhotos: [],
    companyVideo: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const businessTypeOptions = [
    "Exporter",
    "Importer",
    "Manufacturer",
    "Wholesaler",
    "Retailer",
  ];

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch profile data from API on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          "https://www.dialexportmart.com/api/userprofile/profile/businessprofile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success && res.data.data) {
          // Ensure numeric fields are converted to string if they come as null/undefined/number
          setFormData({
            ...res.data.data,
            yearOfEstablishment: String(res.data.data.yearOfEstablishment || ""),
            numberOfEmployees: String(res.data.data.numberOfEmployees || ""),
            annualTurnover: String(res.data.data.annualTurnover || ""), // Also apply to annualTurnover
            officeContact: String(res.data.data.officeContact || ""),
            faxNumber: String(res.data.data.faxNumber || ""),
            pincode: String(res.data.data.pincode || ""),
            aadharNumber: String(res.data.data.aadharNumber || ""),
          });
          if (richText.current) {
            richText.current.setContentHTML(res.data.data.companyDescription || "");
          }
        } else {
          setError("Failed to fetch profile");
        }
      } catch (e) {
        setError(`Error fetching profile: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Input handlers
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle for multi-select arrays
  const toggleArrayValue = (field, value) => {
    setFormData((prev) => {
      const arr = prev[field];
      const exists = arr.includes(value);
      const newArr = exists ? arr.filter((i) => i !== value) : [...arr, value];
      return { ...prev, [field]: newArr };
    });
  };

  // Convenience toggles
  const handleBusinessTypeToggle = (type) => toggleArrayValue("businessType", type);
  const handleWorkingDayToggle = (day) => toggleArrayValue("workingDays", day);
  const handlePreferredStateToggle = (state) => toggleArrayValue("preferredBusinessStates", state);
  const handlePreferredCityToggle = (city) => toggleArrayValue("preferredBusinessCities", city);
  const handleNonBusinessCityToggle = (city) => toggleArrayValue("nonBusinessCities", city);

  // Working time change
  const handleWorkingTimeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingTime: {
        ...prev.workingTime,
        [field]: value,
      },
    }));
  };

  // Placeholder for file upload handlers (implement as needed)
  const handleFileUpload = (field) => {
    Alert.alert("File Upload", `File upload for ${field} not implemented.`);
  };

  // Save profile
  const handleSave = async () => {
    if (!token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.patch(
        "https://www.dialexportmart.com/api/userprofile/profile/businessprofile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        Alert.alert("Success", "Business profile updated!");
      } else {
        Alert.alert("Failed to save profile");
      }
    } catch (e) {
      Alert.alert("Error saving profile", e.message);
    } finally {
      setSaving(false);
    }
  };

  // UI rendering

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setLoading(true);
            // Trigger fetch again by calling the effect
            // Could also use a state variable to force refresh
            setTimeout(() => setLoading(false), 100); // temporary fix to re-trigger effect
          }}
        >
          <Text style={{ color: "blue", marginTop: 10 }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render form when not loading and no error
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

{/* Company Details */}
  <List.Section>
<List.Accordion
  title="Company Details"
  expanded={expanded.company}
  onPress={() => handlePress("company")}
  left={props => <List.Icon {...props} icon="office-building" />}   // company icon
>
    <View style={{ paddingHorizontal: 0, paddingLeft: 0 }}>

      <Text style={styles.label}>Company Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter company name"
        value={formData.companyName}
        onChangeText={(text) => handleInputChange("companyName", text)}
      />

      <Text style={styles.label}>Office Contact</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter office contact number"
        value={formData.officeContact}
        keyboardType="phone-pad"
        onChangeText={(text) => handleInputChange("officeContact", text)}
      />

      <Text style={styles.label}>Fax Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter fax number"
        value={formData.faxNumber}
        keyboardType="phone-pad"
        onChangeText={(text) => handleInputChange("faxNumber", text)}
      />

      <Text style={styles.label}>Ownership Type</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Proprietorship, Partnership, Private Limited"
        value={formData.ownershipType}
        onChangeText={(text) => handleInputChange("ownershipType", text)}
      />

      <Text style={styles.label}>Annual Turnover</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter annual turnover (e.g., 1000000)"
        value={formData.annualTurnover}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange("annualTurnover", text)}
      />

      <Text style={styles.label}>Year of Establishment</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 2005"
        value={formData.yearOfEstablishment}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange("yearOfEstablishment", text)}
      />

      <Text style={styles.label}>Number of Employees</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of employees"
        value={formData.numberOfEmployees}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange("numberOfEmployees", text)}
      />
      </View>
  </List.Accordion>
      </List.Section>

{/* Address Details */}
      <List.Section>
    <List.Accordion
  title="Address Details"
  expanded={expanded.address}
  onPress={() => handlePress("address")}
  left={props => <List.Icon {...props} icon="map-marker" />}
>
  <View style={{ paddingHorizontal: 0, paddingLeft: 0 }}>

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full address"
        value={formData.address}
        multiline
        onChangeText={(text) => handleInputChange("address", text)}
      />

      <Text style={styles.label}>Pincode</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter pincode"
        value={formData.pincode}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange("pincode", text)}
      />

      <Text style={styles.label}>City</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter city"
        value={formData.city}
        onChangeText={(text) => handleInputChange("city", text)}
      />

      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter state"
        value={formData.state}
        onChangeText={(text) => handleInputChange("state", text)}
      />

      <Text style={styles.label}>Country</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#eee" }]}
        placeholder="Country"
        value={formData.country}
        editable={false}
      />
            </View>

    </List.Accordion>
      </List.Section>

{/* Taxation Details */}
      <List.Section>
    <List.Accordion
  title="Taxation Details"
  expanded={expanded.taxation}
  onPress={() => handlePress("taxation")}
  left={props => <List.Icon {...props} icon="file-document" />}   // taxation icon
>
    <View style={{ paddingHorizontal: 0, paddingLeft: 0 }}>

      <Text style={styles.label}>GST Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter GST number"
        value={formData.gstNumber}
        onChangeText={(text) => handleInputChange("gstNumber", text)}
      />

      <Text style={styles.label}>Aadhar Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Aadhar number"
        value={formData.aadharNumber}
        keyboardType="numeric"
        onChangeText={(text) => handleInputChange("aadharNumber", text)}
      />

      <Text style={styles.label}>PAN Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PAN number"
        value={formData.panNumber}
        onChangeText={(text) => handleInputChange("panNumber", text)}
      />

      <Text style={styles.label}>IEC Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter IEC number (Import Export Code)"
        value={formData.iecNumber}
        onChangeText={(text) => handleInputChange("iecNumber", text)}
      />

      <Text style={styles.label}>TAN Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter TAN number (Tax Deduction and Collection Account Number)"
        value={formData.tanNumber}
        onChangeText={(text) => handleInputChange("tanNumber", text)}
      />

      <Text style={styles.label}>VAT Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter VAT number"
        value={formData.vatNumber}
        onChangeText={(text) => handleInputChange("vatNumber", text)}
      />
                  </View>

      </List.Accordion>
      </List.Section>
      
{/* Additional Details */}
      <List.Section>
     <List.Accordion
  title="Additional Details"
  expanded={expanded.additional}
  onPress={() => handlePress("additional")}
  left={props => <List.Icon {...props} icon="information" />}   // info icon
>
    <View style={{ paddingHorizontal: 0, paddingLeft: 0 }}>

      <Text style={styles.label}>Business Type (Select multiple)</Text>
      <View style={styles.multiSelectContainer}>
        {businessTypeOptions.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.multiSelectItem,
              formData.businessType.includes(type) && styles.multiSelectItemSelected,
            ]}
            onPress={() => handleBusinessTypeToggle(type)}
          >
            <Text
              style={[
                styles.multiSelectItemText,
                formData.businessType.includes(type) && styles.multiSelectItemTextSelected,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Working Days</Text>
      {daysOfWeek.map((day) => (
        <View key={day} style={styles.switchContainer}>
          <Text>{day}</Text>
          <Switch
            value={formData.workingDays.includes(day)}
            onValueChange={() => handleWorkingDayToggle(day)}
          />
        </View>
      ))}

      <Text style={styles.label}>Working Time</Text>
      <View style={styles.workingTimeRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          placeholder="From (e.g., 09:00 AM)"
          value={formData.workingTime.from}
          onChangeText={(text) => handleWorkingTimeChange("from", text)}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="To (e.g., 06:00 PM)"
          value={formData.workingTime.to}
          onChangeText={(text) => handleWorkingTimeChange("to", text)}
        />
      </View>

      <Text style={styles.label}>Preferred Business States</Text>
      <View style={styles.multiSelectContainer}>
        {allStates.map((state) => (
          <TouchableOpacity
            key={state}
            style={[
              styles.multiSelectItem,
              formData.preferredBusinessStates.includes(state) && styles.multiSelectItemSelected,
            ]}
            onPress={() => handlePreferredStateToggle(state)}
          >
            <Text
              style={[
                styles.multiSelectItemText,
                formData.preferredBusinessStates.includes(state) && styles.multiSelectItemTextSelected,
              ]}
            >
              {state}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Preferred Business Cities</Text>
      <View style={styles.multiSelectContainer}>
        {allCities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.multiSelectItem,
              formData.preferredBusinessCities.includes(city) && styles.multiSelectItemSelected,
            ]}
            onPress={() => handlePreferredCityToggle(city)}
          >
            <Text
              style={[
                styles.multiSelectItemText,
                formData.preferredBusinessCities.includes(city) && styles.multiSelectItemTextSelected,
              ]}
            >
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Non-Business Cities</Text>
      <View style={styles.multiSelectContainer}>
        {allCities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.multiSelectItem,
              formData.nonBusinessCities.includes(city) && styles.multiSelectItemSelected,
            ]}
            onPress={() => handleNonBusinessCityToggle(city)}
          >
            <Text
              style={[
                styles.multiSelectItemText,
                formData.nonBusinessCities.includes(city) && styles.multiSelectItemTextSelected,
              ]}
            >
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

  <Text style={styles.label}>Company Logo URL</Text>
<TextInput
  style={styles.input}
  placeholder="Enter company logo URL"
  value={formData.companyLogo}
  onChangeText={(text) => handleInputChange("companyLogo", text)}
/>

<Text style={styles.label}>Company Photos URLs (comma-separated)</Text>
<TextInput
  style={styles.input}
  placeholder="Enter photo URLs, separated by commas"
  value={formData.companyPhotos.join(', ')}
  onChangeText={(text) => handleInputChange("companyPhotos", text.split(',').map(url => url.trim()))}
/>

<Text style={styles.label}>Company Video URL</Text>
<TextInput
  style={styles.input}
  placeholder="Enter company video URL"
  value={formData.companyVideo}
  onChangeText={(text) => handleInputChange("companyVideo", text)}
/>

      <Text style={styles.label}>Company Description</Text>
      <RichEditor
        ref={richText}
        onChange={(text) => handleInputChange("companyDescription", text)}
        placeholder="Enter company description"
        style={styles.richEditor}
        initialContentHTML={formData.companyDescription}
      />
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertLink,
        ]}
        style={styles.richToolbar}
      />
                        </View>

   </List.Accordion>
      </List.Section>
      
      <View style={{ marginBottom: 40, marginTop: 20 }}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  multiSelectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  multiSelectItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#888",
    marginRight: 8,
    marginBottom: 8,
  },
  multiSelectItemSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  multiSelectItemText: {
    color: "#444",
  },
  multiSelectItemTextSelected: {
    color: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workingTimeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  fileUploadBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    marginBottom: 12,
    alignItems: "center",
  },
  fileUploadBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  richEditor: {
    minHeight: 150,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  richToolbar: {
    backgroundColor: "#f5f5f5",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    marginBottom: 60,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default BusinessProfile;