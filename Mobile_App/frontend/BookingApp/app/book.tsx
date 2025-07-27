import { Stack, useLocalSearchParams, Link } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "./contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "./contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "react-native-calendars";

const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#121212" : "#f5f5f5",
      padding: 20,
    },
    card: {
      backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      color: isDark ? "#fff" : "#1a1a1a",
      marginBottom: 10,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#ccc" : "#333",
      marginTop: 15,
      marginBottom: 8,
    },
    button: {
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 20,
      overflow: "hidden",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    errorText: {
      fontSize: 16,
      color: "#ff4d4d",
      textAlign: "center",
      marginVertical: 15,
    },
    successText: {
      fontSize: 16,
      color: "#4caf50",
      textAlign: "center",
      marginVertical: 15,
    },
    noSlotsText: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#666",
      textAlign: "center",
      marginVertical: 15,
    },
    slotButton: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 10,
    },
    venueInfo: {
      fontSize: 14,
      color: isDark ? "#ccc" : "#555",
      marginBottom: 5,
    },
    toggleCalendar: {
      padding: 10,
      borderRadius: 8,
      backgroundColor: isDark ? "#2a2a2a" : "#e0e0e0",
      marginBottom: 10,
    },
    toggleCalendarText: {
      textAlign: "center",
      fontWeight: "600",
      color: isDark ? "#fff" : "#333",
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

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function Book() {
  const { id } = useLocalSearchParams();
  const { isDark = false } = useTheme() || {};
  const styles = makeStyles(isDark);
  const { user, isGuest, loading: authLoading } = useAuth();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [date, setDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const primary = isDark ? "#5a9cff" : "#3478f6";
  const secondary = isDark ? "#3b6cd4" : "#2a5cc4";

  if (authLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Book Venue" }} />
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (!user && !isGuest) return null;

  if (isGuest) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Book Venue" }} />
        <Text style={styles.errorText}>Guests cannot book venues. Please sign in.</Text>
        <Link href="/auth/Login" asChild>
          <TouchableOpacity style={{ ...styles.button, marginTop: 20 }}>
            <LinearGradient
              colors={[primary, secondary]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const getNextThreeDays = () => {
    const today = new Date();
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  };

  const allowedDates = getNextThreeDays();

  useEffect(() => {
    setDate(allowedDates[0]);
  }, []);

  useEffect(() => {
    const fetchVenueAndSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        setTimeSlots([]);
        setSelectedSlot(null);

        const venueRes = await fetch(`http://localhost:8080/api/venues/${id}`);
        if (!venueRes.ok) throw new Error("Failed to fetch venue");
        setVenue(await venueRes.json());

        if (date) {
          setSlotLoading(true);
          const slotRes = await fetch(`http://localhost:8080/api/venues/${id}/slots?date=${date}`);
          if (!slotRes.ok) throw new Error("Failed to fetch slots");
          setTimeSlots(await slotRes.json());
        }
      } catch {
        setError("Failed to load venue or slots.");
      } finally {
        setLoading(false);
        setSlotLoading(false);
      }
    };
    fetchVenueAndSlots();
  }, [id, date]);

  const handleBook = async () => {
    if (!selectedSlot) return setError("Please select a time slot");

    try {
      setLoading(true);
      setError(null);
      setBookingStatus(null);

      const res = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: Number(id),
          userEmail: user?.email,
          date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          status: "Confirmed",
        }),
      });

      if (!res.ok) throw new Error("Booking failed");
      setBookingStatus("Booking confirmed! Check My Bookings.");
      Alert.alert("Success", "Booking confirmed!");
    } catch {
      setError("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter time slots based on current time for today's date
  const getFilteredTimeSlots = () => {
    const today = new Date().toISOString().split("T")[0];
    if (date !== today) return timeSlots.filter((s) => s.isAvailable);

    const now = new Date();
    const currentHour = now.getHours();
    const nextHour = currentHour + 1;
    const nextHourString = `${nextHour.toString().padStart(2, "0")}:00`;

    return timeSlots.filter(
      (s) => s.isAvailable && s.startTime >= nextHourString
    );
  };

  if (loading && !venue) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Book Venue" }} />
        <ActivityIndicator size="large" color={primary} />
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
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: `Book ${venue.name}` }} />

      <Animated.View entering={FadeInDown}>
        <View style={styles.card}>
          <Text style={styles.title}>{venue.name}</Text>
          <Text style={styles.venueInfo}>Location: {venue.location}</Text>
          <Text style={styles.venueInfo}>Type: {venue.type}</Text>
          <Text style={styles.venueInfo}>Capacity: {venue.capacity}</Text>
          <Text style={styles.venueInfo}>Price: ${venue.pricePerHour}/hour</Text>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.toggleCalendar}
        onPress={() => setShowCalendar((prev) => !prev)}
      >
        <Text style={styles.toggleCalendarText}>
          {showCalendar ? "Hide Calendar" : "Select Date"}
        </Text>
      </TouchableOpacity>

      {showCalendar && (
        <Calendar
          onDayPress={(day) => {
            if (allowedDates.includes(day.dateString)) {
              setDate(day.dateString);
              setShowCalendar(false);
            }
          }}
          markedDates={{
            [date]: { selected: true, selectedColor: primary },
          }}
          minDate={allowedDates[0]}
          maxDate={allowedDates[2]}
          theme={{
            calendarBackground: isDark ? "#121212" : "#fff",
            dayTextColor: isDark ? "#fff" : "#000",
            todayTextColor: "#00adf5",
            arrowColor: primary,
            monthTextColor: isDark ? "#fff" : "#000",
          }}
          style={{ borderRadius: 10, marginBottom: 15 }}
        />
      )}

      <Animated.View entering={FadeInDown.delay(200)}>
        <Text style={styles.label}>Available Time Slots</Text>
        {slotLoading ? (
          <ActivityIndicator size="small" color={primary} />
        ) : getFilteredTimeSlots().length === 0 ? (
          <Text style={styles.noSlotsText}>No available slots for this date.</Text>
        ) : (
          getFilteredTimeSlots().map((slot) => {
            const isSelected =
              selectedSlot?.startTime === slot.startTime &&
              selectedSlot?.endTime === slot.endTime;

            return (
              <TouchableOpacity
                key={`${slot.startTime}-${slot.endTime}`}
                onPress={() => setSelectedSlot(slot)}
                style={{
                  ...styles.slotButton,
                  backgroundColor: isSelected ? primary : isDark ? "#2a2a2a" : "#fff",
                  borderColor: isSelected ? primary : isDark ? "#444" : "#ddd",
                }}
              >
                <Text style={{ color: isSelected ? "#fff" : isDark ? "#ccc" : "#333" }}>
                  {slot.startTime} - {slot.endTime}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)}>
        {bookingStatus && <Text style={styles.successText}>{bookingStatus}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {bookingStatus ? (
          <Link href="/my-bookings" asChild>
            <TouchableOpacity style={styles.button}>
              <LinearGradient colors={[primary, secondary]} style={StyleSheet.absoluteFill} />
              <Text style={styles.buttonText}>View My Bookings</Text>
            </TouchableOpacity>
          </Link>
        ) : (
          <TouchableOpacity
            style={{
              ...styles.button,
              ...( !selectedSlot || slotLoading ? { opacity: 0.5 } : {} ),
            }}
            onPress={handleBook}
            disabled={loading || !selectedSlot || slotLoading}
          >
            <LinearGradient colors={[primary, secondary]} style={StyleSheet.absoluteFill} />
            <Text style={styles.buttonText}>
              {loading ? "Booking..." : "Confirm Booking"}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
}