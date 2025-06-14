
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";

const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
      padding: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
      marginBottom: 20,
    },
    button: {
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 15,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default function Settings() {
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Settings</Text> */}
      <Link href="/settings/AboutApp" asChild>
        <TouchableOpacity
          style={styles.button}
          accessibilityLabel="Navigate to About App"
        >
          <Text style={styles.buttonText}>About App</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/settings/EditProfile" asChild>
        <TouchableOpacity
          style={styles.button}
          accessibilityLabel="Navigate to Edit Profile"
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/settings/PrivacySettings" asChild>
        <TouchableOpacity
          style={styles.button}
          accessibilityLabel="Navigate to Privacy Settings"
        >
          <Text style={styles.buttonText}>Privacy Settings</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/settings/HelpSupport" asChild>
        <TouchableOpacity
          style={styles.button}
          accessibilityLabel="Navigate to Help and Support"
        >
          <Text style={styles.buttonText}>Help & Support</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
