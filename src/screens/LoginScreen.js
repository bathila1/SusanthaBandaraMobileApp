import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Image,
  KeyboardAvoidingView, ScrollView, Platform,
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
      await login(res.user, res.access_token, res.refresh_token);
    } else {
      Alert.alert('Error', res.message || 'Login failed');
    }
  } catch (e) {
    Alert.alert('Error', 'Cannot connect to server');
  }
  setLoading(false);
};

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Image
          source={{uri: 'https://ik.imagekit.io/bathila/susanthabandara_com_indexPg/logo_croped_-m3LOejv-.webp?ik-sdk-version=javascript-1.4.3&updatedAt=1663696508876'}}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Susantha Bandara</Text>
        <Text style={styles.subtitle}>Geography | Civics | Health | History</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.buttonText}>Log In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>New student? Register here</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  logo: {width: 200, height: 200, alignSelf: 'center', marginBottom: 10},
  title: {fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#e05555', marginBottom: 6},
  subtitle: {fontSize: 14, textAlign: 'center', color: '#888', marginBottom: 30},
  label: {fontSize: 13, color: '#555', fontWeight: '600', marginBottom: 4},
  input: {backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 15, borderWidth: 1, borderColor: '#ddd'},
  button: {backgroundColor: '#5cb85c', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 20},
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  link: {textAlign: 'center', color: '#5cb85c', fontSize: 14},
});