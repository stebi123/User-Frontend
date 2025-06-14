import { Stack } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Platform, Text, View } from 'react-native';

// Define types for the stack navigator
type AuthStackParamList = {
  login: undefined;
  register: undefined;
};

export default function AuthLayout() {
  const context = useTheme();
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  const { isDark } = context;

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide header for Login and Register screens
        // Animation for screen transitions
        animation: 'slide_from_right',
        // Disable gesture on Login screen (entry point)
        gestureEnabled: true,
        headerStyle: {
        
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
          borderBottomColor: isDark ? '#333' : '#eee',
          ...(Platform.OS === 'web'
            ? {
                boxShadow: isDark ? 'none' : '0px 2px 4px rgba(0, 0, 0, 0.1)',
              }
            : {
                shadowColor: isDark ? 'transparent' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.1,
                shadowRadius: 4,
                elevation: 2,
              }),
        },
        headerTintColor: isDark ? '#fff' : '#333',
        headerTitle: (props) => (
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                color: isDark ? '#fff' : '#333',
                fontSize: 20,
                fontWeight: 'bold',
              }}
            >
              {props.children}
            </Text>
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="login"
        options={{
            headerShown: 
            false, // Hide header for Login screen
          title: 'Login',
          // Disable back gesture since this is the entry point for unauthenticated users
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
            headerShown: false,
          title: 'Register',
          // Allow back gesture to return to Login
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
