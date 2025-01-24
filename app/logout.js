import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const logout = ({ navigation }) => {
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);


  
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
    <View style={styles.container}>
      <LottieView
        autoPlay
        loop={false}
        ref={animation}
        style={styles.animation}
        source={require("../assets/anime/logout.json")}
      />
      <Text style={styles.text}>Are you sure you want to Logout?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonYes} onPress={handleLogout}>
          <Text style={styles.buttonText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonNo} onPress={()=>router.back()}>
          <Text style={styles.buttonText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default logout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  animation: {
    width: width,
    height: width * 0.7,
    backgroundColor: "white",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  buttonYes: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonNo: {
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
