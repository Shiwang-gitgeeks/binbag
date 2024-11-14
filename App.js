import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import Toast from "react-native-toast-message";
import Login from "./assets/Components/Login";
import SignUp from "./assets/Components/Signup";
import ForgotPassword from "./assets/Components/ForgotPassword";
import BarcodeScanner from "./assets/Components/BarcodeScanner";
import ResetPassword from "./assets/Components/ResetPassword";
import QRDashboard from "./assets/Components/QRDashboard";
import ActivateAccount from "./assets/Components/ActivateAccount";
import Dashboard from "./assets/Components/Dashboard";
import UpdatePassword from "./assets/Components/UpdatePassword";
import AssignNewBinBag from "./assets/Components/AssignNewBinBag";
import BinPage from "./assets/Components/BinPage";
import ScanQR from "./assets/Components/ScanQR";
import NewBarcodeScanner from "./assets/Components/NewBarcodeScanner";
import NewBinPage from "./assets/Components/NewBinPage";

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const storeLoginState = async (state) => {
    await AsyncStorage.setItem("@is_logged_in", JSON.stringify(state));
    console.log("Stored login state:", state);
  };

  const getLoginState = async () => {
    const jsonValue = await AsyncStorage.getItem("@is_logged_in");
    const state = jsonValue !== null ? JSON.parse(jsonValue) : false;
    console.log("Retrieved login state:", state);
    return state;
  };

  useEffect(() => {
    const loadLoginState = async () => {
      const state = await getLoginState();
      setIsLoggedIn(state);
      setIsLoading(false);
    };
    loadLoginState();
  }, []);

  const handleLogin = async (success) => {
    setIsLoggedIn(success);
    await storeLoginState(success);
    console.log("Login handled, isLoggedIn set to:", success);
  };

  const handleLogout = async () => {
    setIsLoggedIn(false);
    await storeLoginState(false);
    console.log("Logged out, isLoggedIn set to false");
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer
      linking={{
        prefixes: ["http://localhost:8081", "BinBag://"],
        config: {
          screens: {
            Login: "login",
            SignUp: "signup",
            ForgotPassword: "forgot-password",
            ResetPassword: "reset-password",
            UpdatePassword: "updatepassword/:token1/:token2",
            QRDashboard: "qr-dashboard",
            ScanQR: "scan-qr",
            ActivateAccount: "activate-account",
            Dashboard: "dashboard",
            BarcodeScanner: "barcode-scanner",
            NewBarcodeScanner: "new-barcode-scanner",
            AssignNewBinBag: "assign-new-binbag",
            BinPage: "BinPage",
            NewBinPage: "new-bin-page",
          },
        },
      }}
    >
      <Stack.Navigator initialRouteName={isLoggedIn ? "QRDashboard" : "Login"}>
        <Stack.Screen name="Login">
          {(props) => <Login {...props} onLogin={handleLogin} />}
        </Stack.Screen>
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
        <Stack.Screen name="ActivateAccount" component={ActivateAccount} />
        <Stack.Screen name="ScanQR" component={ScanQR} />
        <Stack.Screen name="NewBarcodeScanner" component={NewBarcodeScanner} />
        <Stack.Screen name="NewBinPage" component={NewBinPage} />

        {/* Only include Dashboard and QRDashboard if the user is logged in */}
        {isLoggedIn && (
          <>
            <Stack.Screen name="Dashboard">
              {(props) => <Dashboard {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="AssignNewBinBag">
              {(props) => (
                <AssignNewBinBag {...props} onLogout={handleLogout} />
              )}
            </Stack.Screen>
            <Stack.Screen name="QRDashboard">
              {(props) => <QRDashboard {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="BinPage">
              {(props) => <BinPage {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        )}

        <Stack.Screen name="BarcodeScanner" component={BarcodeScanner} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
