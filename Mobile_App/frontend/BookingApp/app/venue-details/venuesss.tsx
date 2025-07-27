import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";

type RouteParams = {
  params: {
    bookingId: number;
  };
};

type Venue = {
  id: number;
  name: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  type: string;
  imageUrl?: string;
};

const screenWidth = Dimensions.get("window").width;

export default function VenueDetailsScreen() {
  const route = useRoute<RouteProp<RouteParams, "params">>();
  const { bookingId } = route.params;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenueDetails();
  }, []);

  const fetchVenueDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/bookings/${bookingId}/venue`
      );
      const data = await response.json();
      setVenue(data);
    } catch (error) {
      console.error("Failed to fetch venue details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;
  }

  if (!venue) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Venue not found.</Text>
      </View>
    );
  }

  const eventType = venue.type?.toLowerCase() || "special";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {venue.imageUrl && (
        <Animated.Image
          source={{ uri: venue.imageUrl }}
          style={styles.image}
          entering={FadeInDown}
        />
      )}

      <Animated.View entering={FadeInDown.delay(100)} style={styles.infoBox}>
        <Text style={styles.title}>{venue.name}</Text>
        <Text style={styles.location}>📍 {venue.location}</Text>
        <Text style={styles.price}>💰 ₹{venue.pricePerHour}/hour</Text>
        <Text style={styles.rating}>⭐ 4.5</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          A premier venue for hosting {eventType} events. Perfect for gatherings with a capacity of {venue.capacity} people.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <Text style={styles.amenity}>• Parking Available</Text>
        <Text style={styles.amenity}>• Refreshments</Text>
        <Text style={styles.amenity}>• Equipment Provided</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    flexGrow: 1,
  },
  image: {
    width: screenWidth - 40,
    height: 400,
    borderRadius: 20,
    marginBottom: 24,
    resizeMode: "cover",
    backgroundColor: "#ddd",
  },
  infoBox: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 6,
  },
  location: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "600",
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: "#f1c40f",
  },
  section: {
    alignSelf: "stretch",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },
  amenity: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
  },
  notFoundText: {
    fontSize: 18,
    color: "red",
    fontWeight: "500",
  },
});
