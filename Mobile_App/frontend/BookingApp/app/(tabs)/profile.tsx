import { Stack, Link, router } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform, ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";


const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
      padding: 20,
    },
    profileHeader: {
      alignItems: "center",
      marginBottom: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginTop: 20,
    },
    button: {
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 20,
      overflow: "hidden",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    profileName: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
    },
    profileEmail: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#666",
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      elevation: Platform.OS === "android" ? 2 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "none" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 4,
          }),
    },
    optionText: {
      fontSize: 16,
      color: isDark ? "#fff" : "#333",
      marginLeft: 10,
    },
  });

interface User {
  username: string;
  email: string;
}


export default function Profile() {
  const { isDark, toggleTheme } = useTheme() || { isDark: false, toggleTheme: () => {} };
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  const { user, isLoggedIn, logout,loading:authLoading,isGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primary = isDark ? "#5a9cff" : "#3478f6";
    const secondary = isDark ? "#3b6cd4" : "#2a5cc4";
     if (authLoading) {
        return (
          <View style={styles.container}>
            <Stack.Screen options={{ title: "Book Venue" }} />
            <ActivityIndicator size="large" color={primary} />
          </View>
        );
      }
    
      if (!user && !isGuest) return null;
    
      if (isGuest) {
        return (
          <View style={styles.container}>
            <Stack.Screen options={{ title: "Book Venue" }} />
            <Text style={styles.errorText}>Guests cannot view this page. Please sign in.</Text>
            <Link href="/auth/Login" asChild>
              <TouchableOpacity style={{ ...styles.button, marginTop: 20 }}>
                <LinearGradient
                  colors={[primary, secondary]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        );
      }

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed, e.g., Authorization: `Bearer ${token}`
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

      } catch (err: any) {
        setError(err.message);
        Alert.alert("Error", "Could not fetch user details. Using default values.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => router.push("/auth/Login"), style: "destructive" },
      ],
      { cancelable: true }
    );
    
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Profile" }} />
      <Animated.View entering={FadeInDown} style={styles.profileHeader}>
        <Image
          source={{ uri: "https://via.placeholder.com/100.png?text=User" }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{loading ? "Loading..." : user?.username}</Text>
        <Text style={styles.profileEmail}>{loading ? "Loading..." : user?.email}</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100)}>
        <TouchableOpacity
          style={styles.option}
          onPress={toggleTheme}
          accessibilityLabel={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={isDark ? "#ccc" : "#666"} />
          <Text style={styles.optionText}>{isDark ? "Light Mode" : "Dark Mode"}</Text>
        </TouchableOpacity>
        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.option} accessibilityLabel="Navigate to Settings">
            <Ionicons name="settings" size={24} color={isDark ? "#ccc" : "#666"} />
            <Text style={styles.optionText}>Settings</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push('/auth/Login')}
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out" size={24} color={isDark ? "#ccc" : "#666"} />
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}