import { Stack, useLocalSearchParams, Link, Redirect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";

const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
    },
    image: {
      width: "100%",
      height: 250,
      backgroundColor: isDark ? "#444" : "#eee",
    },
    content: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
      marginBottom: 10,
    },
    details: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#666",
      marginBottom: 10,
    },
    rating: {
      fontSize: 16,
      color: "#f39c12",
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#fff" : "#333",
      marginTop: 20,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#666",
      lineHeight: 24,
      marginBottom: 20,
    },
    amenity: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#666",
      marginBottom: 5,
    },
    relatedCard: {
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      marginRight: 15,
      width: 150,
      elevation: 2,
      shadowColor: isDark ? "transparent" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
      overflow: "hidden",
    },
    relatedImage: {
      width: "100%",
      height: 80,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    relatedName: {
      fontSize: 14,
      fontWeight: "600",
      padding: 8,
      color: isDark ? "#fff" : "#333",
    },
    bookButton: {
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      margin: 20,
    },
    bookButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
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
  imageUrl: string; // Added imageUrl to the interface
}

export default function VenueDetails() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [relatedVenues, setRelatedVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate id parameter
  if (!id || Array.isArray(id)) {
    return <Redirect href="/(tabs)/index" />;
  }

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific venue
        const venueResponse = await fetch(`http://localhost:8080/api/venues/${id}`);
        if (!venueResponse.ok) {
          throw new Error("Failed to fetch venue details");
        }
        const venueData = await venueResponse.json();
        setVenue(venueData);

        // Fetch related venues
        const allVenuesResponse = await fetch("http://localhost:8080/api/venues");
        if (!allVenuesResponse.ok) {
          throw new Error("Failed to fetch related venues");
        }
        const allVenuesData = await allVenuesResponse.json();
        const related = allVenuesData.filter(
          (v: Venue) => v.id !== Number(id) && v.type === venueData.type
        );
        setRelatedVenues(related);
      } catch (err) {
        setError("Unable to load venue details. Please try again later.");
        console.error("Error fetching venue details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [id]);

  const renderRelatedVenue = ({ item }: { item: Venue }) => (
    <Animated.View entering={FadeInDown}>
      <Link href={`/venue-details/${item.id}`} asChild>
        <TouchableOpacity style={styles.relatedCard}>
          <Image
            source={{ uri: item.imageUrl || "https://via.placeholder.com/300x150.png?text=Fallback" }}
            style={styles.relatedImage}
            resizeMode="cover"
          />
          <Text style={styles.relatedName}>{item.name}</Text>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Venue Details" }} />
        <ActivityIndicator size="large" color={isDark ? "#5a9cff" : "#3478f6"} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (error || !venue) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Venue Details" }} />
        <Text style={styles.errorText}>{error || "Venue not found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: venue.name }} />
      <Animated.View entering={FadeInDown}>
        <Image
          source={{ uri: venue.imageUrl || "https://via.placeholder.com/600x400.png?text=Fallback" }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.title}>{venue.name}</Text>
          <Text style={styles.details}>
            {venue.type} • {venue.location} • Capacity: {venue.capacity}
          </Text>
          <Text style={styles.details}>Price: ₹{venue.pricePerHour}/hour</Text>
          <Text style={styles.rating}>⭐ 4.5</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            A premier venue for hosting {venue.type.toLowerCase()} events. Perfect for gatherings, with a capacity of {venue.capacity}.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <Text style={styles.amenity}>• Parking Available</Text>
          <Text style={styles.amenity}>• Refreshments</Text>
          <Text style={styles.amenity}>• Equipment Provided</Text>
        </Animated.View>

        {relatedVenues.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={styles.sectionTitle}>Related Venues</Text>
            <FlatList
              data={relatedVenues}
              keyExtractor={(item) => `related-${item.id}`}
              renderItem={renderRelatedVenue}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(500)}>
          <Link href={`/book?id=${id}`} asChild>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
