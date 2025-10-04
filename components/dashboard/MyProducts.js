import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Platform,
  Alert,
  ToastAndroid,
  Switch,
    RefreshControl
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "react-native-image-picker";
import { Picker } from "@react-native-picker/picker";

// Assuming LocationSelector is a converted React Native component
// Make sure this path is correct based on your project structure
import LocationSelector from "../../components/LocationSelector";
import { AuthContext } from "../../context/AuthContext"; // adjust path if needed

// Helper function for toasts (basic implementation)
const showToast = (message, type = "success") => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, you might want to use a more sophisticated toast library
    // or just a simple Alert for now.
    Alert.alert("Notification", message);
  }
};

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedField, setSelectedField] = useState("");
    const [refreshing, setRefreshing] = useState(false); // ✅ Add refreshing state
  const { token } = useContext(AuthContext); // ✅ get token from context

  const [formData, setFormData] = useState({
    basicDetails: {
      name: "",
      productslug: "",
      price: "",
      currency: "INR",
      minimumOrderQuantity: "",
      moqUnit: "",
      state: "",
      city: "",
      images: [], // Removed image array
    },
    description: "",
      specifications: {
      productType: "",
      material: "",
      finish: "",
      thicknessTolerance: "",
      thicknessToleranceUnit: "",
      width: "",
      widthUnit: "",
      length: "",
      lengthUnit: "",
      weight: "",
      weightUnit: "",
      metalsType: [],
      widthTolerance: "",
      widthToleranceUnit: "",
      shape: "",
      size: "",
      productName: "",
      thickness: "",
      thicknessUnit: "",
      color: "",
      coating: "",
      woodType: "",
      usage: "",
      processorType: "",
      type: "",
      design: "",
      feature: "",
      metalType: "",
      application: "",
      finishing: "",
      origin: "",
      finishType: "",
      installationType: "",
      otherMaterial: "",
      coverMaterial: "",
      foldable: false,
    },
    tradeInformation: {
            supplyAbility: "",
      supplyQuantity: "",
      supplyUnit: "Per Day",
      deliveryTime: "",
      fobPort: "",
      samplePolicy: "",
      sampleAvailable: "",
      mainExportMarkets: "",
      certifications: "",
      packagingDetails: "",
      paymentTerms: "",
      mainDomesticMarket: "",
    },
  tradeShopping: {
    brandName: "",
    gst: "0", // Keep as string for TextInput
    sellingPriceType: "Fixed",
    fixedSellingPrice: "", // Used for Fixed price
    mrp: "",
    unit: "",
    packSize: "",
    minOrderedPacks: "",
    isReturnable: "No",
    stockQuantity: "",
    weightPerUnit: "",
    weightUnit: "",
    shippingType: "Free",
    packageDimensions: {
      length: "",
      width: "",
      height: "",
      unit: "",
    },
    // Add slabPricing to initial state
    slabPricing: [],
  },
  });

  // ✅ Define the function to fetch products
  const fetchProducts = async () => {
    try {
      if (!token) {
        showToast("User not authenticated", "error");
        return;
      }
      const res = await axios.get(
        `https://www.dialexportmart.com/api/userprofile/manageproducts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success && Array.isArray(res.data.products)) {
        setProducts(res.data.products.reverse());
      } else {
        showToast(res.data.message || "No products found.", "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Error fetching products.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create the onRefresh handler function
  const onRefresh = async () => {
    setRefreshing(true); // Start showing the refresh indicator
    await fetchProducts(); // Call the fetch function to get new data
    setRefreshing(false); // Hide the refresh indicator when done
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);


  const handleDelete = async (id) => {
    Alert.alert(
      "Are you sure?",
      "You won't be able to undo this action!",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Deletion cancelled"),
          style: "cancel",
        },
        {
          text: "Yes, delete it!",
          onPress: async () => {
            try {
              if (!token) {
                showToast("User not authenticated", "error");
                return;
              }
              const res = await axios.delete(
                `https://www.dialexportmart.com/api/userprofile/manageproducts/${id}`, // **UPDATE WITH YOUR ACTUAL BACKEND URL**
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              if (res.data.success) {
                showToast("Product deleted successfully!");
                setProducts((prev) =>
                  prev.filter((product) => product._id !== id)
                );
              } else {
                showToast(
                  res.data.message || "Failed to delete product.",
                  "error"
                );
              }
            } catch (error) {
              showToast("Failed to delete product.", "error");
              console.error("Error deleting product:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

const openModal = (product, field) => {
  setSelectedProduct(product);
  setSelectedField(field);

  // Default values to ensure nested objects exist
  const defaultTradeShopping = {
    brandName: "", gst: "0", sellingPriceType: "Fixed", fixedSellingPrice: "",
    mrp: "", unit: "", packSize: "", minOrderedPacks: "", isReturnable: "No",
    stockQuantity: "", weightPerUnit: "", weightUnit: "", shippingType: "Free",
    packageDimensions: { length: "", width: "", height: "", unit: "" },
    slabPricing: [], // Ensure slabPricing is always an array
  };

  const currentTradeShopping = {
    ...defaultTradeShopping,
    ...product.tradeShopping,
  };

  setFormData({
    basicDetails: {
      name: product.name || "",
      productslug: product.productslug || "",
      price: String(product.price) || "",
      currency: product.currency || "INR",
      minimumOrderQuantity: String(product.minimumOrderQuantity) || "",
      moqUnit: product.moqUnit || "Number",
      state: product.state || "",
      city: product.city || "",
      images: [],
    },
    description: product.description || "",
    tradeInformation: {
      supplyAbility: String(product.tradeInformation?.supplyAbility) || "",
      supplyQuantity: String(product.tradeInformation?.supplyQuantity) || "",
      supplyUnit: product.tradeInformation?.supplyUnit || "Per Day",
      deliveryTime: product.tradeInformation?.deliveryTime || "",
      fobPort: product.tradeInformation?.fobPort || "",
      samplePolicy: product.tradeInformation?.samplePolicy || "",
      sampleAvailable: product.tradeInformation?.sampleAvailable || "",
      mainExportMarkets: product.tradeInformation?.mainExportMarkets || "",
      certifications: product.tradeInformation?.certifications || "",
      packagingDetails: product.tradeInformation?.packagingDetails || "",
      paymentTerms: product.tradeInformation?.paymentTerms || "",
      mainDomesticMarket: product.tradeInformation?.mainDomesticMarket || "",
    },
    specifications: {
      productType: product.specifications?.productType || "",
      material: product.specifications?.material || "",
      finish: product.specifications?.finish || "",
      thicknessTolerance: product.specifications?.thicknessTolerance || "",
      thicknessToleranceUnit: product.specifications?.thicknessToleranceUnit || "",
      width: product.specifications?.width || "",
      widthUnit: product.specifications?.widthUnit || "",
      length: product.specifications?.length || "",
      lengthUnit: product.specifications?.lengthUnit || "",
      weight: product.specifications?.weight || "",
      weightUnit: product.specifications?.weightUnit || "",
      metalsType: product.specifications?.metalsType || [], // Ensure it's an array
      widthTolerance: product.specifications?.widthTolerance || "",
      widthToleranceUnit: product.specifications?.widthToleranceUnit || "",
      shape: product.specifications?.shape || "",
      size: product.specifications?.size || "",
      productName: product.specifications?.productName || "",
      thickness: product.specifications?.thickness || "",
      thicknessUnit: product.specifications?.thicknessUnit || "",
      color: product.specifications?.color || "",
      coating: product.specifications?.coating || "",
      woodType: product.specifications?.woodType || "",
      usage: product.specifications?.usage || "",
      processorType: product.specifications?.processorType || "",
      type: product.specifications?.type || "",
      design: product.specifications?.design || "",
      feature: product.specifications?.feature || "",
      metalType: product.specifications?.metalType || "",
      application: product.specifications?.application || "",
      finishing: product.specifications?.finishing || "",
      origin: product.specifications?.origin || "",
      finishType: product.specifications?.finishType || "",
      installationType: product.specifications?.installationType || "",
      otherMaterial: product.specifications?.otherMaterial || "",
      coverMaterial: product.specifications?.coverMaterial || "",
      foldable: product.specifications?.foldable || false, // Ensure boolean
    },
    tradeShopping: {
      // Use the merged currentTradeShopping
      ...currentTradeShopping,
      // Convert all relevant numeric fields to string for TextInput
      gst: String(currentTradeShopping.gst),
      fixedSellingPrice: String(currentTradeShopping.fixedSellingPrice),
      mrp: String(currentTradeShopping.mrp),
      packSize: String(currentTradeShopping.packSize),
      minOrderedPacks: String(currentTradeShopping.minOrderedPacks),
      stockQuantity: String(currentTradeShopping.stockQuantity),
      weightPerUnit: String(currentTradeShopping.weightPerUnit),
      // weightUnit is already a string, no conversion needed here
      packageDimensions: {
        length: String(currentTradeShopping.packageDimensions?.length || ""),
        width: String(currentTradeShopping.packageDimensions?.width || ""),
        height: String(currentTradeShopping.packageDimensions?.height || ""),
        unit: currentTradeShopping.packageDimensions?.unit || "",
      },
      // Ensure slabPricing is an array of objects with string values
      slabPricing: Array.isArray(currentTradeShopping.slabPricing)
        ? currentTradeShopping.slabPricing.map(slab => ({
            minQuantity: String(slab.minQuantity || ""),
            maxQuantity: String(slab.maxQuantity || ""),
            price: String(slab.price || ""),
          }))
        : [],
    },
  });
  setShowModal(true);
};

  const handleChange = (value, name) => {
    const keys = name.split(".");

    setFormData((prevData) => {
      if (keys.length === 1) {
        return { ...prevData, [name]: value };
      } else if (keys.length === 2) {
        const [section, field] = keys;
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            [field]: value,
          },
        };
      } else if (keys.length === 3) {
        const [section, subSection, field] = keys;
        return {
          ...prevData,
          [section]: {
            ...prevData[section],
            [subSection]: {
              ...prevData[section][subSection],
              [field]: value,
            },
          },
        };
      }
      return prevData; // Should not happen
    });
  };

const handleUpdate = async () => {
  if (!selectedProduct) return;

  try {
    if (!token) {
      showToast("User not authenticated", "error");
      return;
    }

    let updateData = {};

    if (selectedField === "basicDetails") {
      updateData = {
        name: formData.basicDetails.name,
        productslug: formData.basicDetails.productslug,
        price: parseFloat(formData.basicDetails.price),
        currency: formData.basicDetails.currency,
        minimumOrderQuantity: parseFloat(formData.basicDetails.minimumOrderQuantity),
        moqUnit: formData.basicDetails.moqUnit,
        state: formData.basicDetails.state,
        city: formData.basicDetails.city,
      };
    } else if (selectedField === "description") {
      updateData = {
        description: formData.description,
      };
    } else if (selectedField === "specifications") {
      updateData = {
        tradeInformation: {
          ...selectedProduct.tradeInformation,
          ...formData.tradeInformation,
          supplyQuantity: parseFloat(formData.tradeInformation.supplyQuantity),
        },
        specifications: {
          ...selectedProduct.specifications,
          ...formData.specifications,
        },
      };
    } else if (selectedField === "tradeShopping") {
      const tradeShoppingPayload = {
        ...selectedProduct.tradeShopping, // Preserve existing fields
        ...formData.tradeShopping,
        gst: formData.tradeShopping.gst,
        mrp: parseFloat(formData.tradeShopping.mrp),
        packSize: parseFloat(formData.tradeShopping.packSize),
        minOrderedPacks: parseFloat(formData.tradeShopping.minOrderedPacks),
        stockQuantity: parseFloat(formData.tradeShopping.stockQuantity),
        weightPerUnit: parseFloat(formData.tradeShopping.weightPerUnit),
        weightUnit: formData.tradeShopping.weightUnit, // Keep as string
        packageDimensions: {
          ...selectedProduct.tradeShopping?.packageDimensions,
          ...formData.tradeShopping?.packageDimensions,
          length: parseFloat(formData.tradeShopping.packageDimensions.length),
          width: parseFloat(formData.tradeShopping.packageDimensions.width),
          height: parseFloat(formData.tradeShopping.packageDimensions.height),
        },
      };

      // Handle sellingPriceType and associated fields
      if (formData.tradeShopping.sellingPriceType === "Fixed") {
        tradeShoppingPayload.fixedSellingPrice = parseFloat(formData.tradeShopping.fixedSellingPrice);
        // Ensure slabPricing is not sent or is empty if type is Fixed
        delete tradeShoppingPayload.slabPricing;
      } else if (formData.tradeShopping.sellingPriceType === "Slab Based") {
        tradeShoppingPayload.fixedSellingPrice = 0; // Or null, or whatever default you prefer if slab-based
        tradeShoppingPayload.slabPricing = formData.tradeShopping.slabPricing.map(slab => ({
          minQuantity: parseFloat(slab.minQuantity),
          maxQuantity: parseFloat(slab.maxQuantity),
          price: parseFloat(slab.price),
        }));
        // Ensure fixedSellingPrice is not sent or is 0 if type is Slab Based
        // You might need to decide how your backend handles this.
        // For now, setting to 0 is a safe default if it's required but not actively used.
        tradeShoppingPayload.fixedSellingPrice = 0;
      }

      updateData = { tradeShopping: tradeShoppingPayload };
    }

    const finalUpdatePayload = {
      productId: selectedProduct._id,
      ...updateData,
    };

    const res = await axios.patch(
      `https://www.dialexportmart.com/api/userprofile/manageproducts/${selectedProduct._id}`,
      finalUpdatePayload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      showToast("Product updated successfully!");
      // Update the product in the local state to reflect changes
      setProducts((prev) =>
        prev.map((p) => {
          if (p._id === selectedProduct._id) {
            // Deep merge for nested objects to preserve un-updated fields
            const updatedProduct = { ...p };
            if (selectedField === "basicDetails") {
              updatedProduct.name = updateData.name;
              updatedProduct.productslug = updateData.productslug;
              updatedProduct.price = updateData.price;
              updatedProduct.currency = updateData.currency;
              updatedProduct.minimumOrderQuantity = updateData.minimumOrderQuantity;
              updatedProduct.moqUnit = updateData.moqUnit;
              updatedProduct.state = updateData.state;
              updatedProduct.city = updateData.city;
            } else if (selectedField === "description") {
              updatedProduct.description = updateData.description;
            } else if (selectedField === "specifications") {
              updatedProduct.tradeInformation = {
                ...updatedProduct.tradeInformation,
                ...updateData.tradeInformation,
              };
              updatedProduct.specifications = {
                ...updatedProduct.specifications,
                ...updateData.specifications,
              };
            } else if (selectedField === "tradeShopping") {
              updatedProduct.tradeShopping = {
                ...updatedProduct.tradeShopping,
                ...updateData.tradeShopping,
              };
            }
            return updatedProduct;
          }
          return p;
        })
      );
      setShowModal(false);
    } else {
      showToast(res.data.message || "Failed to update product.", "error");
    }
  } catch (error) {
    console.error("❌ Error updating product:", error.response?.data || error.message);
    showToast("Failed to update product. Check console for details.", "error");
  }
};
  // Removed handleImageUpload function

  const getBadgeStyle = (strength) => {
    switch (strength) {
      case "High":
        return styles.badgeSuccess;
      case "Medium":
        return styles.badgeWarning;
      case "Low":
        return styles.badgeDanger;
      default:
        return styles.badgeSecondary;
    }
  };

  const calculateProgress = (product) => {
    let totalFields = 0;
    let completedFields = 0;

    const checkAndCount = (obj) => {
      if (!obj) return; // Skip if object is null or undefined
      Object.keys(obj).forEach((key) => {
        // Exclude 'images' from direct field count as it's handled separately
        if (key === 'images' && Array.isArray(obj[key])) {
          totalFields++;
          if (obj[key].length > 0) {
            completedFields++;
          }
          return;
        }
        totalFields++;
        if (obj[key] !== null && obj[key] !== "" && obj[key] !== undefined) {
          completedFields++;
        }
      });
    };

    // Basic Details (excluding images, handled separately)
    checkAndCount({
      name: product.name,
      productslug: product.productslug,
      price: product.price,
      currency: product.currency,
      minimumOrderQuantity: product.minimumOrderQuantity,
      moqUnit: product.moqUnit,
      state: product.state,
      city: product.city,
    });

    // Handle images separately for basicDetails
    totalFields++; // For the 'images' field itself
    if (product.images && product.images.length > 0) {
      completedFields++;
    }

    // Description
    totalFields++;
    if (product.description !== null && product.description !== "" && product.description !== undefined) {
      completedFields++;
    }

    // Trade Information
    checkAndCount(product.tradeInformation);

    // Specifications
    checkAndCount(product.specifications);

    // Trade Shopping
    checkAndCount(product.tradeShopping);
    // Special handling for nested packageDimensions
    if (product.tradeShopping?.packageDimensions) {
      checkAndCount(product.tradeShopping.packageDimensions);
    }


    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  };


  return (
  <ScrollView
      style={styles.container}
      // ✅ Now, `onRefresh` is a defined function and the error is resolved
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loadingIndicator}
        />
      ) : products.length === 0 ? (
        <Text style={styles.noProductsText}>No products found.</Text>
      ) : (
        products.map((product) => {
          let productImage = "https://via.placeholder.com/100"; // Default placeholder

          // Try to use the first image if available and has data
            if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];

            // 1. Prioritize Cloudinary URL if available
            if (firstImage.url) {
              productImage = firstImage.url;
            }
            // 2. Fallback to base64 data if 'url' is not present but 'data' is
            // This handles images newly uploaded in the modal before they are saved to Cloudinary
            else if (firstImage.data) {
              try {
                productImage = `data:${
                  firstImage.contentType || "image/jpeg"
                };base64,${firstImage.data}`;
              } catch (error) {
                console.error("Error constructing base64 image URI:", error);
                // Optionally revert to placeholder if base64 construction fails
                productImage = "https://via.placeholder.com/100";
              }
            }
          }

          return (
                <View key={product._id} style={styles.productCard}>
            <View style={styles.productContent}>
              <View>

              <Image
                source={{ uri: productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.dateTimeContainer}>
  {/* Created At */}
  <View style={styles.dateTimeBox}>
    <Text style={styles.dateTimeBold}>Created At:</Text>
    <Text style={styles.dateTimeValue}>
      {product?.createdAt
        ? new Date(product.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "N/A"}
    </Text>
    <Text style={styles.dateTimeValue}>
      {product?.createdAt
        ? new Date(product.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : ""}
    </Text>
  </View>

  {/* Updated At */}
  <View style={styles.dateTimeBox}>
    <Text style={styles.dateTimeBold}>Updated At:</Text>
    <Text style={styles.dateTimeValue}>
      {product?.updatedAt
        ? new Date(product.updatedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "N/A"}
    </Text>
    <Text style={styles.dateTimeValue}>
      {product?.updatedAt
        ? new Date(product.updatedAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : ""}
    </Text>
  </View>
</View>

              </View>
              
              <View style={styles.productDetails}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
            
                </View>

                <View style={styles.priceOrderContainer}>
                  <Text style={styles.priceText}>
                    INR {product.price ? product.price.toFixed(2) : "N/A"}
                  </Text>
                  <Text style={styles.minOrderText}>
                    {product.minimumOrderQuantity || "N/A"} Min Order
                  </Text>
                </View>

                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${calculateProgress(product)}%` },
                    ]}
                  />
                </View>

                <View style={styles.progressStrengthContainer}>
                  <Text style={styles.progressText}>
                    {Math.round(calculateProgress(product))}% Complete
                  </Text>
                  <View
                    style={[styles.badge, getBadgeStyle(product.strength)]}
                  >
                    <Text style={styles.badgeText}>
                      {product.strength || "N/A"} Strength
                    </Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => openModal(product, "basicDetails")}
                  >
                    <Text style={styles.actionText}>+ Add Basic Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openModal(product, "description")}
                  >
                    <Text style={styles.actionText}>+ Add Description</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openModal(product, "specifications")}
                  >
                    <Text style={styles.actionText}>+ Add Specifications</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openModal(product, "tradeShopping")}
                  >
                    <Text style={styles.actionText}>+ Add Trade Shopping</Text>
                  </TouchableOpacity>

                </View>
<TouchableOpacity 
  style={styles.trashIconContainer} // New style for the TouchableOpacity
  onPress={() => handleDelete(product._id)}
>
  <Icon
    name="trash"
    size={20}
    color="#dc3545" // Bootstrap red
  />
</TouchableOpacity>
              </View>
            </View>
          </View>
          );
        })
      )}

      {/* React Native Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Update {selectedField.replace(/([A-Z])/g, " $1")}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="times" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {/* Basic details */}
              {selectedField === "basicDetails" && (
                <View>
                  {/* Product Name */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Product Name</Text>
                    <TextInput
                      style={styles.formControl}
                      onChangeText={(text) => {
                        const name = text;
                        const slug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .trim()
                          .replace(/\s+/g, "-");

                        setFormData({
                          ...formData,
                          basicDetails: {
                            ...formData.basicDetails,
                            name,
                            productslug: slug,
                          },
                        });
                      }}
                      value={formData.basicDetails.name}
                    />
                  </View>

                  {/* Product Slug */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Product Slug</Text>
                    <TextInput
                      style={[styles.formControl, { backgroundColor: "#f0f0f0" }]} // Disabled visual
                      value={formData.basicDetails.productslug}
                      editable={false} // Make it read-only
                    />
                  </View>

                  {/* Product Image */}
              

                  {/* Price */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Price</Text>
                    <TextInput
                      style={styles.formControl}
                      keyboardType="numeric"
                      value={String(formData.basicDetails.price)}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          basicDetails: { ...formData.basicDetails, price: text },
                        })
                      }
                    />
                  </View>

                  {/* Currency Dropdown */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Currency</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={formData.basicDetails.currency}
                        onValueChange={(itemValue) =>
                          setFormData({
                            ...formData,
                            basicDetails: {
                              ...formData.basicDetails,
                              currency: itemValue,
                            },
                          })
                        }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="INR (₹)" value="INR" />
                        <Picker.Item label="USD ($)" value="USD" />
                        <Picker.Item label="EUR (€)" value="EUR" />
                        <Picker.Item label="GBP (£)" value="GBP" />
                      </Picker>
                    </View>
                  </View>

                  {/* Minimum Order Quantity */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Minimum Order Quantity</Text>
                    <TextInput
                      style={styles.formControl}
                      keyboardType="numeric"
                      value={String(formData.basicDetails.minimumOrderQuantity)}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          basicDetails: { ...formData.basicDetails, minimumOrderQuantity: text },
                        })
                      }
                    />
                  </View>

                           {/* moqUnit */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>MOQ Unit</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={formData.basicDetails.moqUnit}
                        onValueChange={(itemValue) =>
                          setFormData({
                            ...formData,
                            basicDetails: {
                              ...formData.basicDetails,
                              moqUnit: itemValue,
                            },
                          })
                        }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="Kilogram" value="Kilograms" />
                        <Picker.Item label="Piece" value="Piece/Pieces" />
                        <Picker.Item label="Meter" value="Meter" />
                        <Picker.Item label="Ton" value="Ton/Tons" />
                        <Picker.Item label="Unit" value="Unit/Units" />
                      </Picker>
                    </View>
                  </View>

                  {/* Location Selector (ensure it's updated to pass props correctly if needed) */}
                  <LocationSelector
                    formData={formData}
                    setFormData={setFormData}
                  />
                </View>
              )}

              {/* Description */}
              {selectedField === "description" && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formControl, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    value={formData.description || ""}
                    onChangeText={(text) => handleChange(text, "description")}
                  />
                </View>
              )}

              {/* Product Specifications Section */}
              {selectedField === "specifications" && (
                <View>
                  <Text style={styles.sectionTitle}>Trade Information</Text>
                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Supply Ability</Text>
                      <View style={styles.twoColumnInput}>
                        <TextInput
                          style={[
                            styles.formControl,
                            styles.flex1,
                            styles.marginRight,
                          ]}
                          keyboardType="numeric"
                          value={String(
                            formData.tradeInformation?.supplyQuantity || ""
                          )}
                          onChangeText={(text) =>
                            handleChange(text, "tradeInformation.supplyQuantity")
                          }
                          placeholder="Enter quantity"
                        />
                      </View>
                    </View>
                            <View style={styles.col12}>
     <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={
                              formData.tradeInformation?.supplyUnit || "Per Day"
                            }
                            onValueChange={(itemValue) =>
                              handleChange(itemValue, "tradeInformation.supplyUnit")
                            }
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                          >
                            <Picker.Item label="Per Day" value="Per Day" />
                            <Picker.Item label="Per Week" value="Per Week" />
                            <Picker.Item label="Per Month" value="Per Month" />
                            <Picker.Item label="Per Year" value="Per Year" />
                          </Picker>
                        </View>
</View>
</View>

<View style={styles.row}>
<View style={styles.col12}>
  <Text style={styles.formLabel}>Delivery Time</Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={
        formData.tradeInformation?.deliveryTime || ""
      }
      onValueChange={(itemValue) =>
        handleChange(
          itemValue,
          "tradeInformation.deliveryTime"
        )
      }
      style={styles.picker}
      itemStyle={styles.pickerItem}
    >
      <Picker.Item label="Select" value="" />
      <Picker.Item label="7 Days" value="7 Days" />
      <Picker.Item label="15 Days" value="15 Days" />
      <Picker.Item label="30 Days" value="30 Days" />
    </Picker>
  </View>
</View>
</View>

                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>FOB Port</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.tradeInformation?.fobPort || ""}
                        onChangeText={(text) =>
                          handleChange(text, "tradeInformation.fobPort")
                        }
                      />
                    </View>

                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Sample Policy</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.tradeInformation?.samplePolicy || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "tradeInformation.samplePolicy"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="Free Sample" value="Free Sample" />
                          <Picker.Item label="Paid Sample" value="Paid Sample" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  {/* Sample Available Radio Buttons */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Sample Available</Text>
                    <View style={styles.radioGroup}>
                      {["Yes", "No"].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.radioButton}
                          onPress={() =>
                            handleChange(option, "tradeInformation.sampleAvailable")
                          }
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              formData.tradeInformation?.sampleAvailable ===
                                option && styles.selectedRadioCircle,
                            ]}
                          />
                          <Text style={styles.radioLabel}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Main Export Market(s)</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.tradeInformation?.mainExportMarkets || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "tradeInformation.mainExportMarkets"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="Asia" value="Asia" />
                          <Picker.Item label="Europe" value="Europe" />
                          <Picker.Item label="North America" value="North America" />
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Certifications</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.tradeInformation?.certifications || ""}
                        onChangeText={(text) =>
                          handleChange(text, "tradeInformation.certifications")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                  <View style={styles.col12}>
                    <Text style={styles.formLabel}>Packaging Details</Text>
                    <TextInput
                      style={[styles.formControl,]}
                      multiline
                      numberOfLines={2}
                      value={formData.tradeInformation?.packagingDetails || ""}
                      onChangeText={(text) =>
                        handleChange(text, "tradeInformation.packagingDetails")
                      }
                    />
                  </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Payment Terms</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.tradeInformation?.paymentTerms || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(itemValue, "tradeInformation.paymentTerms")
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="T/T" value="T/T" />
                          <Picker.Item label="L/C" value="L/C" />
                        </Picker>
                      </View>
                    </View>

                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Main Domestic Market</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.tradeInformation?.mainDomesticMarket || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "tradeInformation.mainDomesticMarket"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="All India" value="All India" />
                          <Picker.Item label="North India" value="North India" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Product Specifications</Text>
                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Product Type</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.productType || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.productType")
                        }
                      />
                    </View>

                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Material</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.material || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.material")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Finish</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.finish || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.finish")
                        }
                      />
                    </View>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Thickness</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={formData.specifications?.thickness || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.thickness")
                        }
                      />
                    </View>

                      <View style={styles.col12}>
                      <Text style={styles.formLabel}>Thickness Unit</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.specifications?.thicknessUnit || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "specifications.thicknessUnit"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="mm" value="mm" />
                          <Picker.Item label="cm" value="cm" />
                          <Picker.Item label="inch" value="inch" />
                        </Picker>
                      </View>
                    </View>

              
                  </View>

                  <View style={styles.row}>
                          <View style={styles.col12}>
                      <Text style={styles.formLabel}>Thickness Tolerance</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={formData.specifications?.thicknessTolerance || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.thicknessTolerance")
                        }
                      />
                    </View>
            <View style={styles.col12}>
                      <Text style={styles.formLabel}>Thickness Tolerance Unit</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.specifications?.thicknessToleranceUnit || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "specifications.thicknessToleranceUnit"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="mm" value="mm" />
                          <Picker.Item label="cm" value="cm" />
                          <Picker.Item label="inch" value="inch" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View style={styles.row}>
                           <View style={styles.col12}>
                      <Text style={styles.formLabel}>Width</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={formData.specifications?.width || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.width")
                        }
                      />
                    </View>
                         <View style={styles.col12}>
                      <Text style={styles.formLabel}>Width Unit</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.specifications?.widthUnit || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "specifications.widthUnit"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="mm" value="mm" />
                          <Picker.Item label="cm" value="cm" />
                          <Picker.Item label="inch" value="inch" />
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Width Tolerance</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={formData.specifications?.widthTolerance || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.widthTolerance")
                        }
                      />
                    </View>
                    
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Width Unit</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.specifications?.widthToleranceUnit || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "specifications.widthToleranceUnit"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="mm" value="mm" />
                          <Picker.Item label="cm" value="cm" />
                          <Picker.Item label="inch" value="inch" />
                        </Picker>
                      </View>
                    </View>
                
                  
                  </View>

                      <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Length</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={formData.specifications?.length || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.length")
                        }
                      />
                    </View>
                     <View style={styles.col12}>
                      <Text style={styles.formLabel}>Length Unit</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.specifications?.lengthUnit || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "specifications.lengthUnit"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="mm" value="mm" />
                          <Picker.Item label="cm" value="cm" />
                          <Picker.Item label="inch" value="inch" />
                          <Picker.Item label="meter" value="meter" />
                        </Picker>
                      </View>
                    </View>
                    
                    </View>

                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Weight</Text>
                      <TextInput
                      keyboardType="numeric"
                        style={styles.formControl}
                        value={formData.specifications?.weight || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.weight")
                        }
                      />
                    </View>

                         <View style={styles.col12}>
                      <Text style={styles.formLabel}>Weight Unit</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={
                            formData.specifications?.weightUnit || ""
                          }
                          onValueChange={(itemValue) =>
                            handleChange(
                              itemValue,
                              "specifications.weightUnit"
                            )
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="mm" value="mm" />
                          <Picker.Item label="cm" value="cm" />
                          <Picker.Item label="inch" value="inch" />
                        </Picker>
                      </View>
                    </View>
                  </View>
                      <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Metals Type</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.metalsType || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.metalsType")
                        }
                      />
                    </View>
                    </View>
                  <View style={styles.row}>
                      <View style={styles.col6}>
                      <Text style={styles.formLabel}>Shape</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.shape || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.shape")
                        }
                      />
                    </View>

                     <View style={styles.col6}>
                      <Text style={styles.formLabel}>Size</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.size || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.size")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
      <View style={styles.col6}>
                      <Text style={styles.formLabel}>Product Name</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.productName || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.productName")
                        }
                      />
                    </View>
                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Color</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.color || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.color")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Coating</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.coating || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.coating")
                        }
                      />
                    </View>

                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Wood Type</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.woodType || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.woodType")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Usage</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.usage || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.usage")
                        }
                      />
                    </View>

                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Processor Type</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.processorType || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.processorType")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Type</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.type || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.type")
                        }
                      />
                    </View>

                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Design</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.design || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.design")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Feature</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.feature || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.feature")
                        }
                      />
                    </View>

                    <View style={styles.col6}>
                      <Text style={styles.formLabel}>Metal Type</Text>
                      <TextInput
                        style={styles.formControl}
                        value={formData.specifications?.metalType || ""}
                        onChangeText={(text) =>
                          handleChange(text, "specifications.metalType")
                        }
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Application</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.application || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.application")
                      }
                    />
                  </View>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Finishing (Specification)</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.finishing || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.finishing")
                      }
                    />
                  </View>
                  </View>

                  <View style={styles.row}>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Origin</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.origin || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.origin")
                      }
                    />
                  </View>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Finish Type</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.finishType || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.finishType")
                      }
                    />
                  </View>
                  </View>

                  <View style={styles.row}>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Installation Type</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.installationType || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.installationType")
                      }
                    />
                  </View>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Other Material</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.otherMaterial || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.otherMaterial")
                      }
                    />
                  </View>
                  </View>

                  <View style={styles.row}>
                  <View style={styles.col6}>
                    <Text style={styles.formLabel}>Cover Material</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.specifications?.coverMaterial || ""}
                      onChangeText={(text) =>
                        handleChange(text, "specifications.coverMaterial")
                      }
                    />
                  </View>
           <View style={styles.col6}>
  <Text style={styles.formLabel}>Foldable</Text>
  <Switch
    value={formData.specifications?.foldable || false}
    onValueChange={(value) =>
      handleChange(value, "specifications.foldable")
    }
  />
</View>
                  </View>


                </View>
              )}

              {/* Product tradeShopping Section */}
              {selectedField === "tradeShopping" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Brand Name *</Text>
                    <TextInput
                      style={styles.formControl}
                      value={formData.tradeShopping?.brandName || ""}
                      onChangeText={(text) =>
                        handleChange(text, "tradeShopping.brandName")
                      }
                    />
                  </View>

                  {/* GST Section */}
<View style={styles.formGroup}>
  <Text style={styles.formLabel}>GST *</Text>
  <View style={styles.radioGroup}>
    {[0, 5, 12, 18, 28].map((tax) => (
      <TouchableOpacity
        key={tax}
        style={styles.radioButton}
        onPress={() => handleChange(tax, "tradeShopping.gst")}
      >
        <View
          style={[
            styles.radioCircle,
            // Convert formData.tradeShopping.gst to a number for comparison
            Number(formData.tradeShopping?.gst) === tax && styles.selectedRadioCircle,
          ]}
        />
        <Text style={styles.radioLabel}>{tax}%</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

                  {/* Selling Price Section */}
               <View style={styles.formGroup}>
  <Text style={styles.formLabel}>Selling Price Type</Text>
  <View style={styles.radioGroup}>
    {["Fixed", "Slab Based"].map((type) => (
      <TouchableOpacity
        key={type}
        style={styles.radioButton}
        onPress={() => handleChange(type, "tradeShopping.sellingPriceType")}
      >
        <View
          style={[
            styles.radioCircle,
            formData.tradeShopping?.sellingPriceType === type &&
              styles.selectedRadioCircle,
          ]}
        />
        <Text style={styles.radioLabel}>{type}</Text>
      </TouchableOpacity>
    ))}
  </View>
</View>

{formData.tradeShopping?.sellingPriceType === "Fixed" && (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>Fixed Selling Price</Text>
    <TextInput
      style={styles.formControl}
      keyboardType="numeric"
      value={formData.tradeShopping?.fixedSellingPrice || ""} // Use sellingPrice for fixed
      onChangeText={(text) =>
        handleChange(text, "tradeShopping.fixedSellingPrice")
      }
      placeholder="₹ Enter Fixed Selling Price"
    />
  </View>
)}

{formData.tradeShopping?.sellingPriceType === "Slab Based" && (
  <View style={styles.formGroup}>
    <Text style={styles.formLabel}>Slab Pricing</Text>
    {(formData.tradeShopping?.slabPricing || []).map((slab, index) => (
      <View key={index} style={styles.slabRow}>
        <TextInput
          style={styles.slabInput}
          keyboardType="numeric"
          placeholder="Min Quantity"
          value={slab.minQuantity}
          onChangeText={(text) => {
            const newSlabPricing = [...(formData.tradeShopping?.slabPricing || [])];
            newSlabPricing[index] = { ...newSlabPricing[index], minQuantity: text };
            handleChange(newSlabPricing, "tradeShopping.slabPricing");
          }}
        />
        <TextInput
          style={styles.slabInput}
          keyboardType="numeric"
          placeholder="Max Quantity"
          value={slab.maxQuantity}
          onChangeText={(text) => {
            const newSlabPricing = [...(formData.tradeShopping?.slabPricing || [])];
            newSlabPricing[index] = { ...newSlabPricing[index], maxQuantity: text };
            handleChange(newSlabPricing, "tradeShopping.slabPricing");
          }}
        />
        <TextInput
          style={styles.slabInput}
          keyboardType="numeric"
          placeholder="Price"
          value={slab.price}
          onChangeText={(text) => {
            const newSlabPricing = [...(formData.tradeShopping?.slabPricing || [])];
            newSlabPricing[index] = { ...newSlabPricing[index], price: text };
            handleChange(newSlabPricing, "tradeShopping.slabPricing");
          }}
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            const newSlabPricing = (formData.tradeShopping?.slabPricing || []).filter(
              (_, i) => i !== index
            );
            handleChange(newSlabPricing, "tradeShopping.slabPricing");
          }}
        >
          <Icon name="trash" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    ))}
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => {
        const newSlabPricing = [...(formData.tradeShopping?.slabPricing || []), { minQuantity: "", maxQuantity: "", price: "" }];
        handleChange(newSlabPricing, "tradeShopping.slabPricing");
      }}
    >
      <Text style={styles.addButtonText}>Add Slab</Text>
    </TouchableOpacity>
  </View>
 )}

                  {/* MRP Field */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>MRP *</Text>
                    <TextInput
                      style={styles.formControl}
                      keyboardType="numeric"
                      value={String(formData.tradeShopping?.mrp || "")}
                      onChangeText={(text) =>
                        handleChange(text, "tradeShopping.mrp")
                      }
                    />
                  </View>

                  {/* Unit & Pack Size */}
                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Unit *</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={formData.tradeShopping?.unit || ""}
                          onValueChange={(itemValue) =>
                            handleChange(itemValue, "tradeShopping.unit")
                          }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                        >
                          <Picker.Item label="Select Unit" value="" />
                          <Picker.Item label="kg" value="kg" />
                          <Picker.Item label="liter" value="liter" />
                          <Picker.Item label="piece" value="piece" />
                        </Picker>
                      </View>
                    </View>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Pack Size *</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={String(formData.tradeShopping?.packSize || "")}
                        onChangeText={(text) =>
                          handleChange(text, "tradeShopping.packSize")
                        }
                      />
                    </View>
                  </View>

                  {/* Minimum Order Packs */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Minimum Ordered Packs *</Text>
                    <TextInput
                      style={styles.formControl}
                      keyboardType="numeric"
                      value={String(
                        formData.tradeShopping?.minOrderedPacks || ""
                      )}
                      onChangeText={(text) =>
                        handleChange(text, "tradeShopping.minOrderedPacks")
                      }
                    />
                  </View>

                  {/* Is Returnable Section */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Is Returnable? *</Text>
                    <View style={styles.radioGroup}>
                      {["Yes", "No"].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.radioButton}
                          onPress={() =>
                            handleChange(option, "tradeShopping.isReturnable")
                          }
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              formData.tradeShopping?.isReturnable === option &&
                                styles.selectedRadioCircle,
                            ]}
                          />
                          <Text style={styles.radioLabel}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Stock Quantity & Weight */}
                  <View style={styles.row}>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Stock Quantity *</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={String(formData.tradeShopping?.stockQuantity || "")}
                        onChangeText={(text) =>
                          handleChange(text, "tradeShopping.stockQuantity")
                        }
                      />
                    </View>
                    <View style={styles.col12}>
                      <Text style={styles.formLabel}>Weight Per Unit *</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={String(formData.tradeShopping?.weightPerUnit || "")}
                        onChangeText={(text) =>
                          handleChange(text, "tradeShopping.weightPerUnit")
                        }
                      />
                    </View>
           <View style={styles.col12}>
  <Text style={styles.formLabel}>Weight Per Unit</Text>
  <View style={styles.inputGroup}>
    <TextInput
      style={[styles.input, styles.inputHalf]} // Apply styles for half width
      keyboardType="numeric"
      value={formData.tradeShopping?.weightPerUnit || ""}
      onChangeText={(text) =>
        handleChange(text, "tradeShopping.weightPerUnit")
      }
    />
    <View style={[styles.pickerContainer, styles.inputHalf]}>
      <Picker
        selectedValue={formData.tradeShopping?.weightUnit || ""}
        onValueChange={(itemValue) =>
          handleChange(itemValue, "tradeShopping.weightUnit")
        }
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Unit" value="" />
        <Picker.Item label="kg" value="kg" />
        <Picker.Item label="g" value="g" />
        <Picker.Item label="lbs" value="lbs" />
      </Picker>
    </View>
  </View>
</View>

                  </View>

                  {/* Shipping Type */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Shipping Type *</Text>
                    <View style={styles.radioGroup}>
                      {["Free", "Flat Rate", "% of Order Value", "Actual"].map(
                        (type) => (
                          <TouchableOpacity
                            key={type}
                            style={styles.radioButton}
                            onPress={() =>
                              handleChange(type, "tradeShopping.shippingType")
                            }
                          >
                            <View
                              style={[
                                styles.radioCircle,
                                formData.tradeShopping?.shippingType === type &&
                                  styles.selectedRadioCircle,
                              ]}
                            />
                            <Text style={styles.radioLabel}>{type}</Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>
                  </View>

                  {/* Package Dimensions */}
                  <Text style={styles.sectionTitle}>Package Dimensions *</Text>

                  <View style={styles.row}>
                    <View style={styles.col4}>
                      <Text style={styles.formLabel}>Length</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={String(
                          formData.tradeShopping?.packageDimensions?.length || ""
                        )}
                        onChangeText={(text) =>
                          handleChange(
                            text,
                            "tradeShopping.packageDimensions.length"
                          )
                        }
                      />
                    </View>
                    <View style={styles.col4}>
                      <Text style={styles.formLabel}>Width</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={String(
                          formData.tradeShopping?.packageDimensions?.width || ""
                        )}
                        onChangeText={(text) =>
                          handleChange(
                            text,
                            "tradeShopping.packageDimensions.width"
                          )
                        }
                      />
                    </View>
                    <View style={styles.col4}>
                      <Text style={styles.formLabel}>Height</Text>
                      <TextInput
                        style={styles.formControl}
                        keyboardType="numeric"
                        value={String(
                          formData.tradeShopping?.packageDimensions?.height || ""
                        )}
                        onChangeText={(text) =>
                          handleChange(
                            text,
                            "tradeShopping.packageDimensions.height"
                          )
                        }
                      />
                    </View>
                  </View>

                  {/* Dimension Unit */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Dimension Unit</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={
                          formData.tradeShopping?.packageDimensions?.unit || ""
                        }
                        onValueChange={(itemValue) =>
                          handleChange(
                            itemValue,
                            "tradeShopping.packageDimensions.unit"
                          )
                        }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        <Picker.Item label="Select Unit" value="" />
                        <Picker.Item label="cm" value="cm" />
                        <Picker.Item label="inch" value="inch" />
                      </Picker>
                    </View>
                  </View>

                </View>
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f2f5", // Lighter, modern background
    marginBottom: 30, // More space
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20, // More space
  },
  headerText: {
    fontSize: 24, // Larger header
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#2ecc71", // Green for add button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noProductsText: {
    textAlign: "center",
    marginTop: 50, // More prominent
    fontSize: 18,
    color: "#7f8c8d",
  },
  productCard: {
    padding: 15, // Slightly more padding
    marginBottom: 15, // More space between cards
    backgroundColor: "#ffffff",
    borderRadius: 10, // More rounded corners
    elevation: 4, // More pronounced Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, // Lighter, softer shadow
    shadowRadius: 5,
    borderWidth: 1, // Subtle border for definition
    borderColor: "#e0e0e0",
  },
  productContent: {
    flexDirection: "row",
    alignItems: "flex-start", // Align items to the top
    gap: 15, // Increased gap
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8, // Match card rounded corners
    borderWidth: 1,
    borderColor: "#e0e0e0", // Lighter border
  },
  productDetails: {
    flex: 1, // Takes remaining space
    justifyContent: 'space-between', // Distribute content vertically if needed
  },
  productHeader: {
    flexDirection: "row", // Keep row for name and date container
    justifyContent: "space-between", // Push date container to right
    alignItems: "flex-start", // Align to top
    marginBottom: 8, // Slightly less space to bring price closer
    width: "100%",
  },
  productName: {
    fontSize: 18, // Slightly larger product name
    fontWeight: "700", // Bolder
    color: "#34495e", // Darker text
    flexShrink: 1, // Allows text to wrap
    marginRight: 10, // Space between name and date
  },
  // --- Date/Time Styles (Updated for the "box" look) ---
dateTimeContainer: {
  flexDirection: "column",
  alignItems: "flex-start", // Changed to left align
},

dateTimeBox: {
  backgroundColor: "#f8f9fa",
  borderRadius: 6,
  paddingVertical: 6,
  paddingHorizontal: 10,
  marginTop: 6,
  width: "100%", // Make box full width
},
dateTimeBold: {
  fontWeight: "bold",
  fontSize: 12,
  color: "#34495e",
  marginBottom: 2,
},

dateTimeValue: {
  fontSize: 10,
  color: "#5e6a77",
  marginBottom: 1,
},

  // --- End Date/Time Styles ---

  priceOrderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Space after price/order quantity
    gap: 15, // More space between price and min order
  },
  priceText: {
    fontSize: 18, // Larger price
    fontWeight: "bold",
    color: "#27ae60", // Green for price
  },
  minOrderText: {
    fontSize: 14,
    color: "#7f8c8d", // Subtler color
  },
  progressBarContainer: {
    height: 8, // Thicker progress bar
    backgroundColor: "#ecf0f1", // Lighter grey background
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8, // Space above progress text
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2ecc71", // Vibrant green
    borderRadius: 4,
  },
  progressStrengthContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 12,
    color: "#7f8c8d",
    fontWeight: '500',
  },
  badge: {
    paddingVertical: 5, // More padding
    paddingHorizontal: 10, // More padding
    borderRadius: 6, // More rounded
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  badgeSuccess: { backgroundColor: "#28a745" },
  badgeWarning: { backgroundColor: "#ffc107" },
  badgeDanger: { backgroundColor: "#dc3545" },
  badgeSecondary: { backgroundColor: "#6c757d" },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0", // Lighter separator
    marginVertical: 12, // More vertical margin
  },

  actionText: {
    color: "#3498db", // Blue for links
    fontSize: 11,
    textDecorationLine: "underline",
    fontWeight: '500',
  },

  actionButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 15,
    marginTop: 5, 
    justifyContent: 'flex-start', 
    width: '100%',
  },

  trashIconContainer: {
    marginLeft: 'auto', 
    padding: 8, 
      marginTop: 10,
    alignSelf: 'flex-end', 
  },

  // Modal Styles (can also be refined, but keeping general structure)
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    width: "92%", // Slightly wider modal
    backgroundColor: "white",
    borderRadius: 12, // More rounded
    padding: 25, // More padding
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    maxHeight: "85%", // Allow more height
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20, // More space
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34495e",
  },
  modalBody: {
    marginBottom: 20,
    flexGrow: 1, // Allow scroll view to grow
  },
 formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  formControl: {
    borderWidth: 1,
    borderColor: "#dcdfe6",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    height: 50,
    backgroundColor: '#fdfdfd',
  },
  textArea: {
    minHeight: 100, // Taller text area
    textAlignVertical: "top",
  },
  imageUploadButton: {
    backgroundColor: "#3498db", // Consistent blue
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  imageUploadButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  selectedImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 15, // More space
    gap: 12, // More spacing
  },
  thumbnailImage: {
    width: 70, // Slightly larger thumbnails
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15, // More space between buttons
    marginTop: 20, // More space from body
  },
  modalButton: {
    paddingVertical: 12, // More padding
    paddingHorizontal: 25, // More padding
    borderRadius: 8, // More rounded
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100, // Ensure minimum width
  },
  cancelButton: {
    backgroundColor: "#95a5a6", // Grey for cancel
  },
  updateButton: {
    backgroundColor: "#3498db", // Consistent blue
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Layout and specific component styles
  sectionTitle: {
    fontSize: 19, // Slightly larger section title
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 12,
    color: "#2c3e50",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Lighter
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8, // Compensate for column padding
  },
  col6: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 20, // More space between rows
  },
  col12: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 20, // More space between rows
  },
  col4: {
    width: "33.333%",
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  twoColumnInput: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  marginRight: {
    marginRight: 10,
  },
  pickerContainer: {
  borderWidth: 1,
  borderColor: "#dcdfe6",
  borderRadius: 8,
  overflow: "hidden",
  height: 150,
  justifyContent: "center",
  backgroundColor: '#fdfdfd',
  paddingHorizontal: 5, // Added padding
},
picker: {
  width: "100%",
  height: "100%",
},
pickerItem: {
  fontSize: 15,
  color: "#333",
  fontWeight: '500',
},
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10, 
    marginBottom: 10, 
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRadioCircle: {
    backgroundColor: "#007bff",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  slabRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 5, // Use gap for spacing (RN 0.71+) or marginHorizontal for older versions
  },
  slabInput: {
    flex: 1, // Distribute space equally among inputs
    borderWidth: 1,
    borderColor: "#dcdfe6",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    height: 45,
    backgroundColor: '#fdfdfd',
  },
  removeButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: "#6c757d", // secondary color
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
export default AllProducts;



