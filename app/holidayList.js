import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import LottieView from "lottie-react-native";
import { API_BASE_URL } from "./api";

const holidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // New state for refreshing
  const animation = useRef(null);

  const handleItemPress = (item) => {
    console.log(`Selected item: ${item.reasonForHoliday}`);
  };

  const getHolidays = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/crm/admin/holidays`);
      if (response.data) {
        setHolidays(response.data);
        setError(null); // Clear error if data fetch is successful
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch holidays.");
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop the refresh animation
    }
  };

  const handleRefresh = () => {
    setRefreshing(true); // Start the refresh animation
    getHolidays();
  };

  useEffect(() => {
    getHolidays();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      style={styles.itemContainer}
    >
      <View>
        <Text style={styles.itemTitle}>{item.holidayDate}</Text>
        <Text style={styles.itemDescription}>{item.reasonForHoliday}</Text>
        <Text style={styles.itemDepartment}>
          Department: {item.departments?.department || "N/A"}
        </Text>
        <Text style={styles.itemDepartmentDescription}>
          {item.departments?.departmentDescription || ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
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
          data={holidays}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No holidays found.</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["darkslategrey"]} 
            />
          }
        />
      )}
    </View>
  );
};

export default holidayList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
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
  itemDepartment: {
    fontSize: 14,
    color: "tomato",
    marginTop: 8,
    fontWeight: "600",
  },
  itemDepartmentDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
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
});
