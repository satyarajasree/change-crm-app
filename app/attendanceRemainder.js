import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "./api"; // Adjust based on your API config
import { Calendar } from "react-native-calendars";
import { MaterialIcons } from "@expo/vector-icons"; // For the floating button icon
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker

const {height, width} = Dimensions.get("window")

export default function attendanceReminder() {
  const [remainderDates, setRemainderDates] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDateContent, setSelectedDateContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false); // Show date picker
  const [chosenDate, setChosenDate] = useState(new Date()); // Default date

  const MAX_MESSAGE_LENGTH = 200;

  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    return tomorrow.toISOString().split("T")[0]; // Default to tomorrow's date
  });

  // Fetch remainder dates from the API
  const fetchRemainders = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await axios.get(
        `${API_BASE_URL}/crm/employee/employees/remainders`,
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      setRemainderDates(response.data);
      markCalendar(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch remainder dates");
    } finally {
      setLoading(false);
    }
  };

  // Mark calendar with remainder dates
  const markCalendar = (remainderData) => {
    const dates = {};
    remainderData.forEach((remainder) => {
      const remainderDate = new Date(remainder.date)
        .toISOString()
        .split("T")[0];
      dates[remainderDate] = {
        customStyles: {
          container: {
            backgroundColor: "darkslategrey", // Mark remainder dates with darkslategrey
          },
          text: {
            color: "white",
            fontWeight: "bold",
          },
        },
      };
    });
    setMarkedDates(dates);
  };

  useEffect(() => {
    fetchRemainders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRemainders().finally(() => setRefreshing(false));
  };

  const handleDayPress = (day) => {
    const selectedRemainder = remainderDates.find(
      (remainder) =>
        new Date(remainder.date).toISOString().split("T")[0] === day.dateString
    );
    setSelectedDateContent(
      selectedRemainder
        ? `Date: ${day.dateString}\nMessage: ${selectedRemainder.message}`
        : `No remainder found for ${day.dateString}`
    );
  };

  // Reset form fields and close modal
  const resetForm = () => {
    setMessage("");
    setDate("");
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split("T")[0];
    setStartDate(tomorrow);
    setChosenDate(new Date()); // Reset chosenDate to the current date
    setModalVisible(false); // Close the modal
  };



  const cancel = () => {
    resetForm();
    setModalVisible(false);
  }
  // Handle form submission
  const handleSubmitReminder = async () => {
    if (!message || !date) {
      alert("Please fill in all fields");
      return;
    }

    // Check for existing reminder on the selected date
    const existingReminder = remainderDates.find(
      (remainder) => remainder.date === date
    );

    if (existingReminder) {
      alert("A reminder already exists for this date");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await axios.post(
        `${API_BASE_URL}/crm/employee/create-remainder`,
        { message, date },
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Reminder created successfully");
        resetForm(); // Reset the form after submission
        fetchRemainders(); // Refresh the remainder dates after submission
      }
    } catch (err) {
      alert("Failed to create reminder: " + (err.message || "Unknown error"));
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    const currentDate = selectedDate || chosenDate;
    setChosenDate(currentDate);
    const formattedDate = currentDate.toISOString().split("T")[0]; 
    setStartDate(formattedDate); 
    setDate(formattedDate); 
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Calendar
          markingType="custom"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={{
            selectedDayBackgroundColor: "#35374B",
            todayTextColor: "#35374B", 
            arrowColor: "#35374B",
          }}
        />

        {selectedDateContent && (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>{selectedDateContent}</Text>
          </View>
        )}

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColorBox,
                { backgroundColor: "darkslategrey" },
              ]}
            />
            <Text style={styles.legendText}>Reminder</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal for creating a new remainder */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create Reminder</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Message"
            value={message}
            onChangeText={setMessage}
            maxLength={MAX_MESSAGE_LENGTH} // Limit the length of the message
          />
          <Text style={styles.characterCount}>
            {message.length}/{MAX_MESSAGE_LENGTH}
          </Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              style={styles.input}
              placeholder="Enter Date (YYYY-MM-DD)"
              value={startDate}
              editable={false} // Disable text input
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={chosenDate}
              mode="date"
              display="default"
              minimumDate={
                new Date(new Date().setDate(new Date().getDate() + 1))
              }
              onChange={onDateChange}
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmitReminder}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={cancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  alertBox: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  alertText: {
    color: "#333",
    fontSize: 16,
    textAlign: "center",
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#35374B",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    color: "gray",
    textAlign: "right",
    marginBottom: 15
  }
  
});
