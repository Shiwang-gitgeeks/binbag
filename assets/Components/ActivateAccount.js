import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message'; // Import Toast for notifications
import { ActivateAccountApi } from '../constants/api';

export default function ActivateAccount({ navigation, route }) {
  const email = route?.params?.email || ''; // Fallback to empty string if no email is passed
  const [loading, setLoading] = useState(false); // Track loading state

  const handleResendEmail = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email is missing. Cannot resend activation link.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ActivateAccountApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.status === "1") {
        // On success
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Activation email sent successfully',
        });
      } else {
        // On failure
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.detail || 'Failed to send activation email',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
    <Text style={styles.heading}>Activate your account</Text>
    <Text style={styles.message}>
      Thank you for registering! To complete your registration and proceed further, 
      please check your email and activate your account using the provided link.
    </Text>
    <View style={styles.resendContainer}> {/* Wrap the resend text in a new container */}
      <Text style={styles.resendMessage}>
        Didn't receive an email?{" "}
        <TouchableOpacity onPress={handleResendEmail} disabled={loading}>
          <Text style={styles.link}>
            {loading ? 'Resending...' : 'Resend activation link'}
          </Text>
        </TouchableOpacity>.
      </Text>
    </View>
    <View style={styles.goToLoginContainer}>
      <TouchableOpacity onPress={handleGoToLogin}>
        <Text style={styles.link1}>Go to Login page</Text>
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
  resendContainer: {
    alignItems: "flex-start", 
    width: "100%", 
  },
  resendMessage: {
    fontSize: 16,
    textAlign: "left", 
    marginHorizontal: 10,
  },
  link: {
    color: "#0D99FF",
    textDecorationLine: "underline",
  },
  link1: {
    color: "#0D99FF",
    // textDecorationLine: "underline",
  },
  goToLoginContainer: {
    alignSelf: "flex-end",
    marginTop: 20,
  },
});
