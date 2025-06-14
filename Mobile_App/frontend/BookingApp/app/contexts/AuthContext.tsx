import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define user shape
interface User {
  id: number;
  username: string;
  email: string;
}

// Define context shape
interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedUser = await AsyncStorage.getItem("authUser");

        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to load auth info:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // Save token + user on login
  const login = async (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    await AsyncStorage.setItem("authToken", newToken);
    await AsyncStorage.setItem("authUser", JSON.stringify(userData));
    await AsyncStorage.setItem("user", JSON.stringify({
  id: userData.id,
  username: userData.username,
  email: userData.email,
}));

  };

  // Remove token + user on logout
  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authUser");
  };

  const value: AuthContextType = {
    isLoggedIn: !!token,
    token,
    user,
    login,
    logout,
  };

  if (loading) return null; // or splash screen

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// Hook to use context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
