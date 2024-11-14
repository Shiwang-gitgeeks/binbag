import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

export default function QRDashboard({ navigation, onLogout }) {
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken"); // Remove the token
    // onLogin(false); // Update login status
    navigation.navigate("Login"); // Navigate to login screen
  };

  const handleScanNewQR = () => {
    navigation.navigate("BarcodeScanner");
  };

  const handleDashboard = () => {
    navigation.navigate("Dashboard");
  };

  const handleScanActiveQR = () => {
    navigation.navigate("BarcodeScanner");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleDashboard}
        >
          <FontAwesome name="home" size={24} color="#0D99FF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDashboard}>
          <Text style={styles.dashboardText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
          <Text style={styles.logoutText}>Logout</Text>
          <FontAwesome
            name="sign-out"
            style={styles.logout}
            size={24}
            color="#0D99FF"
          />
        </TouchableOpacity>
      </View>

      {/* Center Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleScanNewQR}>
          <Text style={styles.buttonText}>Scan QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#0C8CE9",
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: "center",
    width: "80%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
