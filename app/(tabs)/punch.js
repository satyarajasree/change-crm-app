import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from "react-native";
import LottieView from "lottie-react-native";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("screen");

const punch = () => {
  const animation = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [punch, setPunch] = useState([]);

  useEffect(() => {
    animation.current?.play();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const fetchPunch = async () => {
    try {
      const token = await SecureStore.getItemAsync("jwtToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const formattedToken = token.replace(/^"|"$/g, "");
      const response = await axios.get(
        `${API_BASE_URL}/crm/employee/punch-activities`,
        {
          headers: {
            Authorization: `Bearer ${formattedToken}`,
          },
        }
      );

      setPunch(response.data);
      console.log(response);
    } catch (err) {
      setError(err.message || "Failed to fetch punch activities");
    }
  };
  useEffect(() => {
    fetchPunch();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: width,
          height: width * 0.7,
          backgroundColor: "white",
          color: "red",
        }}
        source={require("../../assets/anime/punch-in1.json")}
      />

      <View style={styles.divider} />

      <View style={styles.note}>
        <Text style={styles.noteText}>𝐃𝐨𝐧'𝐭 𝐟𝐨𝐫𝐠𝐞𝐭 𝐭𝐨 𝐩𝐮𝐧𝐜𝐡𝐨𝐮𝐭 𝐞𝐯𝐞𝐫𝐲 𝐝𝐚𝐲</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/camera")}
      >
        <Text style={styles.buttonText}>Punch In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/punchOut")}
      >
        <Text style={styles.buttonText}>Punch Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default punch;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  button: {
    width: width * 0.8,
    marginTop: width * 0.09,
    backgroundColor: "#4B9CD3",
    borderRadius: 10,
    shadowColor: "black", // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 1, // Shadow transparency
    shadowRadius: 10, // Shadow blur radius
    elevation: 30,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 20,
    padding: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: "100%",
    flex: 0,
    marginVertical: 10,
  },
  note: {
    width: "90%",
    textAlign: "center",
    padding: 10,
    marginTop: 10,
  },
  noteText: {
    textAlign: "center",
    color: "#CD5C5C",
    fontSize: width * 0.05,
  },
});
