// contexts/ThemeStyles.ts
import { StyleSheet } from "react-native";

export const makeStyles = (isDark: boolean) => {
  const colors = isDark ? {
    background: '#121212',
    text: '#ffffff',
    cardBackground: '#1e1e1e',
    border: '#333333',
    primary: '#BB86FC',
    secondary: '#03DAC6',
    placeholder: '#888888',
  } : {
    background: '#ffffff',
    text: '#000000',
    cardBackground: '#f8f8f8',
    border: '#e0e0e0',
    primary: '#6200EE',
    secondary: '#03DAC6',
    placeholder: '#666666',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      opacity: 0.8,
      marginTop: 4,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginVertical: 16,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      color: colors.text,
    },
    searchIcon: {
      marginRight: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 16,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      width: '48%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
    },
    seeAllText: {
      color: colors.primary,
    },
    venueCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      padding: 12,
      marginRight: 12,
      width: 200,
      marginBottom: 16,
    },
    venueImage: {
      width: '100%',
      height: 120,
      borderRadius: 4,
      marginBottom: 8,
    },
    venueName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    venueDetails: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.8,
      marginBottom: 4,
    },
    venueRating: {
      color: colors.secondary,
      fontWeight: 'bold',
    },
    carousel: {
      marginBottom: 16,
    },
    eventList: {
      marginBottom: 16,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 24,
    },
  linkText: {
    color: colors.primary,
  },
})}