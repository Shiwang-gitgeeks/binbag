import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Button, Platform } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from "react-native-toast-message";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Modal } from "react-native-web";
import { TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { GetSpecificBinIdTokenApi } from "../constants/api";

export default function NewBarcodeScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [binId, setBinId] = useState("");
  const [useBackCamera, setUseBackCamera] = useState(true);
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const navigation = useNavigation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Request permission for mobile devices
  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        setHasPermission(true);
        codeReader.current = new BrowserMultiFormatReader();
      } else {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");
      }
    })();
  }, []);

  // Camera toggle (web-specific)
  const toggleCamera = () => {
    setUseBackCamera(!useBackCamera);
  };

  // Handle barcode scan for mobile (BarCodeScanner)
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return; 

    let correctedData = data;
    if (Platform.OS === "ios" && data.startsWith("0")) {
      correctedData = data.slice(1);
    }
    
    setScanned(true); 
    fetchBinStatus(correctedData);
  };

  // Function to fetch bin status and navigate
  const fetchBinStatus = async (correctedData) => {
    setBinId(correctedData);
    try {
      const response = await fetch(
        GetSpecificBinIdTokenApi+`${correctedData}`
      );
      const result = await response.json();

      if (result.status === "1") {
        navigation.navigate("NewBinPage", { bin_id_id: correctedData });
      } else {
        setShowLoginPrompt(true); // Show modal if status is 0
        setScanned(false); // Allow scanning to resume
      }
    } catch (error) {
      console.error("Error fetching bin data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Network error. Please try again later.",
      });
      setScanned(false); // Allow scanning to resume on error
    }
  };

  // Detect barcode for web (ZXing library)
  const detectBarcode = async () => {
    if (webcamRef.current && !scanned) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      const image = new Image();
      image.src = imageSrc;

      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        try {
          const result = await codeReader.current.decodeFromImageElement(image);
          if (result) {
            setScanned(true);
            fetchBinStatus(result.text); // Check bin status and navigate if valid
          }
        } catch (error) {
          console.log("No code found:", error);
        }
      };
    }
  };

  // Use animation frame for repeated detection in web
  useEffect(() => {
    if (!scanned && Platform.OS === "web") {
      const detectFrame = () => {
        if (!scanned) {
          detectBarcode();
          setTimeout(() => {
            requestAnimationFrame(detectFrame);
          }, 1000); // Adjusted for stability
        }
      };
      requestAnimationFrame(detectFrame);
    }
  }, [scanned]);

  // Clean up on component unmount
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (Platform.OS === "web" && codeReader.current) {
          codeReader.current.reset();
        }
        setScanned(false);
      };
    }, [])
  );

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <>
          <Webcam
            ref={webcamRef}
            style={{ width: "100%", height: "100%" }}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: useBackCamera ? { exact: "environment" } : "user",
            }}
          />
          <Button title="Switch Camera" onPress={toggleCamera} />
          <Text>Scanning for barcode...</Text>
        </>
      ) : (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}

      <Modal
        transparent
        visible={showLoginPrompt}
        animationType="fade"
        onRequestClose={() => setShowLoginPrompt(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
          <Text style={styles.sectionTitle}>No Bin attached to this code.</Text>
            <Text style={styles.modalText}>Login or Register to add information</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowLoginPrompt(false);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.modalButtonText}>Login / Register</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowLoginPrompt(false)}>
              <FontAwesome name="times" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Toast />
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
    height: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 70,
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
