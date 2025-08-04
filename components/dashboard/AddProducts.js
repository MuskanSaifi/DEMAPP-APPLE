import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert, // Import Alert for permissions
} from 'react-native';
import axios from 'axios';
import { showMessage } from 'react-native-flash-message';
import { Picker } from '@react-native-picker/picker';
import { Country, State, City } from 'country-state-city';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../../context/AuthContext"; // adjust path if needed

// Slug generator function
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
// This also ensures consistency for resetting the form.
const initialProductState = {
  name: '',
  productslug: '',
  category: '',
  subCategory: '',
  price: '', // Number
  currency: '',
  minimumOrderQuantity: '', // Number
  moqUnit: '',
  description: '',
  country: '',
  state: '',
  city: '',
  stock: '', // Number
  images: [], // Array of base64 strings
  tradeInformation: {
    supplyAbility: '',
    deliveryTime: '',
    fobPort: '',
    samplePolicy: '',
    sampleAvailable: 'No', // Defaulting to 'No' for consistency with enum
    mainExportMarkets: '', // Comma-separated string
    certifications: '',
    packagingDetails: '',
    paymentTerms: '',
    mainDomesticMarket: '',
  },
  specifications: {
    productType: '',
    material: '',
    finish: '',
    thicknessTolerance: '', // Number
    thicknessToleranceUnit: '',
    width: '', // Number
    widthUnit: '',
    length: '', // Number
    lengthUnit: '',
    weight: '', // Number
    weightUnit: '',
    metalsType: '', // Comma-separated string for UI, will be array on submit
    widthTolerance: '', // Number
    widthToleranceUnit: '',
    shape: '',
    productName: '',
    thickness: '', // Number
    thicknessUnit: '',
    color: '',
    coating: '',
    woodType: '',
    usage: '',
    processorType: '',
    type: '',
    design: '',
    feature: '',
    metalType: '', // Note: 'metalType' vs 'metalsType' (plural vs singular). Stick to schema.
    application: '',
    finishing: '',
    origin: '',
    finishType: '',
    installationType: '',
    otherMaterial: '',
    coverMaterial: '',
    foldable: 'No', // Defaulting to 'No' for boolean conversion
  },
  tradeShopping: {
    brandName: '',
    gst: '', // Number
    sellingPriceType: 'Fixed', // Default to Fixed, for enum
    fixedSellingPrice: '', // Number
    slabPricing: [{ minQuantity: '', maxQuantity: '', price: '' }], // Array of objects
    unit: '',
    packSize: '', // Number
    minOrderedPacks: '', // Number
    isReturnable: 'No', // Defaulting to 'No' for consistency with enum
    stockQuantity: '', // Number
    weightPerUnit: '', // Number
    weightUnit: 'kg',
    shippingType: 'Free', // Default for enum
    packageDimensions: {
      length: '', // Number
      width: '', // Number
      height: '', // Number
      unit: 'cm',
    },
  },
};

const AddProduct = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basicDetails');
  const { token } = useContext(AuthContext);
  const [pickingImage, setPickingImage] = useState(false);
  const [product, setProduct] = useState(initialProductState);

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setProduct((prev) => ({
      ...prev,
      country: countryCode,
      state: '',
      city: '',
    }));
    const states = State.getStatesOfCountry(countryCode);
    setAvailableStates(states);
    setAvailableCities([]);
  };

  const handleStateChange = (stateCode) => {
    setProduct((prev) => ({
      ...prev,
      state: stateCode,
      city: '',
    }));
    const cities = City.getCitiesOfState(selectedCountry, stateCode);
    setAvailableCities(cities);
  };
  const handleCityChange = (city) => {
    setProduct((prev) => ({
      ...prev,
      city: city,
    }));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await axios.get(`https://www.dialexportmart.com/api/adminprofile/category`);
      setSelectedCategory(result.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage({
        message: 'Error fetching categories',
        type: 'danger',
        duration: 3000,
      });
    }
  };

  const handleChange = (name, value) => {
    if (name === 'name') {
      const productslug = generateSlug(value);
      setProduct((prev) => ({ ...prev, name: value, productslug }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (field, subField, name, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...(subField
          ? {
              [subField]: {
                ...prev[field][subField],
                [name]: value,
              },
            }
          : {
              [name]: value,
            }),
      },
    }));
  };

  const updateSlabPricing = (index, key, value) => {
    const updatedSlabs = [...product.tradeShopping.slabPricing];
    updatedSlabs[index][key] = value;
    setProduct((prev) => ({
      ...prev,
      tradeShopping: { ...prev.tradeShopping, slabPricing: updatedSlabs },
    }));
  };

  const addNewSlab = () => {
    setProduct((prev) => ({
      ...prev,
      tradeShopping: {
        ...prev.tradeShopping,
        slabPricing: [...prev.tradeShopping.slabPricing, { minQuantity: '', maxQuantity: '', price: '' }],
      },
    }));
  };

  const removeSlab = (index) => {
    const updatedSlabs = product.tradeShopping.slabPricing.filter((_, i) => i !== index);
    setProduct((prev) => ({
      ...prev,
      tradeShopping: { ...prev.tradeShopping, slabPricing: updatedSlabs },
    }));
  };

  const handleImageSelection = async () => {
    setPickingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.5,
        base64: true,
        selectionLimit: 6 - (product?.images?.length || 0),
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.base64);
        setProduct((prev) => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
      } else if (result.canceled) {
        console.log('User cancelled image picker');
      } else {
        console.log('ImagePicker Error: No assets selected or error occurred.');
        showMessage({
          message: 'Error selecting image.',
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showMessage({
        message: 'Error picking image. Please try again.',
        type: 'danger',
        duration: 3000,
      });
    } finally {
      setPickingImage(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (!token) {
        showMessage({
          message: 'User not authenticated',
          type: 'danger',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      const formattedProduct = {
        ...product,
        price: Number(product.price) || null, // Convert to Number, use null if empty as per schema
        minimumOrderQuantity: Number(product.minimumOrderQuantity) || null, // Convert to Number
        stock: Number(product.stock) || 0, // Convert to Number, default to 0 as per schema
        images: product.images.map((imgBase64) => ({ url: `data:image/jpeg;base64,${imgBase64}` })), // Use JPEG as a common default MIME type.

        tradeInformation: {
          ...product.tradeInformation,
          mainExportMarkets: product.tradeInformation.mainExportMarkets
            ? product.tradeInformation.mainExportMarkets.split(',').map((m) => m.trim()).filter(m => m !== '')
            : [], // Ensure it's an array, filter out empty strings
          sampleAvailable: product.tradeInformation.sampleAvailable === 'Yes' ? 'Yes' : 'No', // Ensure 'Yes' or 'No'
        },

        specifications: {
          ...product.specifications,
          // --- All numeric specifications fields (from String in UI to Number in schema) ---
          thicknessTolerance: Number(product.specifications.thicknessTolerance) || null,
          width: Number(product.specifications.width) || null,
          length: Number(product.specifications.length) || null,
          weight: Number(product.specifications.weight) || null,
          widthTolerance: Number(product.specifications.widthTolerance) || null,
          thickness: Number(product.specifications.thickness) || null, // Changed from size to thickness based on schema observation
          // MetalsType is an array of strings, ensure it's handled correctly if input is string
          metalsType: Array.isArray(product.specifications.metalsType)
            ? product.specifications.metalsType
            : (product.specifications.metalsType ? String(product.specifications.metalsType).split(',').map(m => m.trim()).filter(m => m !== '') : []),
          foldable: product.specifications.foldable === 'Yes', // Convert to Boolean true/false
        },

        tradeShopping: {
          ...product.tradeShopping,
          gst: Number(product.tradeShopping.gst) || null, // Convert to Number, handle null for enum
          fixedSellingPrice: Number(product.tradeShopping.fixedSellingPrice) || null,
          slabPricing: product.tradeShopping.slabPricing
            .map(slab => ({
              minQuantity: Number(slab.minQuantity) || null,
              maxQuantity: Number(slab.maxQuantity) || null,
              price: Number(slab.price) || null,
            }))
            .filter(slab => slab.minQuantity !== null && slab.maxQuantity !== null && slab.price !== null), // Filter out incomplete slabs

          packSize: Number(product.tradeShopping.packSize) || null, // Convert to Number
          minOrderedPacks: Number(product.tradeShopping.minOrderedPacks) || null, // Convert to Number
          isReturnable: product.tradeShopping.isReturnable === 'Yes' ? 'Yes' : 'No', // Ensure 'Yes' or 'No'
          stockQuantity: Number(product.tradeShopping.stockQuantity) || null, // Convert to Number
          weightPerUnit: Number(product.tradeShopping.weightPerUnit) || null, // Convert to Number

          // Package Dimensions
          packageDimensions: {
            length: product.tradeShopping.packageDimensions.length
              ? Number(product.tradeShopping.packageDimensions.length)
              : null,
            width: product.tradeShopping.packageDimensions.width
              ? Number(product.tradeShopping.packageDimensions.width)
              : null,
            height: product.tradeShopping.packageDimensions.height
              ? Number(product.tradeShopping.packageDimensions.height)
              : null,
            unit: product.tradeShopping.packageDimensions.unit || 'cm',
          },
        },
      };

      // Log the formatted product data before sending (for debugging)
      console.log("Formatted Product Data sent to API:", JSON.stringify(formattedProduct, null, 2));

      const response = await axios.post(
        `https://www.dialexportmart.com/api/userprofile/manageproducts`,
        formattedProduct,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        showMessage({
          message: 'Product created successfully!',
          type: 'success',
          duration: 11000,
        });
        setProduct({ ...initialProductState }); // Reset form after successful submission
        setSelectedCountry(''); // Reset country picker
        setAvailableStates([]); // Reset states
        setAvailableCities([]); // Reset cities
      } else {
        showMessage({
          message: response.data.message || 'Failed to create product.',
          type: 'danger',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('❌ Error submitting product:', error);
      if (error.response) {
        console.error('Server Error Response Data:', error.response.data);
        showMessage({
          message: error.response.data.message || `❌ Server Error: ${error.response.status}. Please try again later.`,
          type: 'danger',
          duration: 5000,
        });
      } else if (error.request) {
        console.error('No response received from server:', error.request);
        showMessage({
          message: '❌ No response from server. Please check your internet connection.',
          type: 'danger',
          duration: 3000,
        });
      } else {
        console.error('Error setting up the request (frontend issue):', error.message);
        showMessage({
          message: `❌ Error: ${error.message}. Please try again.`,
          type: 'danger',
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tabContainer}>
        {['basicDetails', 'description', 'specifications', 'tradeShopping'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'basicDetails' ? 'Basic Details' :
                tab === 'description' ? 'Description' :
                  tab === 'specifications' ? 'Specifications' : 'Trade Shopping'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'basicDetails' && (
        <View style={styles.tabContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              name="name"
              value={product.name}
              onChangeText={(text) => handleChange('name', text)}
              required
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Slug</Text>
            <TextInput
              style={styles.input}
              name="productslug"
              value={product.productslug}
              editable={false}
              selectTextOnFocus={false}
              placeholder="Auto-generated"
            />
          </View>

          <View style={styles.row}>
            {/* Category Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Category</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.category}
                onValueChange={(itemValue) => setProduct({ ...product, category: itemValue })}
                required>
                <Picker.Item label="Select Category" value="" />
                {selectedCategory.map((category) => (
                  <Picker.Item key={category._id} label={category.name} value={category._id} />
                ))}
              </Picker>
            </View>

            {/* Subcategory Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Subcategory</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.subCategory}
                onValueChange={(itemValue) => setProduct({ ...product, subCategory: itemValue })}
                enabled={!!product.category}
                required>
                <Picker.Item label="Select Subcategory" value="" />
                {selectedCategory
                  .find((cat) => cat._id === product.category)
                  ?.subcategories?.map((sub) => (
                    <Picker.Item key={sub._id} label={sub.name} value={sub._id} />
                  ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              name="price"
              value={product.price}
              onChangeText={(text) => handleChange('price', text)}
              required
            />
            <View style={styles.currencyDropdown}>
              <Picker
                style={styles.picker}
                selectedValue={product.currency}
                onValueChange={(itemValue) => handleChange('currency', itemValue)}
                required>
                <Picker.Item label="INR (₹)" value="INR" />
                <Picker.Item label="USD ($)" value="USD" />
                <Picker.Item label="EUR (€)" value="EUR" />
                <Picker.Item label="GBP (£)" value="GBP" />
                <Picker.Item label="AUD (A$)" value="AUD" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Minimum Order Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              name="minimumOrderQuantity"
              value={product.minimumOrderQuantity}
              onChangeText={(text) => handleChange('minimumOrderQuantity', text)}
              required
            />
            <View style={styles.moqUnitDropdown}>
              <Picker
                style={styles.picker}
                selectedValue={product.moqUnit}
                onValueChange={(itemValue) => handleChange('moqUnit', itemValue)}
                required>
                <Picker.Item label="Kilogram" value="Kilograms" />
                <Picker.Item label="Piece" value="Piece/Pieces" />
                <Picker.Item label="Meter" value="Meter" />
                <Picker.Item label="Ton" value="Ton/Tons" />
                <Picker.Item label="Unit" value="Unit/Units" />
              </Picker>
            </View>
          </View>

          {/* Image Upload Section */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Images (Max 6)</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageSelection}
              disabled={pickingImage || (product?.images?.length || 0) >= 6} // Disable if picking or max images reached
            >
              {pickingImage ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload Images</Text>
              )}
            </TouchableOpacity>
            {product?.images?.length > 0 && (
              <View style={styles.imagePreviewContainer}>
                {product?.images.map((img, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${img}` }} // Use jpeg as it's common for base64
                      style={styles.previewImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        const updatedImages = product.images.filter((_, i) => i !== index);
                        setProduct((prev) => ({ ...prev, images: updatedImages }));
                      }}
                    >
                      <Text style={styles.removeImageText}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View>
            {/* Country Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Country</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.country}
                onValueChange={(itemValue) => handleCountryChange(itemValue)}>
                <Picker.Item label="Select Country" value="" />
                {Country.getAllCountries().map((country) => (
                  <Picker.Item key={country.isoCode} label={country.name} value={country.isoCode} />
                ))}
              </Picker>
            </View>

            {/* State Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>State</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.state}
                onValueChange={(itemValue) => handleStateChange(itemValue)}
                enabled={!!selectedCountry}>
                <Picker.Item label="Select State" value="" />
                {availableStates.map((state) => (
                  <Picker.Item key={state.isoCode} label={state.name} value={state.isoCode} />
                ))}
              </Picker>
            </View>

            {/* City Dropdown */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>City</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.city}
                onValueChange={(itemValue) => handleCityChange(itemValue)}
                enabled={!!product.state}>
                <Picker.Item label="Select City" value="" />
                {availableCities.map((city, index) => (
                  <Picker.Item key={index} label={city.name} value={city.name} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'description' && (
        <View style={styles.tabContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              numberOfLines={4}
              name="description"
              value={product.description}
              onChangeText={(text) => handleChange('description', text)}
            />
          </View>
        </View>
      )}

      {activeTab === 'specifications' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Product Specifications</Text>
          <View style={styles.gridContainer}>
            {/* Size */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Size</Text>
              <TextInput
                style={styles.input}
                name="size"
                placeholder="Size"
                value={product.specifications.size}
                onChangeText={(text) => handleNestedChange('specifications', null, 'size', text)}
              />
            </View>

            {/* Product Name */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                name="productName"
                placeholder="Product Name"
                value={product.specifications.productName}
                onChangeText={(text) => handleNestedChange('specifications', null, 'productName', text)}
              />
            </View>

            {/* Thickness & Unit */}
            <View style={styles.gridItem2}>
              <Text style={styles.label}>Thickness</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="number-pad"
                  name="thickness"
                  value={product.specifications.thickness}
                  onChangeText={(text) => handleNestedChange('specifications', null, 'thickness', text)}
                  placeholder="Thickness"
                  min="0"
                  step="any"
                />
                <View style={styles.gridItem}>
                  <Picker
                    style={styles.picker}
                    selectedValue={product.specifications.thicknessUnit}
                    onValueChange={(itemValue) =>
                      handleNestedChange('specifications', null, 'thicknessUnit', itemValue)
                    }>
                    <Picker.Item label="Select" value="" />
                    <Picker.Item label="Meter" value="Meter" />
                    <Picker.Item label="Micrometers (um)" value="Micrometers (um)" />
                    <Picker.Item label="Gauge" value="Gauge" />
                    <Picker.Item label="Feet (ft)" value="Feet (ft)" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Color */}
            <View style={styles.gridItem2}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                name="color"
                placeholder="Color"
                value={product.specifications.color}
                onChangeText={(text) => handleNestedChange('specifications', null, 'color', text)}
              />
            </View>

            {/* Coating */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Coating</Text>
              <TextInput
                style={styles.input}
                name="coating"
                placeholder="Coating"
                value={product.specifications.coating}
                onChangeText={(text) => handleNestedChange('specifications', null, 'coating', text)}
              />
            </View>

            {/* Wood Type */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Wood Type</Text>
              <TextInput
                style={styles.input}
                name="woodType"
                placeholder="Wood Type"
                value={product.specifications.woodType}
                onChangeText={(text) => handleNestedChange('specifications', null, 'woodType', text)}
              />
            </View>

            {/* Usage */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Usage</Text>
              <TextInput
                style={styles.input}
                name="usage"
                placeholder="Usage"
                value={product.specifications.usage}
                onChangeText={(text) => handleNestedChange('specifications', null, 'usage', text)}
              />
            </View>

            {/* processorType */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Processor Type</Text>
              <TextInput
                style={styles.input}
                name="processorType"
                placeholder="Processor Type"
                value={product.specifications.processorType}
                onChangeText={(text) => handleNestedChange('specifications', null, 'processorType', text)}
              />
            </View>

            {/* type */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Type</Text>
              <TextInput
                style={styles.input}
                name="type"
                placeholder="Type"
                value={product.specifications.type}
                onChangeText={(text) => handleNestedChange('specifications', null, 'type', text)}
              />
            </View>

            {/* design */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Design</Text>
              <TextInput
                style={styles.input}
                name="design"
                placeholder="Design"
                value={product.specifications.design}
                onChangeText={(text) => handleNestedChange('specifications', null, 'design', text)}
              />
            </View>

            {/* feature */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Feature</Text>
              <TextInput
                style={styles.input}
                name="feature"
                placeholder="feature"
                value={product.specifications.feature}
                onChangeText={(text) => handleNestedChange('specifications', null, 'feature', text)}
              />
            </View>

            {/* Application */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Application</Text>
              <TextInput
                style={styles.input}
                name="application"
                placeholder="Application"
                value={product.specifications.application}
                onChangeText={(text) => handleNestedChange('specifications', null, 'application', text)}
              />
            </View>
          </View>
        </View>
      )}

      {activeTab === 'tradeShopping' && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Trade Shopping Details</Text>
          <View style={styles.gridContainer}>

            {/* Brand Name */}
            <View style={styles.gridItem2}>
              <Text style={styles.label}>Brand Name</Text>
              <TextInput
                style={styles.input}
                name="brandName"
                value={product.tradeShopping.brandName}
                onChangeText={(text) => handleNestedChange('tradeShopping', null, 'brandName', text)}
              />
            </View>

            {/* GST (%) */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>GST (%)</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.tradeShopping.gst}
                onValueChange={(itemValue) => handleNestedChange('tradeShopping', null, 'gst', itemValue)}>
                <Picker.Item label="0%" value="0" />
                <Picker.Item label="5%" value="5" />
                <Picker.Item label="12%" value="12" />
                <Picker.Item label="18%" value="18" />
                <Picker.Item label="28%" value="28" />
              </Picker>
            </View>

            {/* Selling Price Type */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Selling Price Type</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.tradeShopping.sellingPriceType}
                onValueChange={(itemValue) => handleNestedChange('tradeShopping', null, 'sellingPriceType', itemValue)}>
                <Picker.Item label="Fixed" value="Fixed" />
                <Picker.Item label="Slab Based" value="Slab Based" />
              </Picker>
            </View>

            {/* fixed Selling Price */}
            {product.tradeShopping.sellingPriceType === 'Fixed' && (
              <View style={styles.gridItem2}>
                <Text style={styles.label}>Fixed Selling Price</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  name="fixedSellingPrice"
                  placeholder="MRP of 1 unit (with GST and in Rupees only)"
                  value={product.tradeShopping.fixedSellingPrice}
                  onChangeText={(text) => handleNestedChange('tradeShopping', null, 'fixedSellingPrice', text)}
                />
              </View>
            )}

            {/* Slab-Based Pricing Fields */}
            {product.tradeShopping.sellingPriceType === 'Slab Based' && (
              <View style={[styles.gridItem, { width: '100%' }]}>
                <Text style={styles.label}>Slab-Based Pricing</Text>
                {product.tradeShopping.slabPricing.map((slab, index) => (
                  <View key={index} style={styles.slabRow}>
                    <TextInput
                      style={styles.slabInput}
                      keyboardType="number-pad"
                      placeholder="Min Quantity"
                      value={slab.minQuantity}
                      onChangeText={(text) => updateSlabPricing(index, 'minQuantity', text)}
                    />
                    <TextInput
                      style={styles.slabInput}
                      keyboardType="number-pad"
                      placeholder="Max Quantity"
                      value={slab.maxQuantity}
                      onChangeText={(text) => updateSlabPricing(index, 'maxQuantity', text)}
                    />
                    <TextInput
                      style={styles.slabInput}
                      keyboardType="number-pad"
                      placeholder="Price"
                      value={slab.price}
                      onChangeText={(text) => updateSlabPricing(index, 'price', text)}
                    />
                    <TouchableOpacity style={styles.removeSlabButton} onPress={() => removeSlab(index)}>
                      <Text style={styles.removeSlabText}>❌</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addSlabButton} onPress={addNewSlab}>
                  <Text style={styles.addSlabText}>➕ Add More Slabs</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Unit Dropdown */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Unit</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.tradeShopping.unit}
                onValueChange={(itemValue) => handleNestedChange('tradeShopping', null, 'unit', itemValue)}>
                <Picker.Item label="Select Unit" value="" />
                <Picker.Item label="Kilograms/Kilograms" value="Kilograms/Kilograms" />
                <Picker.Item label="Number" value="Number" />
                <Picker.Item label="Piece/Pieces" value="Piece/Pieces" />
                <Picker.Item label="Ton/Tons" value="Ton/Tons" />
                <Picker.Item label="Unit/Units" value="Unit/Units" />
                <Picker.Item label="Twenty-Foot Container" value="Twenty-Foot Container" />
              </Picker>
            </View>

            {/* Is Returnable? */}
            <View style={styles.gridItem}>
              <Text style={styles.label}>Is Returnable?</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.tradeShopping.isReturnable}
                onValueChange={(itemValue) => handleNestedChange('tradeShopping', null, 'isReturnable', itemValue)}>
                <Picker.Item label="No" value="No" />
                <Picker.Item label="Yes" value="Yes" />
              </Picker>
            </View>

            {/* Shipping Type */}
            <View style={styles.gridItem2}>
              <Text style={styles.label}>Shipping Type</Text>
              <Picker
                style={styles.picker}
                selectedValue={product.tradeShopping.shippingType}
                onValueChange={(itemValue) => handleNestedChange('tradeShopping', null, 'shippingType', itemValue)}>
                <Picker.Item label="Free" value="Free" />
                <Picker.Item label="Flat Rate" value="Flat Rate" />
                <Picker.Item label="% of Order Value" value="% of Order Value" />
                <Picker.Item label="Actual" value="Actual" />
              </Picker>
            </View>

            {/* Package Dimensions */}
            <View style={[styles.gridItem, { width: '100%' }]}>
              <Text style={styles.label}>Package Dimensions</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 5 }]}
                  keyboardType="number-pad"
                  placeholder="Length"
                  name="length"
                  value={product.tradeShopping.packageDimensions.length}
                  onChangeText={(text) => handleNestedChange('tradeShopping', 'packageDimensions', 'length', text)}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 5 }]}
                  keyboardType="number-pad"
                  placeholder="Width"
                  name="width"
                  value={product.tradeShopping.packageDimensions.width}
                  onChangeText={(text) => handleNestedChange('tradeShopping', 'packageDimensions', 'width', text)}
                />
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 5 }]}
                  keyboardType="number-pad"
                  placeholder="Height"
                  name="height"
                  value={product.tradeShopping.packageDimensions.height}
                  onChangeText={(text) => handleNestedChange('tradeShopping', 'packageDimensions', 'height', text)}
                />
              </View>
              <View style={styles.gridItem2}>
                <Picker
                  style={styles.picker}
                  selectedValue={product.tradeShopping.packageDimensions.unit}
                  onValueChange={(itemValue) => handleNestedChange('tradeShopping', 'packageDimensions', 'unit', itemValue)}>
                  <Picker.Item label="Inches" value="Inches" />
                  <Picker.Item label="cm" value="cm" />
                </Picker>
              </View>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Add Product'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
    marginBottom: 90,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,

    // Border
    borderWidth: 2,
    borderColor: '#6D4AAE',
    elevation: 4,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderRadius: 10,
  },

  activeTab: {
    backgroundColor: '#6D4AAE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  tabText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    flexShrink: 1,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '500',
  },

  tabContent: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  dropdownContainer: {
    flex: 1,
  },
  picker: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    color: '#333',
  },
  // Removed inputWithDropdown as it's no longer needed for separate rows
  currencyDropdown: {
    marginTop: 10, // Added margin to move it to the next row
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  moqUnitDropdown: {
    marginTop: 10, // Added margin to move it to the next row
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  previewImage: {
    width: 80, // Increased size for better visibility
    height: 80, // Increased size for better visibility
    borderRadius: 5,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    borderRadius: 15,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%', // Adjust as needed for spacing
    marginBottom: 15,
  },
  gridItem2: {
    width: '100%', // Adjust as needed for spacing
    marginBottom: 15,
  },
  slabRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  slabInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  addSlabButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addSlabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeSlabButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
  },
  removeSlabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddProduct;