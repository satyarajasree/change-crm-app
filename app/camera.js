import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {API_BASE_URL} from './api'
const { width, height } = Dimensions.get("window");

const camera = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to capture the punch-in image.");
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
      formData.append("punchInImage", {
        uri: photo.uri,
        type: "image/jpeg", 
        name: "punchInImage.jpg",
      });

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
        router.push('/(tabs)/punch')
      } else {
        throw new Error("Failed to submit punch activity.");
      }
    } catch (error) {
      console.log("Error Response:", error.response?.data); // Log the response for debugging
    
      const errorMessage =
        error.response && error.response.data && typeof error.response.data.error === "string"
          ? error.response.data.error
          : "There was an issue recording.";
    
      Alert.alert("Error", errorMessage);
        
     } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={captureImage}>
        <Text style={styles.buttonText}>Capture Punch In Image</Text>
      </TouchableOpacity>

      {photo && (
        <View style={{ marginTop: 20 }}>
          <Image
            source={{ uri: photo.uri }}
            style={{
              width: width * 0.9,
              height: width * 0.9,
              marginBottom: 20,
            }}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? "#888" : "#35374B" }]}
        onPress={handleSendPhoto}
        disabled={loading || !photo} 
      >
        <Text style={styles.buttonText}>
          {loading ? "Sending..." : "Submit Punch Activity"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  button: {
    width: width * 0.8,
    marginTop: width * 0.09,
    backgroundColor: "#35374B",
    borderRadius: 20,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    padding: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: "100%",
    flex: 0, 
    marginVertical: 10,
  },
  note: {
    backgroundColor: "#CD5C5C",
    width: "90%",
    textAlign: "center",
    padding: 10,
    marginTop: 10,
  },
  noteText: {
    textAlign: "center",
    color: "white",
    fontSize: 15,
  },
});
