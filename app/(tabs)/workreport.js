import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import * as Location from "expo-location"; // Import location module
import { API_BASE_URL } from "../api";
import { Picker } from "@react-native-picker/picker";

const { height, width } = Dimensions.get("window");

const WorkReport = () => {
  const [date, setDate] = useState(new Date());
  const [nameOfPerson, setNameOfPerson] = useState("");
  const [projectName, setProjectName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [workReport, setWorkReport] = useState("");
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchEmployee();
    requestLocationPermission(); // Request location permission on component mount
  }, []);

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

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }
    const currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  };

  const validateForm = () => {
    const today = new Date();
    if (date > today) {
      Alert.alert("Validation Error", "Date cannot be in the future.");
      return false;
    }

    if (department === "Marketing") {
      if (!nameOfPerson.trim() || nameOfPerson.length < 3) {
        Alert.alert("Validation Error", "Name of Person is required.");
        return false;
      }

      if (!projectName) {
        Alert.alert("Validation Error", "Please select a Project Name.");
        return false;
      }

      if (!remarks) {
        Alert.alert("Validation Error", "Please select Remarks.");
        return false;
      }

      if (remarks === "Next visit date" && reminderDate < today) {
        Alert.alert("Validation Error", "Reminder date cannot be in the past.");
        return false;
      }
    } else {
      if (!workReport.trim() || workReport.length < 10) {
        Alert.alert("Validation Error", "Work Report is required.");
        return false;
      }
    }

    if (!location) {
      Alert.alert("Validation Error", "Location is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) throw new Error("Authentication token not found");
      const formattedToken = token.replace(/^"|"$/g, "");
  
      const requestData = {
        date: date.toISOString(),
        nameOfPerson,
        projectName,
        remarks,
        workReport,
        reminderDate: reminderDate.toISOString(),
        latitude: location?.latitude,
        longitude: location?.longitude,
      };
  
      await axios.post(
        `${API_BASE_URL}/crm/employee/add-work-report`,
        requestData,
        {
          headers: { Authorization: `Bearer ${formattedToken}` },
        }
      );
  
      Alert.alert("Success", "Work report submitted successfully.");
  
      // Reset form state
      setDate(new Date());
      setNameOfPerson("");
      setProjectName("");
      setRemarks("");
      setWorkReport("");
      setReminderDate(new Date());
      setLocation(null); // Optionally reset location if needed
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };
  

  const department = employee?.departments?.department;

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {department === "Marketing" ? (
          <>
            <Text style={styles.label}>Name of Person</Text>
            <TextInput
              style={styles.input}
              value={nameOfPerson}
              onChangeText={setNameOfPerson}
              placeholder="Enter the name"
            />

            <Text style={styles.label}>Project Name</Text>
            <Picker
              selectedValue={projectName}
              style={styles.picker}
              onValueChange={setProjectName}
            >
              <Picker.Item label="Select Project" value="" />
              <Picker.Item
                label="Future Green City"
                value="Future Green City"
              />
              <Picker.Item label="Sai Keshava" value="Sai Keshava" />
            </Picker>

            <Text style={styles.label}>Remarks</Text>
            <Picker
              selectedValue={remarks}
              style={styles.picker}
              onValueChange={setRemarks}
            >
              <Picker.Item label="Select Remarks" value="" />
              <Picker.Item label="Interested" value="Interested" />
              <Picker.Item label="Next visit date" value="Next visit date" />
              <Picker.Item label="Any referral" value="Any referral" />
              <Picker.Item label="Site visit" value="Site visit" />
              <Picker.Item
                label="More details regarding the project"
                value="More details regarding the project"
              />
              <Picker.Item label="Not Interested" value="Not Interested" />
            </Picker>

            <Text style={styles.label}>Reminder Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowReminderDatePicker(true)}
            >
              <Text>{reminderDate.toDateString()}</Text>
            </TouchableOpacity>
            {showReminderDatePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowReminderDatePicker(false);
                  if (selectedDate) setReminderDate(selectedDate);
                }}
              />
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>Work Report</Text>
            <TextInput
              style={[styles.input, { height: height * 0.1 }]}
              value={workReport}
              onChangeText={setWorkReport}
              placeholder="Enter work report"
              multiline={true}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "SUBMIT"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: width * 0.05 },
  label: {
    fontSize: height * 0.02,
    marginVertical: height * 0.01,
    fontWeight: "bold",
  },
  input: {
    height: height * 0.06,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#021526",
    padding: height * 0.02,
    borderRadius: 5,
    alignItems: "center",
    marginTop: height * 0.02,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: height * 0.02 },
  picker: {
    width: width * 0.9,
    marginTop: 5,
    height: width * 0.15,
    backgroundColor: "#F9F9F9",
  },
});

export default WorkReport;
