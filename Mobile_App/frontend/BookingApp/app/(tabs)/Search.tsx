import { Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
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
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "#444" : "#ddd",
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      color: isDark ? "#fff" : "#333",
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
  imageUrl?: string; // Optional image URL
}

export default function Search() {
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);
  const { featuredVenues, loading, error } = useVenues();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVenues = featuredVenues.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Stack.Screen options={{ title: "Search" }} 
      />
      <Animated.View entering={FadeInDown}>
        <Text style={styles.title}></Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={isDark ? "#ccc" : "#666"}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for venues..."
          placeholderTextColor={isDark ? "#999" : "#666"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible
          accessibilityLabel="Search venues"
        />
      </Animated.View>
      {loading ? (
        <ActivityIndicator size="large" color={isDark ? "#5a9cff" : "#3478f6"} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : filteredVenues.length > 0 ? (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => `search-${item.id}`}
          renderItem={renderVenueItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.errorText}>No venues found.</Text>
      )}
    </View>
  );
}
