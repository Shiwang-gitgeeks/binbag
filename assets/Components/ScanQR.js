import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { FontAwesome } from '@expo/vector-icons';




export default function ScanQR({ navigation, onLogout }) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    navigation.navigate("Login");
  };

  const handleScanNewQR = () => {
    setShowLoginPrompt(true); // Show login/register prompt
  };

  const handleDashboard = () => {
    navigation.navigate("Dashboard");
  };

  const handleScanActiveQR = () => {
    navigation.navigate("NewBarcodeScanner");
  };

  const closeModal = () => {
    setShowLoginPrompt(false);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.dashboardText}>Select QR Type</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutContainer}>
          <Text style={styles.logoutText}>Go to Login</Text>
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
          <Text style={styles.buttonText}>Scan New QR Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleScanActiveQR}>
          <Text style={styles.buttonText}>Scan Active QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Login/Register Prompt */}
      <Modal
        transparent
        visible={showLoginPrompt}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Login or Register to add information
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                closeModal();
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.modalButtonText}>Login / Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={closeModal}>
              <FontAwesome name="times" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust opacity for transparency
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "80%",
    maxWidth: 400,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#0D99FF",
    padding: 10,
    borderRadius: 5,
    width: "60%",
    alignItems: "center",
    marginBottom: 15,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});
