import React, { useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Modal,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const settings = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBankDetailsDisabled, setIsBankDetailsDisabled] = useState(true); // Added flag to disable bank details button

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("employee");
      router.replace("/(login)");
    } catch (error) {
      console.log("Error during logout:", error);
    }
  };

  const confirmLogout = () => {
    setModalVisible(true);
  };

  const cancelLogout = () => {
    setModalVisible(false);
  };

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Trigger any actions for refreshing the page, like re-checking login state or reloading data
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaProvider>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/profile")}
        >
          <Icon name="person" size={24} color="#000" />
          <Text style={styles.buttonText}>My Account Details</Text>
        </TouchableOpacity>

        <View style={styles.button1}>
          <MaterialCommunityIcons name="bank" size={24} color="black" />
          <Text style={styles.buttonText}>Bank Details</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/helpSupport")}
        >
          <Icon name="help-outline" size={24} color="#000" />
          <Text style={styles.buttonText}>Help and Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={confirmLogout}>
          <Icon name="logout" size={24} color="#000" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={cancelLogout}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={cancelLogout}
                >
                  <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default settings;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: width * 0.9,
    padding: 15,
    marginVertical: 10,
    backgroundColor: "snow",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  button1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: width * 0.9,
    padding: 15,
    marginVertical: 10,
    backgroundColor: "grey",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#e0e0e0", // Disabled button color
  },
  buttonText: {
    fontSize: 18,
    marginLeft: 10,
    color: "#000",
  },

  buttonText1: {
    fontSize: 18,
    marginLeft: 10,
    color: "grey",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#35374B",
    marginHorizontal: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
