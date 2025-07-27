import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export default function EditProfile() {
  const router = useRouter();
  const { isDark } = useTheme() || { isDark: false };
  const { user, updateUser } = useAuth() || { user: null, updateUser: () => {} };
  const [name, setName] = useState(user?.name || "Anjo Erinjery");
  const [email, setEmail] = useState(user?.email || "anjo@example.com");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone || "+91 9876543210");

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Name, email, and phone are required.");
      return;
    }
    if (password && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const token = user?.token; // Assume token is in user object from useAuth
      if (!token) {
        Alert.alert("Error", "Authentication required. Please log in.");
        return;
      }

      const payload = {
        name,
        email,
        password: password || undefined, // Only send password if changed
        phone,
      };

      const response = await fetch(`http://localhost:8080/api/auth/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();
      updateUser(updatedUser); // Update auth context
      Alert.alert("Success", "Profile updated successfully!"); // Success alert shown here
      router.back();
    } catch (err) {
      console.log("Error updating profile at", new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }), err);
      Alert.alert("Error", err.message || "Unable to update profile. Please try again.");
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#1a1a1a" : "#fff",
    },
    heading: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 30,
      textAlign: "center",
      color: isDark ? "#fff" : "#333",
    },
    label: {
      fontSize: 16,
      marginBottom: 6,
      marginTop: 12,
      color: isDark ? "#ccc" : "#666",
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#444" : "#ccc",
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      color: isDark ? "#fff" : "#333",
      backgroundColor: isDark ? "#2a2a2a" : "#fff",
    },
    saveButton: {
      marginTop: 30,
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
    },
    saveButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={user?.username} // Changed to use local state
        onChangeText={setName} // Added to update name state
        placeholder="Enter your name"
        placeholderTextColor={isDark ? "#888" : "#999"}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={isDark ? "#888" : "#999"}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password (optional)"
        secureTextEntry
        placeholderTextColor={isDark ? "#888" : "#999"}
      />

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Enter your phone"
        keyboardType="phone-pad"
        placeholderTextColor={isDark ? "#888" : "#999"}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}