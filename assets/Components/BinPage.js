import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
;import { FontAwesome } from '@expo/vector-icons';



import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { GetSpecificBinApi } from "../constants/api";

export default function BinPage({ route, onLogout, navigation }) {
  const { bin_id } = route?.params || {};
  console.log("binid", bin_id)
  const [binData, setBinData] = useState(null);
  useEffect(() => {
    if (bin_id) {
      fetchBinData();
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Bin ID not provided.",
      });
      navigation.goBack(); // Navigate back if binId is missing
    }
  }, [bin_id]);

  // Fetch bin data from API
  const fetchBinData = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    try {
      const response = await fetch(
        GetSpecificBinApi + `${bin_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.status === "1") {
        setBinData(result.Data); // Access 'Data' directly as it contains bin details
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch bin data.",
        });
      }
    } catch (error) {
      console.log("Error fetching bin data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Network error. Please try again later.",
      });
    }
  };

  useEffect(() => {
    fetchBinData();
  }, []);

  const handleLogout = () => {
    onLogout();
    navigation.navigate("Login");
  };

  const handleDashboard = () => {
    navigation.navigate("Dashboard");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDashboard}>
          <FontAwesome name="home" size={24} color="#0D99FF" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.dashboardText}>Bin Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutContainer}
        >
          <Text style={styles.logoutText}>Logout</Text>
          <FontAwesome
            name="sign-out"
            style={styles.logout}
            size={24}
            color="#0D99FF"
          />
        </TouchableOpacity>
      </View>

      {binData ? (
        <>
          <Text style={styles.binName}>{binData.bin_name}</Text>
          <Text style={styles.binLocation}>{binData.bin_location}</Text>
          <Image
            source={{ uri: `data:image/jpeg;base64,${binData.bin_image_base64}` }}
            style={styles.binImage}
          />
          <Text style={styles.itemsTitle}>Items:</Text>
          {binData.Items.length > 0 ? (
            <View style={styles.itemsList}>
              {binData.Items.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.item}>
                    {"\u2022"} {item} {/* Unicode bullet point */}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noItemsText}>No items in this bin.</Text>
          )}
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dashboardText: {
    marginRight: -25,
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 5,
    color: "#0D99FF",
    textDecorationLine: "underline",
  },
  logout: {
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  binName: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center", // Center text
  },
  binLocation: {
    fontSize: 19,
    color: "gray",
    marginBottom: 15,
    textAlign: "center", // Center text
  },
  binImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
  itemsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10, 
    marginLeft: 165,
    textAlign: "left", // // Center title text
  },
  itemsList: {
    marginLeft: 135,
    alignItems: "flex-start", // Align the list to the start (top) of the container
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: "row", // Ensures the bullet and item text align horizontally
    marginBottom: 5,
  },
  item: {
    fontSize: 18,
    color: "#333",
    marginLeft: 10, // Indent the text slightly for better readability
  },
  noItemsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center", // Center no items text
  },
});
