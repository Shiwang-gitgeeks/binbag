import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { AnalyzeImageApi, BinCreateApi } from "../constants/api";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function AssignNewBinBag({ route, navigation, onLogout }) {
  const { bin_id } = route.params || {}; // safely handle undefined route.params
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [enableAI, setEnableAI] = useState(false);
  const [items, setItems] = useState([{ id: 1, name: "" }]);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Loader for AI analysis
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader for form submission

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
    });
  
    if (!result.canceled) {
      try {
        // Resize image to reduce size
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }], // Adjust width to keep under 1MB
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
  
        // Use the base64 data directly from the ImagePicker result
        const fileBase64 = manipResult.base64 || result.assets[0].base64;
  
        setImage({
          base64: fileBase64,
          type: "image/jpeg",
          name: result.assets[0].fileName || `${Date.now().toString()}.jpg`,
        });
      } catch (error) {
        console.error("Error compressing the image:", error);
      }
    } else {
      console.log("Image selection was canceled or no image was selected");
    }
  };
  // const handleUpload = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     base64: true,
  //   });

  //   if (!result.canceled) {

  //     setImage({
  //       base64: result.assets[0].base64,
  //       type: result.assets[0].type || "image/jpeg",
  //       name: result.assets[0].fileName || `${Date.now().toString()}.jpg`,
  //     });
  //   } else {
  //     console.log("Image selection was canceled or no image was selected");
  //   }
  // };

  const handleAIAnalysis = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (image && enableAI) {
      setIsAnalyzing(true); // Start loader
      try {
        const response = await fetch(AnalyzeImageApi, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ base64_image: image.base64 }),
        });

        const data = await response.json();
        if (data.status === "1" && data.items) {
          const newItems = data.items.map((item, index) => ({
            id: Date.now() + index,
            name: item,
          }));
          setItems(newItems);
        } else {
          console.warn("Failed to analyze image:", data);
        }
      } catch (error) {
        console.error("Error during image analysis:", error);
      } finally {
        setIsAnalyzing(false); // Stop AI loader
      }
    }
  };

  useEffect(() => {
    if (enableAI) {
      handleAIAnalysis();
    }
  }, [enableAI]);

  const handleSubmit = async () => {
    setIsSubmitting(true); // Show loader
    const accessToken = await AsyncStorage.getItem("accessToken");
    const data = {
      bin_id: bin_id,
      bin_name: name,
      bin_location: location,
      items: items.map((item) => ({ item_name: item.name })),
      bin_image: image
        ? { name: image.name, type: image.type, data: image.base64 }
        : null,
    };

    try {
      const response = await fetch(BinCreateApi, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Bin Bag assigned successfully!",
        });

        // Reset form fields
        setName("");
        setLocation("");
        setEnableAI(false);
        setItems([{ id: 1, name: "" }]);
        setImage(null);

        // Clear navigation state and go to Dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      } else {
        const errorMessage = responseData.message.bin_id;
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
          visibilityTime: 5000, // Display toast for 5 seconds
        });

        // Reset form fields
        setName("");
        setLocation("");
        setEnableAI(false);
        setItems([{ id: 1, name: "" }]);
        setImage(null);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while submitting the form.",
      });
    } finally {
      setIsSubmitting(false); // Stop submission loader
    }
  };

  const handleLogout = () => {
    onLogout();
    navigation.navigate("Login");
  };

  const handleDashboard = () => {
    navigation.navigate("Dashboard");
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: "" }]);
  };

  const updateItemName = (index, text) => {
    setItems(
      items.map((item, i) => (i === index ? { ...item, name: text } : item))
    );
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, (isAnalyzing || isSubmitting) && styles.blur]}
      >
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleDashboard}>
              <FontAwesome name="home" size={24} color="#0D99FF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDashboard}>
              <Text style={styles.dashboardText}>Dashboard</Text>
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
          {isAnalyzing && (
            <View style={styles.loaderOverlay}>
              <Text style={styles.AiTitle}>
                AI is analyzing the image. Please Wait
              </Text>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}
          <Text style={styles.sectionTitle}>Assign bin bag</Text>

          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Bin bag name"
            placeholderTextColor="#A9A9A9"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.uploadContainer}>
            <Text style={styles.label}>Upload bin image:</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
            >
              <FontAwesome name="upload" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <Switch value={enableAI} onValueChange={setEnableAI} />
            <Text style={styles.checkboxLabel}>
              Let AI guess which items are in this bin
            </Text>
          </View>

          <Text style={styles.label}>Location:</Text>
          <TextInput
            style={styles.input}
            placeholder="Bin bag location"
            placeholderTextColor="#A9A9A9"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Items:</Text>
          <View style={styles.itemsContainer}>
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemInputContainer}>
                <TextInput
                  style={styles.itemInput}
                  placeholder={`Item ${index + 1}`}
                  placeholderTextColor="#A9A9A9"
                  value={item.name}
                  onChangeText={(text) => updateItemName(index, text)}
                />
                <TouchableOpacity
                  onPress={() => removeItem(index)}
                  style={styles.removeIcon}
                >
                  <FontAwesome name="times" size={16} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addItem} style={styles.addButton}>
              <FontAwesome name="plus" size={16} color="white" />
              <Text style={styles.addButtonText}>Add more+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isSubmitting ? (
              <View style={styles.submittingContainer}>
                <Text style={styles.submitButtonText}>Submitting</Text>
                <ActivityIndicator
                  size="small"
                  color="#FFF"
                  style={styles.loader}
                />
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  submitTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  blur: {
    opacity: 0.4,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  submittingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loader: {
    marginLeft: 8,
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
  AiTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 70,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 70,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
  },
  itemInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#A9A9A9",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0C8CE9",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  itemsContainer: {
    width: "100%",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  removeIcon: {
    padding: 10,
    paddingRight: 15,
    justifyContent: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  itemInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#A9A9A9",
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignSelf: "flex-end",
  },
  addButtonText: {
    alignItems: "center",
    color: "black",
    fontSize: 16,
    marginRight: 5,
  },

  submitButton: {
    backgroundColor: "#0C8CE9",
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
    marginLeft: 40,
    alignItems: "center",
    width: "80%",
    marginTop: 20,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
