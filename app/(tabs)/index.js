import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  View,
  RefreshControl,
  BackHandler,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../api";
import { AntDesign, Entypo } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const QUOTATIONS = [
  "“Challenges are what make life interesting and overcoming them is what makes life meaningful.” –Joshua J. Marine",
  "“Your most important work is always ahead of you, never behind you.” – Stephen Covey",
  "“If you can’t fly, then run; if you can’t run, then walk; if you can’t walk, then crawl, but whatever you do, you have to keep moving forward.” – Martin Luther King Jr.",
  "“Perfection is not attainable, but if we chase perfection, we can catch excellence.” — Vince Lombardi",
  "“It is strange that sword and words have the same letters.” – Gaur Gopal Das",
  "“My definition of success is how I have the freedom and ability to do anything I want, without the fear of failure.”– Vineeta Singh",
];

const QUOTE_COLORS = [
  "#FF5733", // Red-orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#FF33A1", // Pink
  "#FFC300", // Yellow
  "#9B59B6", // Purple
];

const index = () => {
  const [employee, setEmployee] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [crmEmployee, setCrmEmployee] = useState(null);
  const [quotation, setQuotation] = useState("");
  const [quoteColor, setQuoteColor] = useState("#000");

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
      if (employeeData) {
        setEmployee(JSON.parse(employeeData));
      } else {
        console.error("No employee data found");
      }
    } catch (error) {
      console.error("Error retrieving employee data:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployee().finally(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    fetchEmployee();
    const randomIndex = Math.floor(Math.random() * QUOTATIONS.length);
    setQuotation(QUOTATIONS[randomIndex]);
    setQuoteColor(QUOTE_COLORS[randomIndex]);
  }, []);

  useEffect(() => {
    if (employee) {
      fetchCrmEmployee(employee.id);
    }
  }, [employee]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [])
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.row}>
        {employee ? (
          <>
            <View style={styles.column1}>
              {crmEmployee ? (
                <>
                  <Image
                    source={{ uri: crmEmployee.profileImagePath }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </>
              ) : (
                <Text>No Profile Picture Available</Text>
              )}
            </View>

            <View style={styles.column}>
              <Text style={styles.employeeDetailTitle}>Employee Details:</Text>
              <Text style={styles.employeeNameText}>{employee.fullName}</Text>
              <Text style={styles.employeeText}>
                <Entypo name="dot-single" size={20} color="black" />{" "}
                {employee.mobile}
              </Text>
              <Text style={styles.employeeText}>
                <Entypo name="dot-single" size={20} color="black" />{" "}
                {employee.jobTitle}
              </Text>
              <Text style={styles.employeeText}>
                <Entypo name="dot-single" size={20} color="black" />{" "}
                {employee.branch.branchName}
              </Text>
              <Text style={styles.employeeText}>
                <Entypo name="dot-single" size={20} color="black" />
                {employee.departments.department}
              </Text>
            </View>
          </>
        ) : (
          <Text>Loading</Text>
        )}
      </View>

      <View style={styles.quoteBackground}>
        <Text style={[styles.quoteText, { color: quoteColor }]}>
          {quotation}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row1}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/attendance")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>View Attendance</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/leaves")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Request Leave</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.row1}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/holidayList")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Holidays</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/attendanceRemainder")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Reminders</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.row1}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/myDocuments")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>My Documents</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/settings")}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Settings</Text>
          </View>
        </TouchableOpacity>
      </View>
     
    </ScrollView>
  );
};

export default index;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: height * 0.3,
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: width * 0.01,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    width: "100%",
    borderBottomColor: "black",
    borderBottomWidth: 1,
  },
  column: {
    padding: 10,
  },
  column1: {
    flex: 1,
    padding: 10,
  },
  employeeDetailTitle: {
    color: "green",
    fontWeight: "bold",
    fontSize: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  employeeText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 15,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "black",
    marginVertical: 10,
  },
  row1: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  card: {
    width: (width - 40) / 2,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#7FFFD4",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: "#fff",
  },
  cardContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    paddingVertical: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    paddingTop: width * 0.05,
    fontWeight: "bold",
  },
  quoteBackground: {
    backgroundColor: "",
  },
  employeeNameText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 17,
  },
});
