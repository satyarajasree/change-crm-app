import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "./api";

const { width, height } = Dimensions.get("window");

const myDocuments = () => {
  const [employee, setEmployee] = useState(null);
  const [crmEmployee, setCrmEmployee] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEmployee = async () => {
    try {
      const employeeData = await SecureStore.getItemAsync("employee");
      if (employeeData) {
        setEmployee(JSON.parse(employeeData));
      } else {
        console.error("No employee data found");
      }
    } catch (error) {
      console.error("Error retrieving employee data:", error);
    }
  };

  const fetchCrmEmployee = async (employeeId) => {
    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await fetch(
        `${API_BASE_URL}/crm/employee/get-employee/${employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch employee details, status code: ${response.status}`
        );
      }

      const crmEmployeeData = await response.json();
      setCrmEmployee(crmEmployeeData);
    } catch (error) {
      console.error("Error fetching CRM employee details:", error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployee();
    setRefreshing(false);
  };

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant access to your media library"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], 
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      if (selectedAsset.fileSize > 5 * 1024 * 1024) {
        Alert.alert(
          "Error",
          "File size exceeds 5MB. Please select a smaller image."
        );
        return;
      }

      uploadImage(type, selectedAsset.uri);
    }
  };

  const uploadImage = async (type, imageUri) => {
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const formattedToken = token.replace(/^"|"$/g, "");

      const formData = new FormData();
      formData.append(type, {
        uri: imageUri,
        type: "image/jpeg", // Assuming it's a JPEG image
        name: `${type}-image.jpg`,
      });

      const response = await fetch(
        `${API_BASE_URL}/crm/employee/update-images/${employee.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${formattedToken}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      setLoading(false);
      const responseText = await response.text();
      

      if (response.ok) {
        await fetchEmployee();
        Alert.alert(
          "Success",
          `${
            type === "profileImagePath" ? "Profile" : "ID Card"
          } image updated successfully!`
        );
      } else {
        const responseJson = await response.json();
        console.error("Failed to upload image:", response.status, responseJson);
        Alert.alert(
          "Error",
          responseJson.message ||
            "Failed to upload the image. Please try again."
        );
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setLoading(false);
      Alert.alert("Error", "Please try again.");
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  useEffect(() => {
    if (employee) {
      fetchCrmEmployee(employee.id);
    }
  }, [employee]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {crmEmployee ? (
        <>
          <View style={styles.documentContainer}>
            <Text style={styles.text}>GOVT ID</Text>
            <Button
              title="Upload ID Card Image"
              onPress={() => pickImage("idCardPath")}
              color="#7CB9E8"
              style={styles.uploadButton}
            />
          </View>
          <Image
            source={{ uri: crmEmployee.idCardPath }}
            style={styles.image}
          />

          <View style={styles.documentContainer}>
            <Text style={styles.text}>PROFILE IMAGE</Text>
            <Button
              title="Upload Profile Image"
              onPress={() => pickImage("profileImagePath")}
              color="orange"
              style={styles.uploadButton}
            />
          </View>
          <Image
            source={{ uri: crmEmployee.profileImagePath }}
            style={styles.image}
          />
        </>
      ) : (
        <Text>Loading...</Text>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7CB9E8" />
        </View>
      )}
    </ScrollView>
  );
};

export default myDocuments;

const styles = StyleSheet.create({
  image: {
    width: width * 0.98,
    height: height * 0.3,
    paddingVertical: 10,
    margin: 5,
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#7CB9E8",
  },
  text: {
    textAlign: "center",
    fontWeight: "bold",
    padding: 10,
    color: "orange",
  },
  container: {
    flex: 1,
  },
  documentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  uploadButton: {
    marginLeft: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
});
