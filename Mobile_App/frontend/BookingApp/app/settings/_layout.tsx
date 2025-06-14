
import { Stack } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";
import { Platform } from "react-native";
import { useMemo } from "react";

export default function SettingsLayout() {
  const { isDark } = useTheme() || { isDark: false };

  const screenOptions = useMemo(
    () => ({
      headerStyle: {
        backgroundColor: isDark ? "#1a1a1a" : "#fff",
        borderBottomColor: isDark ? "#333" : "#eee",
        ...(Platform.OS === "web"
          ? {
              boxShadow: isDark ? "none" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }
          : {
              shadowColor: isDark ? "transparent" : "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0 : 0.1,
              shadowRadius: 4,
              elevation: 2,
            }),
      },
      headerTintColor: isDark ? "#fff" : "#333",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    }),
    [isDark]
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen name="about" options={{ title: "About App" }} />
        <Stack.Screen name="edit" options={{ title: "Account Settings" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Settings" }} />
      <Stack.Screen name="notifications" options={{ title: "Notification Settings" }} />
      <Stack.Screen name="help" options={{ title: "Help & Support" }} />

    </Stack>
  );
}