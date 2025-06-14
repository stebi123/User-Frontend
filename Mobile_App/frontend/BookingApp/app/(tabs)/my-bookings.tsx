import { Link, Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button } from "@react-navigation/elements";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    bookingCard: {
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      marginBottom: 15,
      padding: 15,
      elevation: 2,
      shadowColor: isDark ? "transparent" : "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: 4,
    },
    bookingTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#fff" : "#333",
      marginBottom: 5,
    },
    bookingDetails: {
      fontSize: 14,
      color: isDark ? "#ccc" : "#666",
      marginBottom: 5,
    },
    statusConfirmed: {
      fontSize: 14,
      color: "#2ecc71",
      marginBottom: 5,
    },
    statusPending: {
      fontSize: 14,
      color: "#f39c12",
      marginBottom: 5,
    },
    statusCancelled: {
      fontSize: 14,
      color: "#e74c3c",
      marginBottom: 5,
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginTop: 20,
    },
  });

interface Booking {
  id: number;
  venueId: number;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function MyBookings() {
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = await AsyncStorage.getItem("authUser");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user?.email) {
          throw new Error("User email not found");
        }

        const response = await fetch(`http://localhost:8080/api/bookings/user?email=${user.email}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        setBookings(data.filter((b: Booking) => b.status !== "Cancelled"));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Unable to load bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const isBookingPast = (booking: Booking) => {
    const currentDateTime = new Date();
    const bookingEndDateTime = new Date(`${booking.date}T${booking.endTime}:00`);
    return bookingEndDateTime < currentDateTime;
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
      );
    } catch (err) {
      Alert.alert("Error", "Unable to cancel booking. Please try again later.");
      console.error("Error cancelling booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isPast = isBookingPast(item);
    const statusStyle =
      item.status === "Confirmed"
        ? styles.statusConfirmed
        : item.status === "Pending"
        ? styles.statusPending
        : styles.statusCancelled;

    return (
      <Animated.View entering={FadeInDown}>
        <Link href={`/venue-details/${item.id}`} asChild>
          <TouchableOpacity style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>{item.venueName}</Text>
            <Text style={styles.bookingDetails}>Date: {item.date}</Text>
            <Text style={styles.bookingDetails}>Start Time: {item.startTime}</Text>
            <Text style={styles.bookingDetails}>End Time: {item.endTime}</Text>
            <Text style={statusStyle}>
              Status: {item.status} {isPast ? "(Past)" : ""}
            </Text>
            <Button
              title="Cancel Booking"
              color="red"
              onPress={() => cancelBooking(item.id)}
            />
          </TouchableOpacity>
        </Link>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen />
      {loading ? (
        <ActivityIndicator size="large" color={isDark ? "#5a9cff" : "#3478f6"} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : bookings.length > 0 ? (
        <>
          <Animated.View entering={FadeInDown}>
            <Text style={styles.title}>My Bookings</Text>
          </Animated.View>
          <FlatList
            data={bookings}
            keyExtractor={(item) => `booking-${item.id}`}
            renderItem={renderBookingItem}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <Animated.View entering={FadeInDown}>
          <Text style={styles.errorText}>No bookings found.</Text>
        </Animated.View>
      )}
    </View>
  );
}
