import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
} from 'react-native';
import {loginUser} from '../api/api';
import {useAuth} from '../context/AuthContext';

export default function LoginScreen({navigation}) {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        await login(res.user);
      } else {
        Alert.alert('Error', res.message || 'Login failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Susantha Bandara</Text>
      <Text style={styles.subtitle}>Geography | Civics | Health | History</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>New student? Register here</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f5f5f5'},
  title: {fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#e05555', marginBottom: 6},
  subtitle: {fontSize: 14, textAlign: 'center', color: '#888', marginBottom: 40},
  input: {backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: '#ddd'},
  button: {backgroundColor: '#5cb85c', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  link: {textAlign: 'center', color: '#5cb85c', fontSize: 14},
});