import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { API_BASE_URL } from "../api";

const { width, height } = Dimensions.get("window");

const Enquiry = () => {
  const [enquiry, setEnquiry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const animation = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [punch, setPunch] = useState([]);

  const fetchEnquiries = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) throw new Error("Authentication token not found");

      const formattedToken = token.replace(/^"|"$/g, ""); // Remove extra quotes
      const response = await axios.get(`${API_BASE_URL}/crm/employee/enquiries`, {
        headers: { Authorization: `Bearer ${formattedToken}` },
      });

      setEnquiry(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err.message || "Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEnquiries();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEnquiries();
    setRefreshing(false);
  };

  const handleEnquiryPress = (enquiry) => {
    console.log(`Selected Enquiry: ${enquiry.title}`);
    // Navigate to enquiry details or perform any action
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={animation}
            source={require("../../assets/anime/loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={enquiry}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleEnquiryPress(item)}
              style={styles.enquiryItem}
            >
              <Text style={styles.enquiryTitle}>{item.title}</Text>
              <Text style={styles.enquiryDescription}>{item.message}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.loadingContainer}>
              <LottieView
                ref={animation}
                source={require("../../assets/anime/empty.json")}
                autoPlay
                loop
                style={styles.lottie1}
              />
              <Text style={styles.enquiryTitle}>No Enquiries Raised</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/enquiryForm")}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Enquiry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Add padding to avoid overlap with the floating button
  },
  enquiryItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enquiryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  enquiryDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#35374B",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  lottie1: {
    width: width,
    height: height / 2,
  },
});
