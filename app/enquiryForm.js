import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { API_BASE_URL } from "./api";

const { width, height } = Dimensions.get("window");

const enquiryForm = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const animation = useRef(null);
  const modalAnimation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!title.trim() || title.trim().length < 4) {
      errors.title = "Title must be at least 4 characters long.";
    } else if (title.length > 30) {
      errors.title = "Title cannot exceed 30 characters.";
    }

    if (!message.trim() || message.trim().length < 4) {
      errors.message = "Message must be at least 4 characters long.";
    } else if (message.length > 200) {
      errors.message = "Message cannot exceed 200 characters.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");

      await axios.post(
        `${API_BASE_URL}/crm/employee/add-enquiry`,
        {
          title,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      setIsModalVisible(true);
      modalAnimation.current?.play();

      setTimeout(() => {
        setIsModalVisible(false);
        router.back();
      }, 3000);

      setTitle("");
      setMessage("");
      setFormErrors({});
    } catch (err) {
      setError(err.message || "Failed to submit the enquiry");
      Alert.alert("Error", err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setTitle("");
      setMessage("");
      setFormErrors({});
    }, 1000);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.loadingContainer}>
        <LottieView
          ref={animation}
          source={require("../assets/anime/questions.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={[styles.input, formErrors.title && styles.errorInput]}
          value={title}
          onChangeText={(text) => {
            if (text.length <= 30) setTitle(text);
          }}
          placeholder="Enter Title"
        />
        <Text style={styles.charCount}>{title.length}/30</Text>
        {formErrors.title && (
          <Text style={styles.errorText}>{formErrors.title}</Text>
        )}

        <TextInput
          style={[
            styles.input,
            styles.messageInput,
            formErrors.message && styles.errorInput,
          ]}
          value={message}
          onChangeText={(text) => {
            if (text.length <= 200) setMessage(text);
          }}
          placeholder="Enter Message"
          multiline
        />
        <Text style={styles.charCount}>{message.length}/200</Text>
        {formErrors.message && (
          <Text style={styles.errorText}>{formErrors.message}</Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>

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
              ref={modalAnimation}
              style={{
                width: width * 0.8,
                height: width * 0.5,
              }}
              source={require("../assets/anime/request.json")}
            />
            <Text style={styles.modalText}>
              Enquiry Submitted Successfully!
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginVertical: height * 0.01,
  },
  input: {
    height: height * 0.06,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#35374B",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: width * 0.8,
  },
  modalText: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  charCount: {
    fontSize: 12,
    color: "gray",
    alignSelf: "flex-end",
    marginBottom: 5,
  },
});

export default enquiryForm;
