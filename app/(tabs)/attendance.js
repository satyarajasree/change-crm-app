import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import * as SecureStore from "expo-secure-store";
import axios from 'axios';
import { API_BASE_URL } from '../api';
import { Calendar } from 'react-native-calendars';

export default function attendance() {
  const [punch, setPunch] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDateContent, setSelectedDateContent] = useState(null);

  const fetchPunch = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwtToken");
      const employee = await SecureStore.getItemAsync("employee");
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await axios.get(`${API_BASE_URL}/crm/employee/punch-activities`, {
        headers: {
          Authorization: `Bearer ${formattedToken}`,
        },
        
      });

      setPunch(response.data);
      markCalendar(response.data, JSON.parse(employee).branchName);
    } catch (err) {
      setError(err.message || "Failed to fetch punch activities");
    }
  };

  const markCalendar = (punchData, branchName) => {
    const dates = {};
    const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
  
    // Mark present, absent, and in-progress days
    punchData.forEach((record) => {
      const punchDate = new Date(record.date).toISOString().split('T')[0];
  
      if (record.punchInImagePresent && record.punchOutImagePresent) {
        // Case: Both punch-in and punch-out images are present (Present)
        dates[punchDate] = {
          customStyles: {
            container: { backgroundColor: 'lightgreen' },
            text: { color: 'black', fontWeight: 'bold' },
          },
        };
      } else if (record.punchInImagePresent && !record.punchOutImagePresent) {
        // Case: Only punch-in image is present (In Progress)
        dates[punchDate] = {
          customStyles: {
            container: { backgroundColor: 'yellow' },
            text: { color: 'black', fontWeight: 'bold' },
          },
        };
      }
    });
  
    punchData.forEach((record) => {
      const punchDate = new Date(record.date).toISOString().split('T')[0];
      if (!record.punchOutImagePresent && punchDate < today) {
        // Case: No punch-out for past days (Absent)
        dates[punchDate] = {
          customStyles: {
            container: { backgroundColor: 'red' },
            text: { color: 'white', fontWeight: 'bold' },
          },
        };
      }
    });
  
    // Determine the branch and set the appropriate holiday
    const isHyderabadBranch = branchName.toLowerCase() === "hyderabad";
    const isVijayawadaBranch = branchName.toLowerCase() === "vijayawada";
  
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
  
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
      const formattedDate = date.toISOString().split('T')[0];
  
      if (isHyderabadBranch && dayOfWeek === 1 && !dates[formattedDate]) {
        // Monday as Paid Leave for Hyderabad branch
        dates[formattedDate] = {
          customStyles: {
            container: { backgroundColor: 'orange' },
            text: { color: 'white', fontWeight: 'bold' },
          },
        };
      } else if (isVijayawadaBranch && dayOfWeek === 5 && !dates[formattedDate]) {
        // Friday as Paid Leave for Vijayawada branch
        dates[formattedDate] = {
          customStyles: {
            container: { backgroundColor: 'orange' },
            text: { color: 'white', fontWeight: 'bold' },
          },
        };
      }
    }
  
    setMarkedDates(dates); // Update state with marked dates
  };
  
  useEffect(() => {
    fetchPunch();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPunch().finally(() => setRefreshing(false));
  };

  const handleDayPress = (day) => {
    const selectedPunch = punch.find(
      (record) => new Date(record.date).toISOString().split('T')[0] === day.dateString
    );
    setSelectedDateContent(
      selectedPunch
        ? `Date: ${day.dateString}\nPunched-in: ${selectedPunch.punchInTime}\nPunched-out: ${selectedPunch.punchOutTime ? selectedPunch.punchOutTime : "Not done yet"}\nStatus: ${
            selectedPunch.punchInImagePresent && selectedPunch.punchOutImagePresent
              ? "Present"
              : "In-Progress"
          }`
        : `No records found for ${day.dateString}`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {error && <Text style={styles.errorText}>No punch activities done till now</Text>}

      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          selectedDayBackgroundColor: '#35374B',
          todayTextColor: '#35374B',
          arrowColor: '#35374B',
        }}
      />

      {selectedDateContent && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>{selectedDateContent}</Text>
        </View>
      )}

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: 'lightgreen' }]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Absent</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: 'yellow' }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: 'orange' }]} />
          <Text style={styles.legendText}>Paid Leave</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  alertBox: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  alertText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
