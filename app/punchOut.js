import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { API_BASE_URL } from "./api";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

const punchOut = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to capture the punch-out image.");
    }
  };

  const captureImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.2,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

 

  const handleSendPhoto = async () => {
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");

      const formData = new FormData();
      formData.append("punchOutImage", {
        uri: photo.uri,
        type: "image/jpeg",
        name: "punchOutImage.jpg",
      });
      

      // Dynamically set the extra reminder date to today's date
      const extraReminderDate = new Date().toISOString().split("T")[0];
      formData.append("extraReminderDate", extraReminderDate);

      const response = await axios.post(
        `${API_BASE_URL}/crm/employee/punch`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Punch activity recorded successfully.");
        router.push("/(tabs)/punch");
      } else {
        throw new Error("Failed to submit punch activity.");
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data); // Log the response for debugging

      const errorMessage =
        error.response &&
        error.response.data &&
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : "There was an issue recording.";

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: loading ? "#888" : "#35374B" }]}
          onPress={captureImage}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Capture Punch Out Image</Text>
        </TouchableOpacity>

        {photo && (
          <View style={{ marginTop: 20 }}>
            <Image
              source={{ uri: photo.uri }}
              style={{
                width: width * 0.8,
                height: width * 0.7,
                marginBottom: 20,
              }}
            />
          </View>
        )}

       

       
        <TouchableOpacity
          style={[styles.button, { backgroundColor: loading ? "#888" : "#35374B" }]}
          onPress={handleSendPhoto}
          
        >
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Submit Punch Activity"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default punchOut;


const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingLeft: width * 0.1,
  },
  button: {
    width: width * 0.8,
    marginTop: width * 0.09,
    backgroundColor: "#35374B",
    borderRadius: 20,
    marginBottom: 5,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    padding: 10,
  },
  button1: {
    width: width * 0.8,
    marginTop: width * 0.09,
    backgroundColor: "#35374B",
    borderRadius: 20,
    marginBottom: 5,
  },
  buttonText1: {
    textAlign: "center",
    color: "white",
    fontSize: 15,
    padding: 10,
  },
  input: {
    width: width * 0.8,
    marginTop: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlignVertical: "top",
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    height: width * 0.13,
    alignItems: "center",
  },
  picker: {
    width: width * 0.8,
    marginTop: 5,
    height: width * 0.15,
    backgroundColor: "#F9F9F9",
  },
  questionText: {
    fontSize: 16,
    marginTop: 13,
    color: "orange",
    textAlign: "left",
    fontWeight: "bold",
  },
  removeText: {
    fontSize: 15,
    color: "white",
    textAlign: "center",
  },
  card: {
    marginTop: 10,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "black",
    marginVertical: 10,
    width: "90%"
  },
  removeButton:{
    padding: 10,
    textAlign:'center',
    backgroundColor:'orange',
    width: "90%",
    marginTop: 10,
    borderRadius: 20
  }
});
