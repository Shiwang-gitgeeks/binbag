import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ConfirmResetPasswordApi } from "../constants/api";

export default function UpdatePassword() {
  const route = useRoute();
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Extract both tokens from the URL
  const uid = route.params?.token1;
  const token = route.params?.token2;

  useEffect(() => {
    if (!uid || !token) {
      Toast.show({
        type: "error",
        text1: "Invalid Link",
        text2: "The link is invalid or expired.",
      });
      navigation.navigate("Login");
    }
  }, [uid, token]);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }

    try {
      const response = await fetch(
        ConfirmResetPasswordApi + `${uid}/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "1") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password reset successful",
        });
        navigation.navigate("Login");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.detail || "Failed to update password",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Update Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        placeholderTextColor="#A9A9A9"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Text style={styles.label}>Confirm New Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        placeholderTextColor="#A9A9A9"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
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
    maxWidth: 450,
    alignSelf: "center",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
  },
  button: {
    backgroundColor: "#0C8CE9",
    padding: 12,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
