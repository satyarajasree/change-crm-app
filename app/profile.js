import React, { useState, useEffect } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "./api";

const { width } = Dimensions.get("window");

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // Track refresh state
  const [crmEmployee, setCrmEmployee] = useState(null);

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

  
  const fetchEmployee = async () => {
    try {
      const employeeData = await SecureStore.getItemAsync("employee");
      const token = await SecureStore.getItemAsync("jwtToken");
      if (employeeData) {
        setEmployee(JSON.parse(employeeData)); 
      } else {
        console.error("No employee data found");
      }
    } catch (error) {
      console.error("Error retrieving employee data:", error);
    }
  };

  useEffect(() => {
    if (employee) {
      fetchCrmEmployee(employee.id); 
    }
  }, [employee]);

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmployee(); // Fetch employee data again
    setRefreshing(false); // Reset refreshing state
  };

  useEffect(() => {
    fetchEmployee(); // Fetch employee details on component mount
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {employee ? (
        <View style={styles.profileContainer}>
          {/* Profile Image */}
          {crmEmployee && crmEmployee.profileImagePath ? (
            <Image
              source={{ uri: `${crmEmployee.profileImagePath}` }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text>No Profile Picture Available</Text>
          )}

          <Text style={styles.heading}>Employee Details</Text>

          {/* Employee Details in Table Format */}
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Full Name:</Text>
              <Text style={styles.tableData}>{employee.fullName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Job Title:</Text>
              <Text style={styles.tableData}>{employee.jobTitle}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Email:</Text>
              <Text style={styles.tableData}>{employee.email}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Phone:</Text>
              <Text style={styles.tableData}>{employee.mobile}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Branch:</Text>
              <Text style={styles.tableData}>{employee.branch.branchName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Department:</Text>
              <Text style={styles.tableData}>
                {employee.departments.department}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Shift:</Text>
              <Text style={styles.tableData}>{employee.shifts.shiftName}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Date of Joining:</Text>
              <Text style={styles.tableData}>{employee.dateOfJoining}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error fetching details</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {},
  profileContainer: {
    width: width,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 1,
    elevation: 5, // Shadow for Android and iOS
    shadowColor: "#000", // Shadow for Android
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    alignItems: "center",
  },
  image: {
    width: width * 0.9,
    height: width * 0.7,
    borderRadius: width * 0.23, // Circular image
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#ddd", // Light border color
  },
  tableContainer: {
    width: "100%",
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  tableData: {
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },

  heading: {
    color: "tomato",
    fontSize: 20,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
