import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, Button, Platform } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from "react-native-toast-message";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigation } from "@react-navigation/native";

export default function BarcodeScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [binId, setBinId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [useBackCamera, setUseBackCamera] = useState(true);
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const navigation = useNavigation();

  const toggleCamera = () => {
    setUseBackCamera(!useBackCamera);
  };

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

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);

    let correctedData = data;
    // Remove leading zero if on iOS and it has a double zero at the start
    if (Platform.OS === "ios" && data.startsWith("0")) {
      correctedData = data.slice(1);
    }
    setBinId(correctedData);
    // Toast.show({
    //   type: "success",
    //   text1: "Barcode Scanned",
    //   text2: `Type: ${type}, Data: ${correctedData}`,
    // });
    navigation.navigate("AssignNewBinBag", { bin_id: correctedData });
  };

  const detectBarcode = async () => {
    if (webcamRef.current) {
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
            setBinId(result.text);
            setScanned(true);
            setScanning(false);
            // Toast.show({
            //   type: "success",
            //   text1: "Barcode Scanned",
            //   text2: `With ID: ${result.text}`,
            // });
            navigation.navigate("AssignNewBinBag", { bin_id: result.text });
          }
        } catch (error) {
          console.log("No code found:", error.message);
        }
      };
    }
  };

  useEffect(() => {
    if (!scanned && Platform.OS === "web") {
      const detectFrame = () => {
        if (!scanned) {
          detectBarcode();
          setTimeout(() => {
            requestAnimationFrame(detectFrame);
          }, 900);
        }
      };
      requestAnimationFrame(detectFrame);
    }
  }, [scanned]);

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
          {!scanning && <Text>Scanning for barcode...</Text>}
        </>
      ) : (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          type={BarCodeScanner.Constants.Type.back}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
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
  camera: {
    width: "100%",
    height: "100%",
  },
});
