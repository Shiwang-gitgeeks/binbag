import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { ResetPasswordApi } from "../constants/api";

export default function ResetPassword({ navigation, route }) {
  const email = route.params?.email || ""; // Get email from route params if passed

  const handleResendEmail = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email address is required.",
      });
      return;
    }

    try {
      const response = await fetch(ResetPasswordApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status === "1") {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password reset email sent again.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.detail || "Failed to resend email.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong. Please try again later.",
      });
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reset your password</Text>
      <Text style={styles.message}>
        We've sent an email with instructions on how to reset your password. Please check your inbox and follow the link to create a new password.
      </Text>
      <Text style={styles.message}>
        If you don't see the email, please check your spam folder or{" "}
        <TouchableOpacity onPress={handleResendEmail}>
          <Text style={styles.link}>Resend Password Reset Email</Text>
        </TouchableOpacity>.
      </Text>

      <View style={styles.goToLoginContainer}>
        <TouchableOpacity onPress={handleGoToLogin}>
          <Text style={styles.link}>Go to login page</Text>
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
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "left",
    marginHorizontal: 10,
  },
  link: {
    color: "#0D99FF",
    textDecorationLine: "underline",
  },
  goToLoginContainer: {
    alignSelf: "flex-end",
    marginTop: 20,
  },
});
