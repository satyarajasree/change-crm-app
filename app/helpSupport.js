import React, { useRef, useState, useEffect } from "react";
import { Text, View, StyleSheet, ScrollView, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

const helpSupport = () => {
  const [message, setMessage] = useState("");
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  const handleSubmit = () => {
    // Handle the support request submission (e.g., send it to an API)
    console.log("Support message submitted:", message);
    setMessage("");
  };

  return (
    <ScrollView style={styles.container}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: width,
          height: width * 0.7,
          backgroundColor: "#f5f5f5",
        }}
        source={require("../assets/anime/help.json")}
      />
      {/* Support Information */}
      <View style={styles.section}>
        <Text style={styles.heading}>Contact Support</Text>
        <Text style={styles.text}>
          For immediate assistance, please contact our support team:
        </Text>
        <Text style={styles.text}>Email: Info@rajasreetownships.in</Text>
        <Text style={styles.text}>Phone: +91 6262666999</Text>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Frequently Asked Questions</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>
            Q1: How do I request leave through the app?
          </Text>{" "}
          {"\n"}
          <Text style={styles.text}>
            A1: You can request leave by navigating to the "Leave Request"
            section, selecting the type of leave, and filling in the required
            details such as dates and reason. Once submitted, your request will
            be sent for approval.
          </Text>
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>
            Q2: How do I mark my attendance with Punch In/Out?
          </Text>{" "}
          {"\n"}
          <Text style={styles.text}>
            Use the "Punch In" and "Punch Out" buttons in the app to mark your
            attendance. Ensure you are within the allowed geolocation and have
            camera permissions enabled if image verification is required.
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

export default helpSupport;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  section: {
    marginBottom: 0,
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});
