
import { View, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function NotificationSettings() {
  const { isDark } = useTheme() || { isDark: false };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa", padding: 20 }}>
      <Text style={{ color: isDark ? "#fff" : "#333", fontSize: 20 }}>
        Notification Settings
      </Text>
    </View>
  );
}
