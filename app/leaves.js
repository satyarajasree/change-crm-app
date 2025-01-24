import React, { useState, useEffect, useRef } from "react";
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
import { API_BASE_URL } from "./api";

const { width, height } = Dimensions.get("window");

const leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const [error, setError] = useState(null);
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("jwtToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await axios.get(
        `${API_BASE_URL}/crm/employee/with-employee-name`,
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      setLeaves(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchLeaves(); // Refetch data
    } finally {
      setRefreshing(false); // Stop refreshing
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLeaves();
    }, [])
  );

  const renderItem = ({ item }) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity style={styles.itemContent}>
          <Text style={styles.itemTitle}>Leave status: {item.leavesEnum}</Text>
          <Text style={styles.itemDescription}>{item.reason}</Text>
          <Text style={styles.itemDescription}>{item.leaveDay}</Text>
          <Text style={styles.itemDescription}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
          <Text style={styles.itemDescription}>
            <Text style={{ color: "black" }}>Applied by: </Text>
            <Text> {item.employeeName}</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          {item.leavesEnum === "APPROVED" ? (
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          ) : item.leavesEnum === "REJECTED" ? (
            <MaterialIcons name="cancel" size={24} color="#F44336" />
          ) : (
            <MaterialIcons name="hourglass-top" size={24} color="#FFC107" />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <LottieView
            ref={animation}
            source={require("../assets/anime/loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={leaves}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.loadingContainer}>
              <LottieView
                ref={animation}
                source={require("../assets/anime/empty.json")}
                autoPlay
                loop
                style={styles.lottie1}
              />
              <Text style={styles.itemTitle}>No Leaves applied</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/leavesForm")}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default leaves;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    overflow: "hidden", // Prevent overflow
  },
  listContent: {
    paddingBottom: 20,
    overflow: "hidden", // Prevent overflow inside FlatList
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    overflow: "hidden", // Ensure no overflow on item container
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
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
  lottie1: {
    width: width,
    height: height/2,
  },
});
