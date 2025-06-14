import { Link, Stack } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useVenues } from "../hooks/useVenues";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";





const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#555",
      marginBottom: 20,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      marginHorizontal: 20,
      paddingHorizontal: 10,
      elevation: Platform.OS === "android" ? 2 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "none" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 4,
          }),
      marginBottom: 20,
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
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 20,
      marginBottom: 20,
    },
    button: {
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      flex: 1,
      alignItems: "center",
      marginHorizontal: 5,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 20,
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#fff" : "#333",
    },
    seeAllText: {
      fontSize: 14,
      color: isDark ? "#5a9cff" : "#3478f6",
      fontWeight: "500",
    },
    carousel: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    eventList: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    venueCard: {
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 10,
      marginRight: 15,
      width: 200,
      elevation: Platform.OS === "android" ? 2 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "none" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 4,
          }),
      overflow: "hidden",
    },
    venueImage: {
      width: "100%",
      height: 100,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      backgroundColor: isDark ? "#444" : "#eee",
    },
    venueName: {
      fontSize: 16,
      fontWeight: "600",
      padding: 10,
      color: isDark ? "#fff" : "#333",
    },
    venueDetails: {
      fontSize: 12,
      color: isDark ? "#ccc" : "#666",
      paddingHorizontal: 10,
      marginBottom: 5,
    },
    venueRating: {
      fontSize: 12,
      color: "#f39c12",
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    footer: {
      alignItems: "center",
      marginVertical: 30,
    },
    linkText: {
      color: isDark ? "#5a9cff" : "#3478f6",
      fontSize: 14,
      textDecorationLine: "underline",
      marginVertical: 5,
    },
    bannerImage: {
      width: Dimensions.get("window").width - 32,
      height: 200,
      resizeMode: "cover",
      borderRadius: 8,
      marginHorizontal: 12,
    },
    carouselContainer: {
      paddingVertical: 16,
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginVertical: 20,
    },
  });

interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  type: string;
  imageUrl: string; // Optional for fallback
}

export default function HomePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const { isDark } = useTheme() || { isDark: false };
  const styles = useMemo(() => makeStyles(isDark), [isDark]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const bannerRef = useRef<FlatList>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { featuredVenues, turfEvents, auditoriumEvents, otherEvents, loading, error } = useVenues(); // Destructure all categories

  const images = [
    { id: "banner1", uri: "https://i.pinimg.com/736x/97/ed/3f/97ed3f1f208ef980b34d0413b9fb9e57.jpg", venueId: "1" }, // Updated to match backend ID for Green Field Football Turf
    { id: "banner2", uri: "https://tse3.mm.bing.net/th?id=OIP.n8uBd_RT-zhdHgUfIosiWgHaFj&pid=Api&P=0&h=180", venueId: "2" }, // Updated to match backend ID for Grand Convention Hall
    { id: "banner3", uri: "https://via.placeholder.com/600x200.png?text=Banner+3" },
    { id: "banner4", uri: "https://via.placeholder.com/600x200.png?text=Banner+4" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        bannerRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const onScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    console.warn("Scroll to index failed:", info);
    bannerRef.current?.scrollToOffset({
      offset: info.index * (Dimensions.get("window").width - 16),
      animated: true,
    });
  };

  const renderBannerItem = ({ item }: { item: typeof images[0] }) => (
    <Link href={item.venueId ? `/venue-details/${item.venueId}` : "#"} asChild>
      <TouchableOpacity
        accessibilityLabel={`Banner ${item.id} ${item.venueId ? "navigates to venue details" : "not clickable"}`}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.bannerImage}
          resizeMode="cover"
          onError={(e) => console.warn(`Failed to load banner image: ${item.uri}`, e)}
        />
      </TouchableOpacity>
    </Link>
  );

  const renderVenueItem = ({ item }: { item: Venue }) => (
    <Animated.View entering={FadeInDown}>
      <Link href={`/venue-details/${item.id}`} asChild>
        <TouchableOpacity
          style={styles.venueCard}
          accessibilityLabel={`View details for ${item.name}`}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.venueImage}
            resizeMode="cover"
            onError={(e) => console.warn(`Failed to load image`, e)}
          />
          <Text style={styles.venueName}>{item.name}</Text>
          <Text style={styles.venueDetails}>
            {item.type} • {item.location}
          </Text>
          <Text style={styles.venueRating}>⭐ 4.5</Text> {/* Hardcoded rating for now */}
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Stack.Screen options={{ title: "Home" }} />

      <FlatList
        ref={bannerRef}
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderBannerItem}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={Dimensions.get("window").width - 16}
        decelerationRate="fast"
        onScrollToIndexFailed={onScrollToIndexFailed}
      />

      <Animated.View entering={FadeInDown} style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.username} 👋</Text>
        <Text style={styles.subtitle}>Ready to book your next slot?</Text>
      </Animated.View>

      {/* <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={isDark ? "#ccc" : "#666"}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for turfs, events, auditoriums..."
          placeholderTextColor={isDark ? "#999" : "#666"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible
          accessibilityLabel="Search venues and events"
        />
      </Animated.View> */}

      <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonContainer}>
        <Link href="/Search" asChild>
          <TouchableOpacity style={styles.button} accessibilityLabel="Book a slot">
            <Text style={styles.buttonText}>Book a Slot</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/my-bookings" asChild>
          <TouchableOpacity style={styles.button} accessibilityLabel="View my bookings">
            <Text style={styles.buttonText}>My Bookings</Text>
          </TouchableOpacity>
        </Link>
        {/* <Link href="/admin" asChild>
          <TouchableOpacity style={styles.button} accessibilityLabel="Admin dashboard">
            <Text style={styles.buttonText}>Admin</Text>
          </TouchableOpacity>
        </Link>  */}
      </Animated.View>

      {loading ? (
        <ActivityIndicator size="large" color={isDark ? "#5a9cff" : "#3478f6"} style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Venues</Text>
            <Link href="/featured" asChild>
              <TouchableOpacity accessibilityLabel="See all featured venues">
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
          {featuredVenues.length > 0 ? (
            <FlatList
              data={featuredVenues}
              keyExtractor={(item) => `featured-${item.id}`}
              renderItem={renderVenueItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            />
          ) : (
            <Text style={styles.errorText}>No featured venues available.</Text>
          )}

          <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Turf Events</Text>
            <Link href="/events/turfs" asChild>
              <TouchableOpacity accessibilityLabel="See all turf events">
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
          {turfEvents.length > 0 ? (
            <FlatList
              data={turfEvents}
              keyExtractor={(item) => `turf-${item.id}`}
              renderItem={renderVenueItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.eventList}
            />
          ) : (
            <Text style={styles.errorText}>No turf events available.</Text>
          )}

          <Animated.View entering={FadeInDown.delay(500)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Auditorium Events</Text>
            <Link href="/events/auditoriums" asChild>
              <TouchableOpacity accessibilityLabel="See all auditorium events">
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
          {auditoriumEvents.length > 0 ? (
            <FlatList
              data={auditoriumEvents}
              keyExtractor={(item) => `auditorium-${item.id}`}
              renderItem={renderVenueItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.eventList}
            />
          ) : (
            <Text style={styles.errorText}>No auditorium events available.</Text>
          )}

          <Animated.View entering={FadeInDown.delay(600)} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Other Events</Text>
            <Link href="/events/other-events" asChild>
              <TouchableOpacity accessibilityLabel="See all other events">
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
          {otherEvents.length > 0 ? (
            <FlatList
              data={otherEvents}
              keyExtractor={(item) => `other-${item.id}`}
              renderItem={renderVenueItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.eventList}
            />
          ) : (
            <Text style={styles.errorText}>No other events available.</Text>
          )}
        </>
      )}

      {/* <Animated.View entering={FadeInDown.delay(700)} style={styles.footer}>
        <Link href="/explore" asChild>
          <TouchableOpacity accessibilityLabel="Explore more events">
            <Text style={styles.linkText}>Explore More Events</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/profile" asChild>
          <TouchableOpacity accessibilityLabel="View my profile">
            <Text style={styles.linkText}>My Profile</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View> */}
    </ScrollView>
  );
}
