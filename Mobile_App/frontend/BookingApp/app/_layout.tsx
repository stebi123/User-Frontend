import { Slot, Stack } from "expo-router";
import { useTheme, ThemeProvider } from "./contexts/ThemeContext";
import { Platform } from "react-native";
import { AuthProvider } from "./contexts/AuthContext";

// Define types for the stack navigator (optional but recommended for TypeScript)
type RootStackParamList = {
  "(tabs)": undefined;
  "venue-details/[id]": { id: string };
  "book/[id]": { id: string };
  "settings": undefined;
};

function RootLayoutNav() {
  const context = useTheme();
  // Throw an error if useTheme() returns undefined to catch context issues early
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  const { isDark } = context;

  return (
    <Stack
      screenOptions={{
        headerShown:false, // Show header for all screens except tabs
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
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="venue-details/[id]" options={{ title: "Venue Details" }} />
      <Stack.Screen name="book/[id]" options={{ title: "Book Venue" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <Slot />
      </AuthProvider>
    </ThemeProvider>
  );
}
