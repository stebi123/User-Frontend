import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

type RegisterResponse = {
  message: string;
};

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>(''); // Explicitly initialize as empty string
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const router = useRouter();

  const handleRegister = async () => {
    setMessage(null);

    // Log raw state for debugging
    console.log('Raw state:', { username, email, password });

    // Enhanced validation
    if (!username || !username.trim() || !email || !email.trim() || !password || !password.trim()) {
      setMessage({ text: 'Please fill in all required fields', isError: true });
      console.log('Validation failed: Missing required fields');
      return;
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setMessage({ text: 'Username must be between 3 and 20 characters', isError: true });
      console.log('Validation failed: Invalid username length');
      return;
    }

    if (password.trim().length < 6 || password.trim().length > 40) {
      setMessage({ text: 'Password must be between 6 and 40 characters', isError: true });
      console.log('Validation failed: Invalid password length');
      return;
    }

    // Prepare and log payload
    const payload = { username: trimmedUsername, email: email.trim(), password: password.trim() };
    console.log('Register payload:', payload);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const data: RegisterResponse = await response.json();

      if (response.ok) {
        setMessage({ text: 'Registration successful! Redirecting to login...', isError: false });
        setTimeout(() => {
          router.push('/auth/Login');
        }, 1500);
      } else {
        setMessage({ text: data.message || 'Registration failed', isError: true });
        console.log('Response error:', data.message);
      }
    } catch (error) {
      setMessage({ text: 'Something went wrong. Please try again.', isError: true });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username (3-20 characters)"
        value={username}
        onChangeText={(text) => setUsername(text || '')}
        autoCapitalize="none"
        placeholderTextColor="#999"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text || '')}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (6-40 characters)"
        value={password}
        onChangeText={(text) => setPassword(text || '')}
        secureTextEntry
        placeholderTextColor="#999"
        editable={!loading}
      />
      {message && (
        <Text style={[styles.message, { color: message.isError ? '#ff4d4d' : '#4caf50' }]}>
          {message.text}
        </Text>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#3478f6" />
      ) : (
        <>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/auth/Login')}
            disabled={loading}
          >
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

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
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    color: '#000',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#3478f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a1c2ff',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#3478f6',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default Register;
