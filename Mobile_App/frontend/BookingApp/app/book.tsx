import { Stack, useLocalSearchParams, Link } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "./contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import {useAuth} from "./contexts/AuthContext"

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
    label: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#666",
      marginBottom: 5,
    },
    input: {
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      color: isDark ? "#fff" : "#333",
      marginBottom: 15,
      borderWidth: 1,
      borderColor: isDark ? "#444" : "#ddd",
    },
    button: {
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 20,
    },
    buttonText: {
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
}

export default function Book() {
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [date, setDate] = useState("2025-05-25"); // Default to current date
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00"); // Default time slot
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const { user, isLoggedIn, logout } = useAuth()

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8080/api/venues/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch venue");
        }
        const data = await response.json();
        setVenue(data);
      } catch (err) {
        setError("Unable to load venue. Please try again later.");
        console.error("Error fetching venue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

const handleBook = async () => {
  try {
    setLoading(true);
    setError(null);
    setBookingStatus(null);

    const response = await fetch("http://localhost:8080/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        venueId: Number(id),
        userEmail: user?.email,  // Replace with actual logged-in user email
        date: date,
        startTime:startTime,
        endTime:endTime,
        status: "Confirmed",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to book venue");
    }

    setBookingStatus("Booking confirmed! Check My Bookings for details.");
  } catch (err) {
    setError("Failed to book venue. Please try again.");
    console.error("Error booking venue:", err);
  } finally {
    setLoading(false);
  }
};


  if (loading && !venue) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Book Venue" }} />
        <ActivityIndicator size="large" color={isDark ? "#5a9cff" : "#3478f6"} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (error || !venue) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Book Venue" }} />
        <Text style={styles.errorText}>{error || "Venue not found."}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Book ${venue.name}` }} />
      <Animated.View entering={FadeInDown}>
        <Text style={styles.title}>Book {venue.name}</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={isDark ? "#999" : "#666"}
        />
      </Animated.View>
<Animated.View entering={FadeInDown.delay(200)}>
  <Text style={styles.label}>Start Time</Text>
  <TextInput
    style={styles.input}
    value={startTime}
    onChangeText={setStartTime}
    placeholder="e.g., 14:00"
    placeholderTextColor={isDark ? "#999" : "#666"}
    keyboardType="numeric"
  />
</Animated.View>

<Animated.View entering={FadeInDown.delay(300)}>
  <Text style={styles.label}>End Time</Text>
  <TextInput
    style={styles.input}
    value={endTime}
    onChangeText={setEndTime}
    placeholder="e.g., 15:00"
    placeholderTextColor={isDark ? "#999" : "#666"}
    keyboardType="numeric"
  />
</Animated.View>

      {bookingStatus ? (
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[styles.errorText, { color: "green" }]}>{bookingStatus}</Text>
          <Link href="/my-bookings" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View My Bookings</Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(300)}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={styles.button} onPress={handleBook} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? "Booking..." : "Confirm Booking"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
