import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-web";
import { LoginApi } from "../constants/api";

export default function Login({ onLogin, navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateFields = () => {
    let valid = true;

    // Validate email format
    if (!username) {
      setUsernameError("Email is required");
      valid = false;
    } else if (!emailRegex.test(username)) {
      setUsernameError("Please enter a valid email address");
      valid = false;
    } else {
      setUsernameError("");
    }

    // Validate password length
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password should be at least 6 characters long");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const response = await fetch(
        LoginApi,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "1") {
        // Save the access token to AsyncStorage
        await AsyncStorage.setItem("accessToken", data.access);

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Login successful",
        });

        // Navigate to QRDashboard after updating the login status
        onLogin(true);
        setTimeout(() => navigation.navigate("QRDashboard"), 500);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.detail || "Invalid credentials",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleScanQR = () => {
    navigation.navigate("NewBarcodeScanner");
  };

  return (
    <View style={styles.container}>
      <Image source={require("../art.png")} style={styles.image} />
      <Text style={styles.heading}>
        Please login with your registered email id
      </Text>

      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username (email)"
        placeholderTextColor="#A9A9A9"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          if (usernameError) setUsernameError("");
        }}
      />
      {usernameError ? (
        <Text style={styles.errorText}>{usernameError}</Text>
      ) : null}

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        placeholderTextColor="#A9A9A9"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError("");
        }}
        secureTextEntry
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {/* <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text> */}
        <Text style={styles.buttonText}>
          {loading ? (
            <View style={styles.submittingContainer}>
              <Text style={styles.submitButtonText}>Logging in...</Text>
              <ActivityIndicator
                size="small"
                color="#FFF"
                style={styles.loader}
              />
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Login</Text>
          )}
        </Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.link}>New customer? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.linkSignUp}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.linkSignUp}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleScanQR}>
        <Text style={styles.linkSignUp}>Scan QR</Text>
      </TouchableOpacity>
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
    marginBottom: 50,
    textAlign: "center",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginBottom: 5,
    // marginLeft: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 5,
    paddingHorizontal: 10,
    width: "100%",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginBottom: 15,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#0C8CE9",
    marginTop: 20,
    padding: 12,
    borderRadius: 25,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  image: {
    width: 250,
    height: 70,
    marginBottom: 35,
  },
  link: {
    color: "black",
    marginTop: 10,
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkSignUp: {
    color: "#0D99FF",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  submittingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loader: {
    marginLeft: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
