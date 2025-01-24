import { router, Tabs } from "expo-router";
import React, { useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store"; // For secure storage handling (logout)
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome5 } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const TabRoot = () => {
  // Handle the logout process
  const handleLogout = async () => {
    try {
      // Clear session or token (example with SecureStore)
      await SecureStore.deleteItemAsync("employee");

      // Navigate to the login screen after logout
      router.push("/(login)");
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#35374B" barStyle="light-content" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "black",
          tabBarActiveBackgroundColor: "#35374B",
          headerShown: true,
          tabBarStyle: styles.tabBarStyle,
          headerStyle: styles.headerStyle,
          headerTitleAlign: "center",
          headerTintColor: "white",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={25} color={color} />
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push("/logout")} // Logout directly on press of the logout button
                style={{ marginRight: 15 }}
              >
                <MaterialIcons name="logout" size={24} color="white" />
              </TouchableOpacity>
            ),
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.push("/notifications")}
                style={{ marginHorizontal: 15 }}
              >
                <FontAwesome name="bell" size={24} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: "Attendance",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="calendar" size={25} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="workreport"
          options={{
            title: "Work Report",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="file-text" size={25} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="punch"
          options={{
            title: "Punch Activity",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="fingerprint" size={25} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="enquiry"
          options={{
            title: "Enquiry",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="question-circle" size={25} color={color} />
            ),
          }}
        />
        {/* New Work Report Tab */}
      </Tabs>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: height * 0.07, // Adjust height of tabs
    backgroundColor: "#F8F8F8", // Default background color
  },
  headerStyle: {
    backgroundColor: "#35374B", // Header background color
  },
});

export default TabRoot;
