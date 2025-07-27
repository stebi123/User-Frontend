import { Link, Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions
} from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

// Styling
const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      paddingTop: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: isDark ? "#fff" : "#1a1a1a",
    },
    filterContainer: {
      marginBottom: 20,
    },
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.05)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 2,
    },
    monthText: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#fff" : "#1a1a1a",
    },
    filterButton: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    filterButtonActive: {
      backgroundColor: isDark ? '#e74c3c' : '#e74c3c',
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#fff" : "#1a1a1a",
      marginLeft: 6,
    },
    filterButtonTextActive: {
      color: "#fff",
    },
    bookingCard: {
      backgroundColor: isDark ? '#2a2a2a' : '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.05)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 6,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    venueName: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#fff" : "#1a1a1a",
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "700",
    },
    cardBody: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    timeContainer: {
      flex: 1,
    },
    timeLabel: {
      fontSize: 12,
      color: isDark ? "#aaa" : "#666",
      marginBottom: 4,
    },
    timeValue: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#fff" : "#1a1a1a",
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      marginTop: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 6,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#888",
      textAlign: 'center',
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    errorText: {
      fontSize: 16,
      color: "#e74c3c",
      textAlign: 'center',
      marginTop: 16,
    },
    filterRow: {
      flexDirection: 'row',
      marginBottom: 12,
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

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MyBookings() {
  const { isDark } = useTheme() || { isDark: false };
  const styles = makeStyles(isDark);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    fetchAllBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, selectedMonth, selectedYear, showCancelled]);

  const getUserEmail = async () => {
    const storedUser = await AsyncStorage.getItem("authUser");
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user?.email) throw new Error("User email not found");
    return user.email;
  };

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const email = await getUserEmail();
      const response = await fetch(
        `http://localhost:8080/api/bookings/user?email=${email}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Unable to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8080/api/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await AsyncStorage.getItem('authToken')}`
          },
        }
      );
      if (!response.ok) throw new Error("Failed to cancel booking");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "Cancelled" } : b
        )
      );
    } catch (err) {
      Alert.alert("Error", "Unable to cancel booking. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getMonth() + 1 === selectedMonth &&
        bookingDate.getFullYear() === selectedYear
      );
    });

    if (!showCancelled) {
      filtered = filtered.filter(booking => booking.status !== "Cancelled");
    }

    setFilteredBookings(filtered);
  };

  const isBookingPast = (booking: Booking) => {
    const now = new Date();
    const bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);
    return bookingEnd < now;
  };

  const changeMonth = (increment: number) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return {
          backgroundColor: isDark ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)',
          color: "#2ecc71"
        };
      case "Pending":
        return {
          backgroundColor: isDark ? 'rgba(243, 156, 18, 0.2)' : 'rgba(243, 156, 18, 0.1)',
          color: "#f39c12"
        };
      case "Cancelled":
        return {
          backgroundColor: isDark ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)',
          color: "#e74c3c"
        };
      default:
        return {
          backgroundColor: isDark ? '#2a2a2a' : '#eee',
          color: isDark ? "#fff" : "#666"
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const isPast = isBookingPast(item);
    const statusStyle = getStatusStyle(item.status);
    const formattedDate = formatDate(item.date);

    return (
      <Animated.View entering={FadeInDown.delay(100)}>
        <View style={styles.bookingCard}>
          <View style={styles.cardHeader}>
            <Link
              href={{
                pathname: "/my-bookings",
                params: { bookingId: item.id, venueId: item.venueId },
              }}
              asChild
            >
              <TouchableOpacity style={{ flex: 1 }}>
                <Text style={styles.venueName} numberOfLines={1} ellipsizeMode="tail">
                  {item.venueName}
                </Text>
              </TouchableOpacity>
            </Link>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {item.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Date</Text>
              <Text style={styles.timeValue}>{formattedDate}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>From</Text>
              <Text style={styles.timeValue}>{item.startTime}</Text>
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>To</Text>
              <Text style={styles.timeValue}>{item.endTime}</Text>
            </View>
          </View>
          
          {item.status !== "Cancelled" && !isPast && (
            <TouchableOpacity
              onPress={() => cancelBooking(item.id)}
              style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)' }]}
            >
              <MaterialIcons name="cancel" size={18} color="#e74c3c" />
              <Text style={[styles.actionButtonText, { color: "#e74c3c" }]}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
          
          {isPast && (
            <View style={[styles.actionButton, { backgroundColor: isDark ? 'rgba(170, 170, 170, 0.2)' : 'rgba(170, 170, 170, 0.1)' }]}>
              <Feather name="clock" size={18} color={isDark ? "#aaa" : "#888"} />
              <Text style={[styles.actionButtonText, { color: isDark ? "#aaa" : "#888" }]}>Past Booking</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#5a9cff" : "#3478f6"}
          />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isDark ? '#2a2a2a' : '#eee', marginTop: 20 }]}
            onPress={fetchAllBookings}
          >
            <Feather name="refresh-cw" size={18} color={isDark ? "#fff" : "#1a1a1a"} />
            <Text style={[styles.actionButtonText, { color: isDark ? "#fff" : "#1a1a1a" }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.filterContainer}>
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Feather name="chevron-left" size={24} color={isDark ? "#fff" : "#1a1a1a"} />
              </TouchableOpacity>
              
              <Text style={styles.monthText}>
                {monthNames[selectedMonth - 1]} {selectedYear}
              </Text>
              
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Feather name="chevron-right" size={24} color={isDark ? "#fff" : "#1a1a1a"} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterRow}>
              <TouchableOpacity
                onPress={() => setShowCancelled(!showCancelled)}
                style={[
                  styles.filterButton,
                  showCancelled && styles.filterButtonActive
                ]}
              >
                <Feather 
                  name={showCancelled ? "eye-off" : "eye"} 
                  size={16} 
                  color={showCancelled ? "#fff" : isDark ? "#fff" : "#1a1a1a"} 
                />
                <Text style={[
                  styles.filterButtonText,
                  showCancelled && styles.filterButtonTextActive
                ]}>
                  {showCancelled ? "Hide Cancelled" : "Show Cancelled"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={48} color={isDark ? "#aaa" : "#888"} />
              <Text style={styles.emptyStateText}>
                No bookings found for {monthNames[selectedMonth - 1]} {selectedYear}
              </Text>
              <Text style={[styles.emptyStateText, { fontSize: 14 }]}>
                {showCancelled ? "Try showing active bookings" : "You're all caught up!"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredBookings}
              keyExtractor={(item) => `booking-${item.id}`}
              renderItem={renderBookingItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}