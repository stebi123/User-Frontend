import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean; // ✅
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        const storedUser = await AsyncStorage.getItem("authUser");
        const guestStatus = await AsyncStorage.getItem("isGuest");

        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
        setIsGuest(guestStatus === "true");
      } catch (err) {
        console.error("Failed to load auth info:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setIsGuest(false);
    await AsyncStorage.setItem("authToken", newToken);
    await AsyncStorage.setItem("authUser", JSON.stringify(userData));
    await AsyncStorage.setItem("isGuest", "false");
  };

  const loginAsGuest = async () => {
    await AsyncStorage.multiRemove(["authToken", "authUser"]);
    setToken(null);
    setUser(null);
    setIsGuest(true);
    await AsyncStorage.setItem("isGuest", "true");
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["authToken", "authUser", "isGuest"]);
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

const value: AuthContextType = {
  isLoggedIn: !!token || isGuest,
  isGuest,
  token,
  user,
  login,
  loginAsGuest,
  logout,
  loading, // ✅ include this
};


  if (loading) return null;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
