
import { Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useVenues } from "../hooks/useVenues";
import { Link } from "expo-router";

const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
      marginBottom: 20,
    },
    venueCard: {
      flexDirection: "row",
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      marginBottom: 15,
      elevation: 2,
      shadowColor: isDark ? "transparent" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
      overflow: "hidden",
    },
    venueImage: {
      width: 100,
      height: 100,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
    },
    venueInfo: {
      flex: 1,
      padding: 10,
    },
    venueName: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#fff" : "#333",
      marginBottom: 5,
    },
    venueDetails: {
      fontSize: 14,
      color: isDark ? "#ccc" : "#666",
      marginBottom: 5,
    },
    venueRating: {
      fontSize: 14,
      color: "#f39c12",
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginTop: 20,
    },
  });

interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  type: string;
  imageUrl?: string; // Optional field for venue image
}

export default function Explore() {
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);
  const { featuredVenues, loading, error } = useVenues();

  const renderVenueItem = ({ item }: { item: Venue }) => (
    <Animated.View entering={FadeInDown}>
      <Link href={`/venue-details/${item.id}`} asChild>
        <TouchableOpacity style={styles.venueCard}>
          <Image
            source={{ uri: item.imageUrl || "https://via.placeholder.com/100" }} // Fallback image if no imageUrl
            style={styles.venueImage}
            resizeMode="cover"
          />
          <View style={styles.venueInfo}>
            <Text style={styles.venueName}>{item.name}</Text>
            <Text style={styles.venueDetails}>
              {item.type} • {item.location}
            </Text>
            <Text style={styles.venueRating}>⭐ 4.5</Text>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Explore Venues" }} />
      <Animated.View entering={FadeInDown}>
        <Text style={styles.title}>Explore Venues</Text>
      </Animated.View>
      {loading ? (
        <ActivityIndicator size="large" color={isDark ? "#5a9cff" : "#3478f6"} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : featuredVenues.length > 0 ? (
        <FlatList
          data={featuredVenues}
          keyExtractor={(item) => `explore-${item.id}`}
          renderItem={renderVenueItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.errorText}>No venues available.</Text>
      )}
    </View>
  );
}