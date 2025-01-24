import { Redirect, Stack } from "expo-router";
import { useState } from "react";
import { StatusBar, useColorScheme, StyleSheet } from "react-native";

export default function LoginLayout() {
  const colorScheme = useColorScheme();

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
          headerShown: false,
        }}
      >
        <Stack.Screen name="otp" options={{headerShown:false}} />
        
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
