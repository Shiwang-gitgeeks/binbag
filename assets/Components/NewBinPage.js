import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export default function NewBinPage({ route, onLogout, navigation }) {
  const { bin_id_id } = route?.params || {};
  const [binData, setBinData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bin_id_id) {
      fetchBinData();
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Bin ID not provided.",
      });
      navigation.goBack();
    }
  }, [bin_id_id]);

  // Fetch bin data from API
  const fetchBinData = async () => {
    try {
      const response = await fetch(
        `https://binbag.futuristixtech.com/apis/api/get-specific-binidtoken/${bin_id_id}`,
        { method: "GET" }
      );
      const result = await response.json();
      if (response.ok && result.status === "1") {
        setBinData(result.Data);
      } else {
        setBinData(null);
        // Toast.show({
        //   type: "error",
        //   text1: "Error",
        //   text2: "No Bin is attached to this QR/Bar code.",
        // });
      }
    } catch (error) {
      console.log("Error fetching bin data:", error);
      setBinData(null);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Network error. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    navigation.navigate("Login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.dashboardText}>Bin Details</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
          <Text style={styles.logoutText}>Login</Text>
          <FontAwesome
            name="sign-out"
            style={styles.logout}
            size={24}
            color="#0D99FF"
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0D99FF" />
      ) : binData ? (
        <>
          <Text style={styles.binName}>{binData.bin_name}</Text>
          <Text style={styles.binLocation}>{binData.bin_location}</Text>
          <Image
            source={{
              uri: `data:image/jpeg;base64,${binData.bin_image_base64}`,
            }}
            style={styles.binImage}
          />
          <Text style={styles.itemsTitle}>Items:</Text>
          {binData.Items.length > 0 ? (
            <View style={styles.itemsList}>
              {binData.Items.map((item, index) => (
                <View key={index} style={styles.itemContainer}>
                  <Text style={styles.item}>
                    {"\u2022"} {item}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noItemsText}>No items in this bin.</Text>
          )}
        </>
      ) : (
        <Text style={styles.noItemsText}>No Bin is attached to this QR/Bar Code.</Text>
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
  binName: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  binLocation: {
    fontSize: 19,
    color: "gray",
    marginBottom: 15,
    textAlign: "center",
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
  },
  itemsList: {
    alignItems: "flex-start",
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  item: {
    fontSize: 18,
    color: "#333",
    marginLeft: 10,
  },
  noItemsText: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
  },
});
