import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './api';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const notifications = () => {
  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastNotificationId = useRef(null);

  // Fetch JWT token
  const fetchToken = async () => {
    const token = await SecureStore.getItemAsync('jwtToken');
    if (!token) throw new Error('Authentication token not found');
    return token.replace(/^"|"$/g, ''); // Format the token
  };

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = await fetchToken();
      const response = await fetch(`${API_BASE_URL}/crm/employee/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications, status code: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data)) return;

      // Sort notifications in reverse order (latest first)
      const sortedNotifications = data.reverse();

      // Check for new notifications
      if (
        sortedNotifications.length > 0 &&
        sortedNotifications[0].id !== lastNotificationId.current
      ) {
        const newNotification = sortedNotifications[0];
        lastNotificationId.current = newNotification.id;

        // Send a local push notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Notification!',
            body: newNotification.message,
          },
          trigger: null,
        });
      }

      setNotificationsData(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={notificationsData}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>{loading ? 'Loading...' : 'No notifications found'}</Text>
        }
        renderItem={({ item }) => {
          const formattedTimestamp = new Date(item.timestamp).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // 24-hour format
          });

          return (
            <View style={styles.notificationItem}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationTimestamp}>{formattedTimestamp}</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  notificationItem: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationTimestamp: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default notifications;
