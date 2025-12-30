// components/Cities.js
import React, { memo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const cities = [
  { name: "Delhi", icon: "https://dialexportmart.com/countries/cities/delhi.png", link: "delhi" },
  { name: "Gurugram", icon: "https://dialexportmart.com/countries/cities/gurugram.png", link: "gurgaon" },
  { name: "Kolkata", icon: "https://dialexportmart.com/countries/cities/kolkata.png", link: "kolkata" },
  { name: "Bijnor", icon: "https://dialexportmart.com/countries/cities/gurugram.png", link: "bijnor" },
  { name: "Chennai", icon: "https://dialexportmart.com/countries/cities/chennai.png", link: "chennai" },
  { name: "More Cities", icon: "", link: "all" },
];

const Cities = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
       navigation.navigate("CityProducts", {
  city: item.link,     // delhi
  productslug: "all",  // VERY IMPORTANT
        })
      }
    >
      {item.icon ? (
        <Image source={{ uri: item.icon }} style={styles.icon} />
      ) : (
        <Text style={styles.moreIcon}>⋯</Text>
      )}

      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Find Suppliers from Top Cities</Text>

      <FlatList
        data={cities}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
 
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    margin: 4,
    alignItems: "center",
    width: 110,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },
  moreIcon: {
    fontSize: 32,
    color: "#999",
    marginBottom: 6,
  },
});


export default memo(Cities);
