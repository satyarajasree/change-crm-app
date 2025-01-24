import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "../api";

const { width, height } = Dimensions.get("window");

const otp = () => {
  const [otp, setOtp] = useState(Array(6).fill("")); // No re-render per input
  const inputRefs = useRef([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const route = useRoute();
  const { mobile } = route.params;
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleChange = (text, index) => {
    const otpCopy = [...otp];
    otpCopy[index] = text;
    setOtp(otpCopy);

    // Move focus to the next input field if character entered
    if (text && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const saveDataSecurely = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/crm/admin/crm/verify?mobile=${mobile}&otp=${otpValue}`
        );

        const { token, employee } = response.data;

        await saveDataSecurely("jwtToken", token);
        await saveDataSecurely("employee", employee);

        setIsModalVisible(true);
        setTimeout(() => {
          setIsModalVisible(false);
          router.push("/(tabs)");
        }, 4000);
      } catch (error) {
        console.error("Error verifying OTP:", error);
        alert("OTP is expired or timed out or wrong OTP");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a 6-digit OTP");
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/crm/admin/crm/login?mobile=${mobile}`);
      alert("OTP has been resent!");
      setTimer(300); // Restart timer
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Verify your Mobile Number</Text>
      <Text style={{ padding: 10, marginBottom: height * 0.03 }}>
        Please enter OTP sent to your mobile numbers
      </Text>

      <View style={styles.inputContainer}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            style={styles.input}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="numeric"
            maxLength={1}
            textAlign="center"
            autoComplete="off"
            contextMenuHidden={true}
            ref={(ref) => (inputRefs.current[index] = ref)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={!loading ? handleSubmit : null}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.timer}>
        OTP expires in: {formatTime(timer)}
      </Text>

      <TouchableOpacity
        style={[styles.button, resendLoading && styles.disabledButton]}
        onPress={!resendLoading && timer === 0 ? handleResendOtp : null}
        disabled={resendLoading || timer > 0}
      >
        {resendLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Resend OTP</Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
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
              source={require("../../assets/anime/login-loading.json")}
            />
            <Text style={styles.modalText}>Verifying your Details...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    backgroundColor: "white",
  },
  header: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.01,
    color: "black",
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: width * 0.8,
    marginBottom: height * 0.05,
  },
  input: {
    width: width * 0.12,
    height: height * 0.07,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: width * 0.02,
    marginHorizontal: width * 0.02,
    fontSize: width * 0.05,
    textAlign: "center",
  },
  button: {
    marginTop: height * 0.05,
    backgroundColor: "#000",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.25,
    borderRadius: width * 0.04,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  buttonText: {
    color: "white",
    fontSize: width * 0.05,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  timer: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
});

export default otp;
