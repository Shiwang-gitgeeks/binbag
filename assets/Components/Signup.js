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
import { ActivityIndicator } from "react-native-web";
import { SignUpApi } from "../constants/api";

export default function SignUp({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateFields = () => {
    let valid = true;

    if (!name) {
      setNameError("Name is required");
      valid = false;
    } else if (name.length < 3 || name.length > 100) {
      setNameError("Name must be between 3 and 100 characters");
      valid = false;
    } else {
      setNameError("");
    }

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password should be at least 8 characters long");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    return valid;
  };

  const handleProceed = async () => {
    if (!validateFields()) return;
    setLoading(true);

    try {
      const response = await fetch(
        SignUpApi,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        }
      );

      const result = await response.json();

      if (result.status === "1") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "User Created Successfully",
        });
        navigation.navigate("ActivateAccount", { email: email });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.message.email
            ? result.message.email[0]
            : "Sign up failed",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Image source={require("../art.png")} style={styles.image} />
      <Text style={styles.heading}>New user signup</Text>

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#A9A9A9"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (nameError) setNameError("");
        }}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#A9A9A9"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError("");
        }}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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

      <Text style={styles.label}>Confirm password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter confirm password"
        placeholderTextColor="#A9A9A9"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmPasswordError) setConfirmPasswordError("");
        }}
        secureTextEntry
      />
      {confirmPasswordError ? (
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>
        {loading ? (
            <View style={styles.submittingContainer}>
              <Text style={styles.submitButtonText}>Proceeding...</Text>
              <ActivityIndicator
                size="small"
                color="#FFF"
                style={styles.loader}
              />
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Proceed</Text>
          )}
        </Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.text}>Already have an account? </Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.link}>Login here</Text>
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
  heading: {
    fontSize: 20,
    fontWeight: "bold",
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
    padding: 12,
    marginTop: 20,
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
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  text: {
    fontSize: 14,
  },
  link: {
    color: "#0D99FF",
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
