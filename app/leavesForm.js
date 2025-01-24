import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import LottieView from "lottie-react-native";
import { router } from "expo-router";
import { API_BASE_URL } from "./api";

const { height, width } = Dimensions.get("window");

export const leaveForm = () => {
  const [employeeName, setEmployeeName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [leaveType, setLeaveType] = useState("");
  const [leaveDay, setLeaveDay] = useState("");
  const [reason, setReason] = useState("");
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const animation = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isModalVisible) {
      animation.current?.play();
    }
  }, [isModalVisible]);

  const validateForm = () => {
    if (!reason.trim()) {
      Alert.alert("Validation Error", "Reason for leave is required.");
      return false;
    }
    if (reason.length > 50) {
      Alert.alert("Validation Error", "Reason cannot exceed 50 characters.");
      return false;
    }
    if (!leaveType) {
      Alert.alert("Validation Error", "Please select a leave type.");
      return false;
    }
    if (!leaveDay) {
      Alert.alert("Validation Error", "Please select leave day");
      return false;
    }
    if (endDate < startDate) {
      Alert.alert(
        "Validation Error",
        "End date cannot be earlier than the start date."
      );
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

      await axios.post(
        `${API_BASE_URL}/crm/employee/add-leave`,
        {
          employeeName,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          leaveType,
          leaveDay,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      setIsModalVisible(true);

      setTimeout(() => {
        setIsModalVisible(false);
        router.back();
      }, 3000);
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);

    // Reset form fields
    setEmployeeName("");
    setStartDate(new Date());
    setEndDate(new Date());
    setLeaveType("");
    setLeaveDay("");
    setReason("");

    setTimeout(() => setRefreshing(false), 1000);
  };

  const onFromDateChange = (event, selectedDate) => {
    setShowFromDatePicker(false);
    if (selectedDate) {
      setStartDate(new Date(selectedDate));
    }
  };

  const onToDateChange = (event, selectedDate) => {
    setShowToDatePicker(false);
    if (selectedDate) {
      setEndDate(new Date(selectedDate));
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.container}>
        <Text style={styles.label}>Reason for Leave</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={(text) => setReason(text.slice(0, 50))}
          placeholder="Enter the reason for leave"
          maxLength={50}
        />
        <Text style={styles.characterCount}>{reason.length}/50 characters</Text>

        <Text style={styles.label}>From Date</Text>
        <TextInput
          style={styles.input}
          value={startDate.toDateString()}
          onFocus={() => setShowFromDatePicker(true)}
          placeholder="Select From Date"
        />
        {showFromDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onFromDateChange}
            accentColor="red"
          />
        )}

        <Text style={styles.label}>To Date</Text>
        <TextInput
          style={styles.input}
          value={endDate.toDateString()}
          onFocus={() => setShowToDatePicker(true)}
          placeholder="Select To Date"
        />
        {showToDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={onToDateChange}
          />
        )}

        <Text style={styles.label}>Leave Type</Text>
        <Picker
          selectedValue={leaveType}
          onValueChange={setLeaveType}
          style={pickerSelectStyles.inputIOS}
        >
          <Picker.Item label="Select Leave Type" value="" />
          <Picker.Item label="Sick Leave" value="sick" />
          <Picker.Item label="Casual Leave" value="casual" />
          <Picker.Item label="Paid Leave" value="paid" />
        </Picker>

        <Text style={styles.label}>Leave Day</Text>
        <Picker
          selectedValue={leaveDay}
          onValueChange={setLeaveDay}
          style={pickerSelectStyles.inputIOS}
        >
          <Picker.Item label="Select Day" value="" />
          <Picker.Item label="Full Day" value="full-day" />
          <Picker.Item label="Half Day" value="half-day" />
        </Picker>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "SUBMIT"}
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LottieView
                autoPlay
                loop={false}
                ref={animation}
                style={{ width: 200, height: 200 }}
                source={require("../assets/anime/request.json")}
              />
              <Text style={styles.modalText}>
                Sending your Leave Application
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { padding: width * 0.05 },
  label: {
    fontSize: height * 0.02,
    marginVertical: height * 0.015,
    fontWeight: "bold",
  },
  input: {
    height: height * 0.06,
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
  },
  button: {
    backgroundColor: "#021526",
    padding: height * 0.02,
    borderRadius: 5,
    alignItems: "center",
    marginTop: height * 0.02,
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.25, // Shadow transparency
    shadowRadius: 3.84, // Shadow blur radius
    elevation: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: height * 0.02 },
  buttonDisabled: { backgroundColor: "#A9A9A9" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    padding: width * 0.05,
    alignItems: "center",
  },
  characterCount: {
    fontSize: height * 0.012,
    color: "grey",
    textAlign: "right",
    marginBottom: height * 0.02,
  },

  modalText: {
    fontSize: height * 0.02,
    fontWeight: "bold",
    textAlign: "center",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: height * 0.09,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: width * 0.04,
  },
});

export default leaveForm;
