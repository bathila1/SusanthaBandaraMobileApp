import { updateProfile } from '../api/api';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const grades = ['6', '7', '8', '9', '10', '11'];

  const { user, login, logout } = useAuth();
  if (!user) return null;

  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState(String(user.grade));
  const [school, setSchool] = useState(user.school || '');
  const [whatsapp, setWhatsapp] = useState(String(user.whatsapp_no || ''));
  const [address, setAddress] = useState(user.address || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !grade)
      return Alert.alert('Error', 'Name and grade are required');
    setLoading(true);
    try {
      const res = await updateProfile({
        user_id: user.id,
        name,
        grade,
        school,
        whatsapp_no: whatsapp,
        address,
      });
      if (res.success) {
        await login({
          ...user,
          name,
          grade,
          school,
          whatsapp_no: whatsapp,
          address,
        });
        Alert.alert('Success', 'Profile updated');
        navigation.goBack();
      } else {
        Alert.alert('Error', res.message || 'Update failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Select Grade</Text>
        <View style={styles.gradeRow}>
          {grades.map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.gradeBtn, grade === g && styles.gradeBtnActive]}
              onPress={() => setGrade(g)}
            >
              <Text
                style={[styles.gradeTxt, grade === g && styles.gradeTxtActive]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>School</Text>
        <TextInput
          style={styles.input}
          value={school}
          onChangeText={setSchool}
        />

        <Text style={styles.label}>WhatsApp No</Text>
        <TextInput
          style={styles.input}
          value={whatsapp}
          onChangeText={v => setWhatsapp(v.replace(/[^0-9]/g, ''))}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.readOnly}>{user.email}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f5f5f5' },
  back: { marginBottom: 16 },
  backText: { color: '#5cb85c', fontSize: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  label: { fontSize: 13, color: '#888', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  readOnly: { fontSize: 15, color: '#333', paddingVertical: 8 },
  button: {
    backgroundColor: '#5cb85c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  gradeBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#f9f9f9',
  },
  gradeBtnActive: { backgroundColor: '#5cb85c', borderColor: '#5cb85c' },
  gradeTxt: { fontSize: 15, color: '#333' },
  gradeTxtActive: { color: '#fff', fontWeight: 'bold' },

  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#d9534f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: { color: '#d9534f', fontWeight: 'bold', fontSize: 16 },
});
