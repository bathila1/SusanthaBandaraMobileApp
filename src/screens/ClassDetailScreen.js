import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Linking,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {submitPayslip, selectClass, getClassStatus} from '../api/api';
import {useAuth} from '../context/AuthContext';

export default function ClassDetailScreen({route, navigation}) {
  const {lesson} = route.params;
  const {user} = useAuth();

  const today = new Date().toISOString().split('T')[0];

  const [status, setStatus] = useState(lesson.student_status || null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [paidDate, setPaidDate] = useState(today);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await getClassStatus(user.id, lesson.meeting_id);
      if (res.success) {
        setStatus(res.data?.real_status || null);
      }
    } catch (e) {}
    setStatusLoading(false);
  };

  const isPaid = ['Paid', 'Free', 'Institute'].includes(status);
  const canJoin = ['Paid', 'Free', 'Institute', 'PostPay'].includes(status);

  const handleSelect = async () => {
    Alert.alert('Select Class', 'Select this class?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Select', onPress: async () => {
        setSelecting(true);
        try {
          const res = await selectClass(user.id, lesson.meeting_id);
          if (res.success) {
            setStatus('Pending');
            Alert.alert('Success', 'Class selected! Waiting for approval.');
          } else {
            Alert.alert('Error', res.message || 'Failed to select');
          }
        } catch (e) {
          Alert.alert('Error', 'Cannot connect to server');
        }
        setSelecting(false);
      }},
    ]);
  };

  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.7}, res => {
      if (res.assets) setImage(res.assets[0]);
    });
  };

  const handleUpload = async () => {
    if (!paidDate || !amount || !image)
      return Alert.alert('Error', 'Fill date, amount and choose a receipt image');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('meeting_id', lesson.meeting_id);
      formData.append('paid_date', paidDate);
      formData.append('paid_amount', amount);
      formData.append('payslip_text', notes);
      formData.append('payslip', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'payslip.jpg',
      });
      const res = await submitPayslip(formData);
      if (res.success) {
        Alert.alert('Success', 'Payslip uploaded! Waiting for approval.');
        setPaidDate(today); setAmount(''); setNotes(''); setImage(null);
      } else {
        Alert.alert('Error', res.message || 'Upload failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setUploading(false);
  };

  const videos = [
    {label: 'Geo Tutorial', url: lesson.tute1},
    {label: 'Paper', url: lesson.tute2},
    {label: 'Civic Tutorial', url: lesson.civic_tute3},
    {label: 'Health Tutorial', url: lesson.health_tute4},
    {label: 'History Tutorial', url: lesson.his_tute4},
  ].filter(v => v.url && v.url !== 'blank');

  const getStatusColor = () => {
    switch (status) {
      case 'Paid': return '#6f42c1';
      case 'Free': return '#5cb85c';
      case 'PostPay': return '#333';
      case 'Pending': return '#f0ad4e';
      case 'Denied': return '#d9534f';
      default: return '#aaa';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Paid': return '✓ Paid - Thank You For Your Payment!';
      case 'Free': return '✓ Free Card!';
      case 'PostPay': return 'PostPay - Join Allowed';
      case 'Pending': return '⏳ Pending Approval';
      case 'Denied': return '✕ Access Denied';
      default: return status;
    }
  };

  if (statusLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5cb85c" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{padding: 20}}>

      <View style={styles.backRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchStatus}>
          <Text style={styles.refreshText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Class Info */}
      <View style={styles.card}>
        <Text style={styles.month}>{lesson.month} Month</Text>
        <Text style={styles.topic}>{lesson.topic}</Text>
        <Text style={styles.info}>Grade {lesson.grade}</Text>
        <Text style={styles.info}>{lesson.date} @ {lesson.time}</Text>
        {lesson.description ? <Text style={styles.desc}>{lesson.description}</Text> : null}
        <View style={styles.feeRow}>
          <Text style={styles.fee}>Class Fee: Rs.{lesson.fee}/=</Text>
        </View>
      </View>

      {!status && (
        <TouchableOpacity style={styles.selectBtn} onPress={handleSelect} disabled={selecting}>
          {selecting ? <ActivityIndicator color="#fff" /> :
            <Text style={styles.selectBtnTxt}>SELECT THIS CLASS</Text>}
        </TouchableOpacity>
      )}

      {status && (
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor()}]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      )}

      {(status === 'Pending' || status === 'PostPay' || status === 'Denied') && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upload Payment Receipt</Text>
          <Text style={styles.hint}>Enter paid date, amount and upload your bank receipt photo.</Text>

          <Text style={styles.fieldLabel}>Paid Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={paidDate}
            onChangeText={setPaidDate}
          />
          <Text style={styles.fieldLabel}>Amount Paid</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 800"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Any notes"
            value={notes}
            onChangeText={setNotes}
          />
          <TouchableOpacity style={styles.chooseFile} onPress={pickImage}>
            <Text style={styles.chooseFileText}>
              {image ? '✓ ' + image.fileName : '📷 Choose Receipt Image'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" /> :
              <Text style={styles.uploadText}>⬆ Upload Receipt</Text>}
          </TouchableOpacity>

          {status === 'Pending' && (
            <Text style={styles.pendingNote}>
              Your payment is under review.{'\n'}Call 0766563000 if needed.
            </Text>
          )}
        </View>
      )}

      {canJoin && (
        <View style={styles.card}>
          {lesson.livestream_link && lesson.livestream_link !== 'blank' && (
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => Linking.openURL(lesson.livestream_link)}>
              <Text style={styles.zoomText}>📹 Join Live Stream</Text>
            </TouchableOpacity>
          )}
          {isPaid && videos.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recordings</Text>
              {videos.map((v, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.videoButton}
                  onPress={() => navigation.navigate('VideoPlayer', {url: v.url, title: v.label})}>
                  <Text style={styles.videoText}>▶ {v.label}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  backRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16},
  backText: {color: '#5cb85c', fontSize: 15},
  refreshText: {color: '#888', fontSize: 15},
  card: {backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, elevation: 2},
  month: {fontSize: 13, color: '#e05555', fontWeight: '600', marginBottom: 4},
  topic: {fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 8},
  info: {fontSize: 14, color: '#666', marginBottom: 3},
  desc: {fontSize: 13, color: '#888', marginTop: 6},
  feeRow: {marginTop: 10},
  fee: {fontSize: 15, fontWeight: '600', color: '#333'},
  selectBtn: {backgroundColor: '#222', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16},
  selectBtnTxt: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  statusBadge: {borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 16},
  statusText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  sectionTitle: {fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8},
  hint: {fontSize: 12, color: '#888', marginBottom: 12},
  fieldLabel: {fontSize: 13, color: '#555', marginBottom: 4, fontWeight: '600'},
  input: {backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14, borderWidth: 1, borderColor: '#ddd'},
  chooseFile: {borderWidth: 1, borderColor: '#5cb85c', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 10},
  chooseFileText: {color: '#5cb85c', fontSize: 14},
  uploadButton: {backgroundColor: '#5cb85c', borderRadius: 8, padding: 14, alignItems: 'center'},
  uploadText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  pendingNote: {textAlign: 'center', color: '#888', fontSize: 12, marginTop: 12, lineHeight: 18},
  zoomButton: {backgroundColor: '#e05555', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 12},
  zoomText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  videoButton: {backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#eee'},
  videoText: {fontSize: 14, color: '#333'},
});