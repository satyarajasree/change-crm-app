import { Stack, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { StatusBar, useColorScheme, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store"; // Import SecureStore for token storage

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check token presence to decide login state
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("employee"); // Retrieve token from SecureStore
      if (token) {
        setIsLoggedIn(true); // Token exists, user is logged in
      } else {
        setIsLoggedIn(false); // No token, user is logged out
      }
    } catch (error) {
      console.error("Error checking token:", error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkToken(); // Run token check on component mount
  }, []);

  // Redirect based on login state
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(login)");
    }
  }, [isLoggedIn]);

  // Define styles based on color scheme
  const headerStyle =
    colorScheme === "dark" ? styles.headerStyleDark : styles.headerStyleLight;
  const headerTintColor = "white";

  return (
    <>
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#353535" : "#35374B"}
        barStyle="light-content"
      />

      <Stack
        screenOptions={{
          headerStyle,
          headerTintColor,
          headerTitleAlign: "center",
          headerShown: true, // Show headers for the Stack
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false, // Hide headers for tabs
          }}
        />
        <Stack.Screen
          name="(login)"
          options={{
            headerShown: false, // Hide headers for login
          }}
        />
        <Stack.Screen name="leaves" options={{ headerTitle: "Leaves" }} />
        <Stack.Screen
          name="holidayList"
          options={{ headerTitle: "List of Holidays" }}
        />
        <Stack.Screen
          name="myDocuments"
          options={{ headerTitle: "My Documents" }}
        />
        <Stack.Screen
          name="leavesForm"
          options={{ headerTitle: "Apply Leave" }}
        />
         <Stack.Screen
          name="settings"
          options={{ headerTitle: "Settings" }}
        />
         <Stack.Screen
          name="attendanceRemainder"
          options={{ headerTitle: "Reminders" }}
        />
          <Stack.Screen
          name="profile"
          options={{ headerTitle: "Profile" }}
        />
        <Stack.Screen name="enquiryForm" options={{ headerTitle: "Enquiry" }} />
        <Stack.Screen name="camera" options={{ headerTitle: "Punch In" }} />
        <Stack.Screen name="punchOut" options={{ headerTitle: "Punch Out" }} />
        <Stack.Screen name="helpSupport" options={{ headerTitle: "Help & Support" }} />
        <Stack.Screen name="bankDetails" options={{ headerTitle: "Bank Details" }} />
        <Stack.Screen name="notifications" options={{ headerTitle: "Notifications" }} />
        <Stack.Screen name="logout" options={{headerTitle:"Logout"}} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerStyleLight: {
    backgroundColor: "#35374B",
  },
  headerStyleDark: {
    backgroundColor: "#353535",
  },
});
