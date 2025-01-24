import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const bankDetails = () => {
  const bankDetails = {
    accountHolderName: 'John Doe',
    accountNumber: '1234567890',
    bankName: 'XYZ Bank',
    ifscCode: 'XYZ123456',
    branchName: 'Main Branch',
  };

  return (
    <View style={styles.container}>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Account Holder Name:</Text>
        <Text style={styles.value}>{bankDetails.accountHolderName}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Account Number:</Text>
        <Text style={styles.value}>{bankDetails.accountNumber}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Bank Name:</Text>
        <Text style={styles.value}>{bankDetails.bankName}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>IFSC Code:</Text>
        <Text style={styles.value}>{bankDetails.ifscCode}</Text>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.label}>Branch Name:</Text>
        <Text style={styles.value}>{bankDetails.branchName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default bankDetails;
