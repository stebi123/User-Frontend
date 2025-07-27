import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login, loginAsGuest } = useAuth(); // Include guest login

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Login failed');
      }

      const data = await response.json();
      if (!data.accessToken) throw new Error('No token received');

      await login(data.accessToken, {
        id: data.id,
        username: data.username,
        email: data.email,
      });

      router.replace('/HomePage');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    await loginAsGuest();
    router.replace('/HomePage'); // Redirect guest to home page too
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#999"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#3478f6" />
      ) : (
        <>
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/auth/Register')}
            style={styles.registerBtn}
          >
            <Text style={styles.registerText}>
              Don’t have an account? Register
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGuestLogin} style={styles.guestBtn}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Login;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    color: '#000',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#3478f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registerBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerText: {
    color: '#3478f6',
    fontWeight: '500',
  },
  guestBtn: {
    marginTop: 25,
    padding: 12,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  guestText: {
    color: '#333',
    fontWeight: '600',
  },
});
