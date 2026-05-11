import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  submitPayslip,
  selectClass,
  getClassStatus,
  getVod,
  useChance,
  getZoomLink,
} from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function ClassDetailScreen({ route, navigation }) {
  const { lesson } = route.params;
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  // const today = '2026-05-08'; // for testing

  const [status, setStatus] = useState(lesson.student_status || null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [vodData, setVodData] = useState(null);
  const [vodLoading, setVodLoading] = useState(false);
  const [unlockedVideos, setUnlockedVideos] = useState([]);
  const [uploadedPayslip, setUploadedPayslip] = useState(null);
  const [zoomJoinUrl, setZoomJoinUrl] = useState(null);
  const [zoomLoading, setZoomLoading] = useState(false);

  const isPaid = ['Paid', 'Free', 'Institute'].includes(status);
  const canJoin = ['Paid', 'Free', 'Institute', 'PostPay'].includes(status);
  const isClassToday = lesson.date === today;

  const tutes = [
    { label: 'Geo Tute', url: lesson.tute1 },
    { label: 'Paper', url: lesson.tute2 },
    { label: 'Civic Tute', url: lesson.civic_tute3 },
    { label: 'Health Tute', url: lesson.health_tute4 },
    { label: 'History Tute', url: lesson.his_tute4 },
  ].filter(v => v.url && v.url !== 'blank');

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (isPaid) fetchVod();
  }, [status]);

  useEffect(() => {
    if (canJoin && isClassToday) fetchZoomLink();
  }, [status]);

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await getClassStatus(user.id, lesson.meeting_id);
      if (res.success) {
        setStatus(res.data?.real_status || null);
        if (res.data?.payslip && res.data.payslip !== 'blank.png') {
          setUploadedPayslip(
            `https://susanthabandara.com/assets/uploads/payslips/${res.data.payslip}`,
          );
        }
      }
    } catch (e) {}
    setStatusLoading(false);
  };

  const fetchVod = async () => {
    setVodLoading(true);
    try {
      const res = await getVod(user.id, lesson.meeting_id);
      if (res.success) setVodData(res);
    } catch (e) {}
    setVodLoading(false);
  };

  const fetchZoomLink = async () => {
    // Priority 1: custom_start_url if not blank AND date matches today
    if (
      lesson.custom_start_url &&
      lesson.custom_start_url !== 'blank' &&
      lesson.custom_start_url_date === today
    ) {
      setZoomJoinUrl(lesson.custom_start_url);
      return;
    }

    // Priority 2: stored livestream_link
    if (lesson.livestream_link && lesson.livestream_link !== 'blank') {
      setZoomJoinUrl(lesson.livestream_link);
      return;
    }

    // Priority 3: fetch join_url from Zoom API
    setZoomLoading(true);
    try {
      const res = await getZoomLink(user.id, lesson.meeting_id);
      if (res.success) setZoomJoinUrl(res.join_url);
    } catch (e) {}
    setZoomLoading(false);
  };

  const handleSelect = async () => {
    Alert.alert('Select Class', 'Select this class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Select',
        onPress: async () => {
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
        },
      },
    ]);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, res => {
      if (res.assets) setImage(res.assets[0]);
    });
  };

  const handleUpload = async () => {
    if (!image) return Alert.alert('Error', 'Please choose a receipt image');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('meeting_id', lesson.meeting_id);
      formData.append('paid_date', today);
      formData.append('paid_amount', '0');
      formData.append('payslip_text', '-');
      formData.append('payslip', {
        uri: image.uri,
        type: image.type,
        name: image.fileName || 'payslip.jpg',
      });
      const res = await submitPayslip(formData);
      if (res.success) {
        setUploadedPayslip(image.uri);
        Alert.alert('Success', 'Payslip uploaded! Waiting for approval.');
        setImage(null);
      } else {
        Alert.alert('Error', res.message || 'Upload failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    setUploading(false);
  };

  const handleWatchVideo = async videoId => {
    const video = vodData.videos.find(v => v.id === videoId);

    const openVideo = () => {
      navigation.navigate('VideoPlayer', {
        embedUrl: video.embed_url,
        title: video.title,
      });
    };

    if (unlockedVideos.includes(videoId)) {
      openVideo();
      return;
    }

    if (!vodData || vodData.vod_chances <= 0) {
      Alert.alert(
        'No Chances Left',
        'You have used all 15 chances for this class.',
      );
      return;
    }

    Alert.alert(
      'Watch Recording',
      `This will use 1 chance.\n${vodData.vod_chances} chances remaining.\n\nContinue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Watch',
          onPress: async () => {
            const res = await useChance(user.id, lesson.meeting_id);
            if (res.success) {
              setUnlockedVideos(prev => [...prev, videoId]);
              setVodData(prev => ({ ...prev, vod_chances: res.chances_left }));
              openVideo();
            } else {
              Alert.alert('Error', res.message);
            }
          },
        },
      ],
    );
  };

  const handleZoomPress = () => {
    if (!isClassToday) {
      Alert.alert(
        'Not Yet',
        `This class is on ${lesson.date}.\nThe link will be active on that day.`,
      );
      return;
    }
    if (zoomLoading) {
      Alert.alert('Loading', 'Getting your join link, please wait...');
      return;
    }
    if (zoomJoinUrl) {
      Linking.openURL(zoomJoinUrl);
    } else {
      Alert.alert(
        'No Link',
        'Could not get join link.\nCall 0766563000 for access.',
      );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'Paid':
        return '#6f42c1';
      case 'Free':
        return '#5cb85c';
      case 'PostPay':
        return '#333';
      case 'Pending':
        return '#f0ad4e';
      case 'Denied':
        return '#d9534f';
      default:
        return '#aaa';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'Paid':
        return '✓ Paid!';
      case 'Free':
        return '✓ Free Card!';
      case 'PostPay':
        return 'PostPay - Join Allowed';
      case 'Pending':
        return '⏳ Pending Approval';
      case 'Denied':
        return '✕ Access Denied';
      default:
        return status;
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
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
        <Text style={styles.info}>
          {lesson.date} @ {lesson.time}
        </Text>
        {lesson.description ? (
          <Text style={styles.desc}>{lesson.description}</Text>
        ) : null}
        <View style={styles.feeRow}>
          <Text style={styles.fee}>Class Fee: Rs.{lesson.fee}/=</Text>
        </View>
      </View>

      {/* Not selected */}
      {!status && (
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={handleSelect}
          disabled={selecting}
        >
          {selecting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.selectBtnTxt}>SELECT THIS CLASS</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Status Badge */}
      {status && (
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      )}
      {/* Paid Content */}
      {canJoin && (
        <View style={styles.card}>
          {/* Zoom Join Button */}
          <TouchableOpacity
            style={styles.zoomImageBtn}
            onPress={handleZoomPress}
          >
            {zoomLoading ? (
              <ActivityIndicator
                color="#e05555"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <Image
                source={{
                  uri: 'https://susanthabandara.com/assets/img/join_stream2.png',
                }}
                style={[
                  styles.zoomImage,
                  !isClassToday && styles.zoomImageDimmed,
                ]}
                resizeMode="contain"
              />
            )}
            {!isClassToday && (
              <Text style={styles.zoomDateNote}>
                Next Class Date - {lesson.date}
              </Text>
            )}
          </TouchableOpacity>

          {/* Tutorials */}
          {isPaid && tutes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tutorials (PDF)</Text>
              {tutes.map((t, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.tuteButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://susanthabandara.com/assets/uploads/tutes/${t.url}`,
                    )
                  }
                >
                  <Text style={styles.tuteText}>📄 {t.label}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Recordings */}
          {isPaid && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
                Recordings ({vodData?.vod_chances ?? '?'} / 15 chances left)
              </Text>
              {vodLoading ? (
                <ActivityIndicator color="#5cb85c" />
              ) : vodData?.videos?.length > 0 ? (
                vodData.videos.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={styles.videoButton}
                    onPress={() => handleWatchVideo(v.id)}
                  >
                    <Text style={styles.videoText}>
                      {unlockedVideos.includes(v.id) ? '▶ ' : '🔒 '}
                      Week {v.week} — {v.title}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noVideos}>
                  No recordings available yet.
                </Text>
              )}
            </>
          )}
        </View>
      )}

      {/* Payslip Upload */}
      {(status === 'Pending' ||
        status === 'PostPay' ||
        status === 'Denied') && (
        <View style={styles.card}>
          {uploadedPayslip && (
            <View style={styles.uploadedContainer}>
              <Text style={styles.uploadedLabel}>✓ Receipt Uploaded</Text>
              <Image
                source={{ uri: uploadedPayslip }}
                style={styles.uploadedImage}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={styles.sectionTitle}>Upload Payment Receipt</Text>
          <Text style={styles.hint}>
            Choose your bank receipt photo and upload.
          </Text>
          <TouchableOpacity style={styles.chooseFile} onPress={pickImage}>
            <Text style={styles.chooseFileText}>
              {image ? '✓ ' + image.fileName : '📷 Choose Payslip'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadText}>Submit</Text>
            )}
          </TouchableOpacity>
          {status === 'Pending' && (
            <Text style={styles.pendingNote}>
              ඔබට Payment කිරීමට අමතක වූ නමුත්, Class එකට Join වීමට අවශ්‍ය නම්
              සර්ට Call එකක් දී PostPay ලබා ගන්න. ( 0766563000 ) Call කරන
              සියල්ලටම Class එකට Join වීමට හැකියාව ලැබේ. Call කළ පසු access ලබා
              දුන් පසු Refresh Button එක click කරන්න
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backText: { color: '#5cb85c', fontSize: 15 },
  refreshText: { color: '#888', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  month: { fontSize: 13, color: '#e05555', fontWeight: '600', marginBottom: 4 },
  topic: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  info: { fontSize: 14, color: '#666', marginBottom: 3 },
  desc: { fontSize: 13, color: '#888', marginTop: 6 },
  feeRow: { marginTop: 10 },
  fee: { fontSize: 15, fontWeight: '600', color: '#333' },
  selectBtn: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  selectBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  statusBadge: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  hint: { fontSize: 12, color: '#888', marginBottom: 12 },
  fieldLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chooseFile: {
    borderWidth: 1,
    borderColor: '#5cb85c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  chooseFileText: { color: '#5cb85c', fontSize: 14 },
  uploadButton: {
    backgroundColor: '#5cb85c',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  uploadText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  pendingNote: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  zoomImageBtn: { marginBottom: 12, alignItems: 'center' },
  zoomImage: { width: '100%', height: 80, borderRadius: 8 },
  zoomImageDimmed: { opacity: 0.4 },
  zoomDateNote: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  tuteButton: {
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  tuteText: { fontSize: 14, color: '#333' },
  videoButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  videoText: { fontSize: 14, color: '#333' },
  noVideos: { fontSize: 13, color: '#aaa', textAlign: 'center', padding: 10 },
  uploadedContainer: {
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5cb85c',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f0fff0',
  },
  uploadedLabel: { color: '#5cb85c', fontWeight: '600', marginBottom: 8 },
  uploadedImage: { width: '100%', height: 200, borderRadius: 6 },
});
