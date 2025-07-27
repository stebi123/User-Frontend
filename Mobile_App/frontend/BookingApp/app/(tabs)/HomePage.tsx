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
  Modal,
} from "react-native";
import { useState, useRef, useEffect, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons"; // Keep this for icons
import { useTheme } from "../contexts/ThemeContext";
import { useVenues } from "../hooks/useVenues";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "../contexts/AuthContext";

// Define a common maximum content width for consistent alignment
const MAX_CONTENT_WIDTH = 1440; // Example max width

// Define a placeholder for user profile image
const USER_PROFILE_PLACEHOLDER = "https://via.placeholder.com/40";

// --- Stylesheet ---
const makeStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
    },
    // New centralized content container
    contentWrapper: {
      width: "100%",
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: "center",
      paddingHorizontal: 16, // Consistent padding
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingHorizontal: 0, // Handled by contentWrapper
      marginBottom: 20,
    },
    greetingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between", // To place profile image on right
      marginBottom: 20,
    },
    greetingText: {
      fontSize: 26,
      fontWeight: "700", // Bolder for modern feel
      color: isDark ? "#fff" : "#333",
    },
    userProfileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "#444" : "#e0e0e0",
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#ccc" : "#555",
      marginBottom: 20,
      fontFamily: "Inter-Regular", // Placeholder for custom font
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 12, // More rounded corners
      paddingHorizontal: 15, // Increased padding
      elevation: Platform.OS === "android" ? 4 : 0, // Stronger shadow
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.1)", // More prominent shadow for web
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 4 }, // Stronger shadow
            shadowOpacity: isDark ? 0 : 0.15,
            shadowRadius: 8,
          }),
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 14, // Increased padding
      color: isDark ? "#fff" : "#333",
      fontFamily: "Inter-Regular", // Placeholder
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      // marginHorizontal: 20, // Handled by contentWrapper
      marginBottom: 20,
      backgroundColor: isDark ? "#282828" : "#e9ecef", // Soft background for tab bar
      borderRadius: 12,
      padding: 6, // Padding inside the filter container
    },
    filterButton: {
      backgroundColor: "transparent", // No default background
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10, // Slightly less rounded than container
      flex: 1,
      alignItems: "center",
      marginHorizontal: 3, // Smaller margin
      justifyContent: "center",
    },
    activeFilterButton: {
      backgroundColor: isDark ? "#5a9cff" : "#3478f6", // Strong primary accent
      // borderColor: isDark ? "#5a9cff" : "#3478f6", // No border needed if background is solid
      elevation: Platform.OS === "android" ? 3 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "0px 2px 4px rgba(0, 0, 0, 0.2)" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0 : 0.1,
            shadowRadius: 4,
          }),
    },
    filterButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    filterText: {
      color: isDark ? "#ccc" : "#666",
      fontSize: 14,
      fontWeight: "500",
      fontFamily: "Inter-Medium", // Placeholder
      marginLeft: 5, // Space between icon and text
    },
    activeFilterText: {
      color: "#fff",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold", // Placeholder
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // marginHorizontal: 20, // Handled by contentWrapper
      marginTop: 30, // More space above sections
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 22, // Slightly larger
      fontWeight: "700",
      color: isDark ? "#fff" : "#333",
      fontFamily: "Inter-Bold", // Placeholder
    },
    seeAllText: {
      fontSize: 15, // Slightly larger
      color: isDark ? "#5a9cff" : "#3478f6",
      fontWeight: "600",
      fontFamily: "Inter-SemiBold", // Placeholder
    },
    carousel: {
      // marginHorizontal: 20, // Handled by contentWrapper's padding
      marginBottom: 20,
      paddingHorizontal: 0, // Ensure no extra padding
    },
    eventList: {
      // marginHorizontal: 20, // Handled by contentWrapper's padding
      marginBottom: 20,
      paddingHorizontal: 0, // Ensure no extra padding
    },
    venueCard: {
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 16, // More rounded
      marginRight: 15,
      width: 200,
      elevation: Platform.OS === "android" ? 4 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out", // Hover effect
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0 : 0.15,
            shadowRadius: 8,
          }),
      overflow: "hidden",
    },
    venueImage: {
      width: "100%",
      height: 120, // Slightly taller images
      borderTopLeftRadius: 16, // Match card border
      borderTopRightRadius: 16, // Match card border
      backgroundColor: isDark ? "#444" : "#eee",
    },
    venueName: {
      fontSize: 18, // Larger font
      fontWeight: "700",
      padding: 12, // Increased padding
      paddingBottom: 4,
      color: isDark ? "#fff" : "#333",
      fontFamily: "Inter-Bold", // Placeholder
    },
    venueDetails: {
      fontSize: 13,
      color: isDark ? "#ccc" : "#666",
      paddingHorizontal: 12,
      marginBottom: 8,
      fontFamily: "Inter-Regular", // Placeholder
    },
    venueRating: {
      fontSize: 13,
      color: "#f39c12",
      paddingHorizontal: 12,
      paddingBottom: 12,
      fontFamily: "Inter-Medium", // Placeholder
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
      width: Dimensions.get("window").width - 32, // Adjusted for contentWrapper padding
      height: 200,
      resizeMode: "cover",
      borderRadius: 12, // Consistent with other cards
      marginHorizontal: 8, // Adjusted for visual balance
    },
    carouselContainer: {
      paddingVertical: 16,
      paddingHorizontal: 8, // Add padding to the FlatList itself
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
      marginVertical: 20,
      fontFamily: "Inter-Regular", // Placeholder
    },
    // New styles for filtered view
    filteredHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      // paddingHorizontal: 20, // Handled by contentWrapper
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#e9ecef",
    },
    filteredTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
      fontFamily: "Inter-Bold", // Placeholder
    },
    hamburgerButton: {
      padding: 8,
    },
    hamburgerLine: {
      width: 25,
      height: 3,
      backgroundColor: isDark ? "#fff" : "#333",
      marginVertical: 2,
      borderRadius: 2,
    },
    gridContainer: {
      flex: 1,
      paddingHorizontal: 0, // Handled by contentWrapper
    },
    gridContentContainer: {
      paddingVertical: 10,
      justifyContent: "space-between", // Distribute items evenly
      paddingHorizontal: 6, // Padding for items within the grid
    },
    gridVenueCard: {
      backgroundColor: isDark ? "#333" : "#fff",
      borderRadius: 16, // More rounded
      margin: 8, // Adjusted margin for grid
      flex: 1,
      maxWidth: (Dimensions.get("window").width - 32 - 32) / 2 - 8, // (screen_width - 2*contentWrapperPadding - 2*gridItemMargin)/2
      elevation: Platform.OS === "android" ? 4 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: isDark ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          }
        : {
            shadowColor: isDark ? "transparent" : "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0 : 0.15,
            shadowRadius: 8,
          }),
      overflow: "hidden",
    },
    gridVenueImage: {
      width: "100%",
      height: 120,
      backgroundColor: isDark ? "#444" : "#eee",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    gridVenueInfo: {
      padding: 12,
    },
    gridVenueName: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#fff" : "#333",
      marginBottom: 4,
      fontFamily: "Inter-Bold",
    },
    gridVenueDetails: {
      fontSize: 12,
      color: isDark ? "#ccc" : "#666",
      marginBottom: 8,
      fontFamily: "Inter-Regular",
    },
    gridVenueFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    gridVenueRating: {
      fontSize: 12,
      color: "#f39c12",
      fontFamily: "Inter-Medium",
    },
    gridVenuePrice: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? "#5a9cff" : "#3478f6",
      fontFamily: "Inter-SemiBold",
    },
    // Filter modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker overlay
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: isDark ? "#282828" : "#fff", // Consistent background
      borderRadius: 16, // More rounded
      padding: 25, // More padding
      width: "85%", // Slightly wider
      maxWidth: 350,
      elevation: Platform.OS === "android" ? 8 : 0,
      ...(Platform.OS === "web"
        ? {
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.25)",
          }
        : {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
          }),
    },
    modalTitle: {
      fontSize: 20, // Larger title
      fontWeight: "bold",
      color: isDark ? "#fff" : "#333",
      marginBottom: 20, // More space
      textAlign: "center",
      fontFamily: "Inter-Bold",
    },
    filterOption: {
      paddingVertical: 14, // More padding
      paddingHorizontal: 18,
      borderRadius: 10,
      marginVertical: 6, // More vertical space
      backgroundColor: isDark ? "#3e3e3e" : "#f1f3f5", // Subtle background
    },
    activeFilterOption: {
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
    },
    filterOptionText: {
      fontSize: 16,
      color: isDark ? "#fff" : "#333",
      textAlign: "center",
      fontFamily: "Inter-Medium",
    },
    activeFilterOptionText: {
      color: "#fff",
    },
    closeButton: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 25,
      backgroundColor: isDark ? "#5a9cff" : "#3478f6",
      borderRadius: 10,
      alignSelf: "center",
    },
    closeButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
  });

interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  price: number;
  type: string;
  imageUrl: string;
  image_url?: string;
  rating?: number;
}

type FilterType = "all" | "turf" | "auditorium" | "other";
type SortType = "none" | "price_low" | "price_high" | "rating" | "nearby" | "popular";

export default function HomePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const { isDark } = useTheme() || { isDark: false };
  const styles = useMemo(() => makeStyles(isDark), [isDark]);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSortFilter, setActiveSortFilter] = useState<SortType>("none");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const bannerRef = useRef<FlatList>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const { featuredVenues, turfEvents, auditoriumEvents, otherEvents, loading, error } = useVenues();

  // console.log("Turf events loaded:", turfEvents);
  
  const images = [
    {
      id: "banner1",
      uri: "https://i.pinimg.com/736x/97/ed/3f/97ed3f1f208ef980b34d0413b9fb9e57.jpg",
      venueId: "1",
    },
    {
      id: "banner2",
      uri: "https://tse3.mm.bing.net/th?id=OIP.n8uBd_RT-zhdHgUfIosiWgHaFj&pid=Api&P=0&h=180",
      venueId: "2",
    },
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
      offset: info.index * (Dimensions.get("window").width - 16), // Adjusted for banner width
      animated: true,
    });
  };

  // Function to apply sorting to venue data
  const applySorting = (venues: Venue[], sortType: SortType): Venue[] => {
    const sortedVenues = [...venues]; // Always create a shallow copy to avoid mutating the original array

    switch (sortType) {
      case "price_low":
        return sortedVenues.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price_high":
        return sortedVenues.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "rating":
      case "popular": // Popular uses rating as proxy
        return sortedVenues.sort((a, b) => {
          const ratingA = a.rating ?? 0;
          const ratingB = b.rating ?? 0;
          return ratingB - ratingA; // Descending order
        });
      case "nearby":
        // THIS IS A PLACEHOLDER.
        // To implement "nearby" sorting, you would need:
        // 1. User's current location (latitude, longitude).
        // 2. Each venue's latitude and longitude in your Venue interface/data.
        // 3. A function to calculate distance between two lat/lon points.
        console.warn("Nearby sorting is not yet implemented. Returning original order.");
        return sortedVenues; // For now, just return original order
      default:
        return sortedVenues; // If no matching sortType, return the original order
    }
  };
  const handleFilterSelect = (sortType: SortType) => {
    setActiveSortFilter(sortType);
    setShowFilterModal(false);
  };

  const renderBannerItem = ({ item }: { item: typeof images[0] }) => (
    <Link href={`/venue-details/${item.venueId}`} asChild>
      <TouchableOpacity
        accessibilityLabel={`Banner ${item.id} navigates to venue details`}
        style={{ width: Dimensions.get("window").width - 32, paddingHorizontal: 0 }} // Ensure banner fills its intended width
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
    <Animated.View entering={FadeInDown} style={styles.venueCard}>
      <Link href={`/venue-details/${item.id}`} asChild>
        <TouchableOpacity
          accessibilityLabel={`View details for ${item.name}`}
          // Add hover effects for web if applicable (requires react-native-web-hover or similar)
          // onMouseEnter={() => {}}
          // onMouseLeave={() => {}}
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
          <Text style={styles.venueRating}>
            {item.rating ? `⭐ ${item.rating.toFixed(1)}` : "No Rating"}
          </Text>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );

  const getFilteredContent = () => {
    let baseData: Venue[] = [];
    let title = "";
    let keyPrefix = "";

    switch (activeFilter) {
      case "turf":
        baseData = turfEvents.map((venue) => ({
          ...venue,
          imageUrl: venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
        }));
        title = "Turf Events";
        keyPrefix = "turf";
        break;
      case "auditorium":
        baseData = auditoriumEvents.map((venue) => ({
          ...venue,
          imageUrl: venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
        }));
        title = "Auditorium Events";
        keyPrefix = "auditorium";
        break;
      case "other":
        baseData = otherEvents.map((venue) => ({
          ...venue,
          imageUrl: venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
        }));
        title = "Other Events";
        keyPrefix = "other";
        break;
      default:
        return null;
    }

    // Apply sorting
    const sortedData = applySorting(baseData, activeSortFilter);

    return {
      title,
      data: sortedData,
      keyPrefix,
    };
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort & Filter Options</Text>

          <TouchableOpacity
            style={[
              styles.filterOption,
              activeSortFilter === "none" && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterSelect("none")}
          >
            <Text
              style={[
                styles.filterOptionText,
                activeSortFilter === "none" && styles.activeFilterOptionText,
              ]}
            >
              Default
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              activeSortFilter === "nearby" && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterSelect("nearby")}
          >
            <Text
              style={[
                styles.filterOptionText,
                activeSortFilter === "nearby" && styles.activeFilterOptionText,
              ]}
            >
              Nearby
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              activeSortFilter === "popular" && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterSelect("popular")}
          >
            <Text
              style={[
                styles.filterOptionText,
                activeSortFilter === "popular" && styles.activeFilterOptionText,
              ]}
            >
              Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              activeSortFilter === "price_low" && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterSelect("price_low")}
          >
            <Text
              style={[
                styles.filterOptionText,
                activeSortFilter === "price_low" && styles.activeFilterOptionText,
              ]}
            >
              Price: Low to High
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              activeSortFilter === "price_high" && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterSelect("price_high")}
          >
            <Text
              style={[
                styles.filterOptionText,
                activeSortFilter === "price_high" && styles.activeFilterOptionText,
              ]}
            >
              Price: High to Low
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterOption,
              activeSortFilter === "rating" && styles.activeFilterOption,
            ]}
            onPress={() => handleFilterSelect("rating")}
          >
            <Text
              style={[
                styles.filterOptionText,
                activeSortFilter === "rating" && styles.activeFilterOptionText,
              ]}
            >
              By Rating
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => setShowFilterModal(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFilteredView = () => {
    const filteredContent = getFilteredContent();
    if (!filteredContent) return null;

    return (
      <View style={{ flex: 1 }}>
        {/* Filtered Header with Hamburger Menu */}
        <View style={[styles.filteredHeader, { paddingHorizontal: 16 }]}>
          {" "}
          {/* Apply padding directly here */}
          <Text style={styles.filteredTitle}>{filteredContent.title}</Text>
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={() => setShowFilterModal(true)}
            accessibilityLabel="Open filter menu"
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
        </View>

        {/* Content Grid */}
        {filteredContent.data.length > 0 ? (
          <FlatList
            data={filteredContent.data}
            keyExtractor={(item) => `${filteredContent.keyPrefix}-${item.id}`}
            renderItem={({ item }) => (
              <Animated.View entering={FadeInDown} style={styles.gridVenueCard}>
                <Link href={`/venue-details/${item.id}`} asChild>
                  <TouchableOpacity accessibilityLabel={`View details for ${item.name}`}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.gridVenueImage}
                      resizeMode="cover"
                      onError={(e) => console.warn(`Failed to load image`, e)}
                    />
                    <View style={styles.gridVenueInfo}>
                      <Text style={styles.gridVenueName}>{item.name}</Text>
                      <Text style={styles.gridVenueDetails}>
                        {item.type} • {item.location}
                      </Text>
                      <View style={styles.gridVenueFooter}>
                        <Text style={styles.gridVenueRating}>
                          {item.rating ? `⭐ ${item.rating.toFixed(1)}` : "No Rating"}
                        </Text>
                        <Text style={styles.gridVenuePrice}>₹{item.price || 0}/hour</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            )}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            style={styles.gridContainer}
            contentContainerStyle={styles.gridContentContainer}
          />
        ) : (
          <Text style={styles.errorText}>No {filteredContent.title.toLowerCase()} available.</Text>
        )}

        {renderFilterModal()}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <Stack.Screen options={{ title: "Home" }} />

      <View style={styles.contentWrapper}>
        {" "}
        {/* Centralized container */}
        {activeFilter === "all" && (
          <FlatList
            ref={bannerRef}
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderBannerItem}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={Dimensions.get("window").width - 32} // Adjusted for padding
            decelerationRate="fast"
            onScrollToIndexFailed={onScrollToIndexFailed}
          />
        )}
        {activeFilter === "all" && (
          <Animated.View entering={FadeInDown} style={styles.header}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Welcome, {user?.username || "Guest"} 👋</Text>
              <Image source={{ uri: USER_PROFILE_PLACEHOLDER }} style={styles.userProfileImage} />
            </View>
            
            {/* Search Bar (kept in its original position for now) */}
            <View style={styles.searchContainer}>
              {/*<Ionicons
                name="search"
                size={20}
                color={isDark ? "#ccc" : "#666"}
                style={styles.searchIcon}
              />*/}
            
            </View>
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === "all" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("all")}
            accessibilityLabel="Show all events"
          >
            <View style={styles.filterButtonContent}>
              <Ionicons
                name="grid"
                size={18}
                color={
                  activeFilter === "all"
                    ? styles.activeFilterText.color
                    : styles.filterText.color
                }
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "all" && styles.activeFilterText,
                ]}
              >
                All Events
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, activeFilter === "turf" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("turf")}
            accessibilityLabel="Show turf events"
          >
            <View style={styles.filterButtonContent}>
              <Ionicons
                name="tennisball"
                size={18}
                color={
                  activeFilter === "turf"
                    ? styles.activeFilterText.color
                    : styles.filterText.color
                }
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "turf" && styles.activeFilterText,
                ]}
              >
                Turf
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "auditorium" && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter("auditorium")}
            accessibilityLabel="Show auditorium events"
          >
            <View style={styles.filterButtonContent}>
              <Ionicons
                name="mic-circle"
                size={18}
                color={
                  activeFilter === "auditorium"
                    ? styles.activeFilterText.color
                    : styles.filterText.color
                }
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "auditorium" && styles.activeFilterText,
                ]}
              >
                Auditorium
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, activeFilter === "other" && styles.activeFilterButton]}
            onPress={() => setActiveFilter("other")}
            accessibilityLabel="Show other events"
          >
            <View style={styles.filterButtonContent}>
              <Ionicons
                name="ellipsis-horizontal-circle"
                size={18}
                color={
                  activeFilter === "other"
                    ? styles.activeFilterText.color
                    : styles.filterText.color
                }
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === "other" && styles.activeFilterText,
                ]}
              >
                Other
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={isDark ? "#5a9cff" : "#3478f6"}
            style={{ marginTop: 20 }}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {activeFilter === "all" ? (
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
                    data={featuredVenues.map((venue) => ({
                      ...venue,
                      imageUrl:
                        venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
                    }))}
                    keyExtractor={(item) => `featured-${item.id}`}
                    renderItem={renderVenueItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.carousel}
                    contentContainerStyle={{ paddingHorizontal: 0 }} // ensure no extra padding from the list itself
                  />
                ) : (
                  <Text style={styles.errorText}>No featured venues available.</Text>
                )}

                <Animated.View entering={FadeInDown.delay(400)} style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Turf Events</Text>
                  <TouchableOpacity
                    onPress={() => setActiveFilter("turf")}
                    accessibilityLabel="See all turf events"
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </Animated.View>
                {turfEvents.length > 0 ? (
                  <FlatList
                    data={turfEvents.map((venue) => ({
                      ...venue,
                      imageUrl:
                        venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
                    }))}
                    keyExtractor={(item) => `turf-${item.id}`}
                    renderItem={renderVenueItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.eventList}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                  />
                ) : (
                  <Text style={styles.errorText}>No turf events available.</Text>
                )}

                <Animated.View entering={FadeInDown.delay(500)} style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Auditorium Events</Text>
                  <TouchableOpacity
                    onPress={() => setActiveFilter("auditorium")}
                    accessibilityLabel="See all auditorium events"
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </Animated.View>
                {auditoriumEvents.length > 0 ? (
                  <FlatList
                    data={auditoriumEvents.map((venue) => ({
                      ...venue,
                      imageUrl:
                        venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
                    }))}
                    keyExtractor={(item) => `auditorium-${item.id}`}
                    renderItem={renderVenueItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.eventList}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                  />
                ) : (
                  <Text style={styles.errorText}>No auditorium events available.</Text>
                )}

                <Animated.View entering={FadeInDown.delay(600)} style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Other Events</Text>
                  <TouchableOpacity
                    onPress={() => setActiveFilter("other")}
                    accessibilityLabel="See all other events"
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </Animated.View>
                {otherEvents.length > 0 ? (
                  <FlatList
                    data={otherEvents.map((venue) => ({
                      ...venue,
                      imageUrl:
                        venue.imageUrl || "https://via.placeholder.com/200x100.png?text=No+Image",
                    }))}
                    keyExtractor={(item) => `other-${item.id}`}
                    renderItem={renderVenueItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.eventList}
                    contentContainerStyle={{ paddingHorizontal: 0 }}
                  />
                ) : (
                  <Text style={styles.errorText}>No other events available.</Text>
                )}
              </>
            ) : (
              renderFilteredView()
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}