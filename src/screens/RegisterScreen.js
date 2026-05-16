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
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { registerUser } from '../api/api';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    school: '',
    address: '',
    whatsapp_no: '',
    grade: '',
    email: '',
    password: '',
    c_password: '',
  });

  const set = (key, val) => setForm({ ...form, [key]: val });

  const nextStep = () => {
    if (step === 1) {
      if (!form.fname.trim() || !form.lname.trim()) {
        return Alert.alert('Enter your first and last name');
      }
      if (!form.grade) return Alert.alert('Please select a grade');
    }
    if (step === 2) {
      if (
        !form.school.trim() ||
        !form.address.trim() ||
        !form.whatsapp_no.trim()
      )
        return Alert.alert('Fill all fields');
    }
    setStep(step + 1);
  };

  const handleRegister = async () => {
    if (!form.grade) return Alert.alert('Please select a grade');
    if (!form.email.trim()) return Alert.alert('Enter your email');
    if (form.password.length < 6)
      return Alert.alert('Password must be at least 6 characters');
    if (form.password !== form.c_password)
      return Alert.alert('Passwords do not match');

    setLoading(true);
    try {
      const res = await registerUser(form);
      if (res.success) {
        Alert.alert('Success', 'Registered! Please log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Registration failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setLoading(false);
  };

  const grades = ['6', '7', '8', '9', '10', '11'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={{
            uri: 'https://ik.imagekit.io/bathila/susanthabandara_com_indexPg/logo_croped_-m3LOejv-.webp?ik-sdk-version=javascript-1.4.3&updatedAt=1663696508876',
          }}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>susanthabandara.com</Text>

        <View style={styles.steps}>
          {[1, 2, 3].map(s => (
            <View
              key={s}
              style={[styles.stepDot, step >= s && styles.stepDotActive]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step {step} of 3</Text>

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={form.fname}
              onChangeText={v => set('fname', v)}
            />
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={form.lname}
              onChangeText={v => set('lname', v)}
            />
            <Text style={styles.label}>Select Grade</Text>
            <View style={styles.gradeRow}>
              {grades.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.gradeBtn,
                    form.grade === g && styles.gradeBtnActive,
                  ]}
                  onPress={() => set('grade', g)}
                >
                  <Text
                    style={[
                      styles.gradeTxt,
                      form.grade === g && styles.gradeTxtActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.label}>School</Text>
            <TextInput
              style={styles.input}
              value={form.school}
              onChangeText={v => set('school', v)}
            />
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={v => set('address', v)}
            />
            <Text style={styles.label}>WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              value={form.whatsapp_no}
              onChangeText={v => set('whatsapp_no', v.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.subtitle}>
              ඔබගේ සත්‍ය Google Email එකෙහි Email/Password අවශ්‍ය නැත. මෙම
              පද්ධතිය සඳහා මතක තබා ගැනීමට පහසු Email/Username එකක් සහ Password
              එකක් අතුලත් කරන්න. ( Space ඇතුලත් නොකරන්න )
            </Text>

            <Text style={styles.label}>Username/Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={v => set('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.label}>Password (min 6 characters)</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={v => set('password', v)}
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={form.c_password}
              onChangeText={v => set('c_password', v)}
            />
          </View>
        )}

        {step < 3 ? (
          <TouchableOpacity style={styles.button} onPress={nextStep}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        )}

        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(step - 1)}>
            <Text style={styles.link}>← Previous</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already registered? Log In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#f5f5f5' },
  logo: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#e05555',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ccc' },
  stepDotActive: { backgroundColor: '#5cb85c' },
  stepLabel: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  label: { fontSize: 13, color: '#555', fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  gradeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  gradeBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  gradeBtnActive: { backgroundColor: '#5cb85c', borderColor: '#5cb85c' },
  gradeTxt: { fontSize: 15, color: '#333' },
  gradeTxtActive: { color: '#fff', fontWeight: 'bold' },
  button: {
    backgroundColor: '#5cb85c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#5cb85c', fontSize: 14, marginTop: 10 },
});
