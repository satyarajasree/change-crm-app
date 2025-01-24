import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator, 
  BackHandler, 
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import { API_BASE_URL } from "../api";

const { width, height } = Dimensions.get("window");

export default function index() {
  const [value, setValue] = useState(""); // Store raw phone number input
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [loading, setLoading] = useState(false); // State to control loading
  const router = useRouter(); // Router to navigate programmatically
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  // Function to handle the mobile number submission
  const handlePhoneSubmit = async () => {
    const phoneRegex = /^[0-9]{10}$/; // Regex to match exactly 10 digits

    if (!phoneRegex.test(value)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true); // Set loading to true
    try {
      // Send the mobile number as a query parameter to your backend API
      const response = await axios.post(
        `${API_BASE_URL}/crm/admin/crm/login?mobile=${value}`
      );

      // Check if mobile number exists and OTP was sent
      if (response.status === 200 && response.data.includes("OTP sent")) {
        setIsModalVisible(true); // Show the modal
        setTimeout(() => {
          setIsModalVisible(false); // Hide the modal after 3 seconds
          router.push(`/otp?mobile=${value}`); // Navigate to the OTP page
        }, 3000); // 3 seconds delay
      } else {
        // If the mobile number does not exist, show an alert
        alert(response.data); // Show the response message from the backend
      }
    } catch (error) {
      alert("Login Failed, Please try again later");
    } finally {
      setLoading(false); // Set loading back to false
    }
  };

  // Disable back button when the user navigates to this page
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Prevent going back to the previous screen
      };

      // Add the event listener for back button press
      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      // Clean up the event listener when the screen loses focus
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LottieView
          autoPlay
          ref={animation}
          style={{
            width: width,
            height: width * 0.7,
            backgroundColor: "white",
          }}
          source={require("../../assets/anime/login-anime1.json")}
        />

        <View style={styles.divider} />

        <Text style={styles.textHeader}>EMPLOYEE LOGIN</Text>
        <Text style={styles.wishText}>
          Welcome Back! Let’s make today productive and meaningful!
        </Text>

        <View style={styles.inputContainer}>
          {/* Manual phone number input with hardcoded country code */}
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              value={value}
              onChangeText={(text) => setValue(text)}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]} // Apply disabled styling if loading
            onPress={!loading ? handlePhoneSubmit : null} // Disable interaction if loading
            disabled={loading} // Disable button during loading
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" /> // Show spinner if loading
            ) : (
              <Text style={styles.buttonText}>GET OTP</Text> // Show text if not loading
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for feedback */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)} // Handle modal close on back press
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LottieView
              autoPlay
              ref={animation}
              style={{
                width: width * 0.8,
                height: width * 0.5,
              }}
              source={require("../../assets/anime/otp.json")}
            />

            <Text style={styles.modalText}>Sending OTP</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "red",
  },
  header: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  textHeader: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "darkslategrey",
    fontStyle: "italic",
    marginTop: 10,
  },
  wishText: {
    fontSize: 15,
    textAlign: "center",
    paddingTop: height * 0.02,
    fontWeight: "bold",
    color: "black",
  },
  button: {
    backgroundColor: "black",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    borderRadius: width * 0.01,
    marginBottom: height * 0.05,
    marginTop: height * 0.05,
  },
  disabledButton: {
    backgroundColor: "gray", // Change button color when disabled
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    padding: width * 0.1,
    width: "100%",
    alignItems: "center",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: height * 0.02,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "black",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: "100%",
    flex: 0, // Ensures it stays within a fixed size
    marginVertical: 10,
    paddingTop: height * 0.06,
  },
});
