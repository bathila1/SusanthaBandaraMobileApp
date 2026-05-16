import { useFocusEffect } from '@react-navigation/native';

import { WebView } from 'react-native-webview';
import { useCallback } from 'react';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Image,
  Modal,
} from 'react-native';

import { getClasses } from '../api/api';
import { useAuth } from '../context/AuthContext';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getStatusColor = status => {
  switch (status) {
    case 'Paid':
      return '#6f42c1';
    case 'Institute':
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

const getStatusText = status => {
  switch (status) {
    case 'Paid':
      return '✓ Paid';
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

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[now.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [showYearDrop, setShowYearDrop] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBank, setShowBank] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthDrop, setShowMonthDrop] = useState(false);

  const YEARS = (() => {
    const current = new Date().getFullYear();
    const list = [];
    for (let y = current - 5; y <= current + 1; y++) {
      list.push(String(y));
    }
    return list;
  })();

  const fetchClasses = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await getClasses(
        user.id,
        user.grade,
        selectedMonth,
        selectedYear,
      );
      if (res.success) setClasses(res.classes);
      else Alert.alert('Error', res.message);
    } catch (e) {
      Alert.alert('Error', 'Cannot connect to server');
    }
    isRefresh ? setRefreshing(false) : setLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchClasses(false, selectedMonth);
      const interval = setInterval(() => {
        fetchClasses(false, selectedMonth);
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }, [selectedMonth, selectedYear, user?.grade]),
  );
  if (!user) return null;


  const renderMonthYearPicker = () => (
    <View style={styles.dropdownWrapper}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => {
            setShowMonthDrop(!showMonthDrop);
            setShowYearDrop(false);
          }}
        >
          <Text style={styles.dropdownBtnTxt}>{selectedMonth} ▾</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dropdownBtn}
          onPress={() => {
            setShowYearDrop(!showYearDrop);
            setShowMonthDrop(false);
          }}
        >
          <Text style={styles.dropdownBtnTxt}>{selectedYear} ▾</Text>
        </TouchableOpacity>
      </View>

      {showMonthDrop && (
        <View style={styles.dropdownList}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {MONTHS.map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.dropdownItem,
                  selectedMonth === m && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedMonth(m);
                  setShowMonthDrop(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemTxt,
                    selectedMonth === m && styles.dropdownItemTxtActive,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {showYearDrop && (
        <View style={[styles.dropdownList, { left: 130, width: 120 }]}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {YEARS.map(y => (
              <TouchableOpacity
                key={y}
                style={[
                  styles.dropdownItem,
                  selectedYear === y && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedYear(y);
                  setShowYearDrop(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemTxt,
                    selectedYear === y && styles.dropdownItemTxtActive,
                  ]}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderClass = ({ item }) => {
    const isPaid = ['Paid', 'Free', 'Institute', 'PostPay'].includes(
      item.student_status,
    );
    const time = item.time ? ' @ ' + formatTime(item.time) : '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ClassDetail', { lesson: item })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.month}>{item.month} Month</Text>
          <Text style={styles.grade}>Grade {item.grade}</Text>
        </View>
        <Text style={styles.topic}>
          {item.topic}
          {time}
        </Text>
        <Text style={styles.desc}>{item.description}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.fee}>Rs.{item.fee}/=</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        {item.student_status && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.student_status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(item.student_status)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const formatTime = t => {
    try {
      const [h, m] = t.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = hour % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    } catch {
      return t;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome} numberOfLines={1}>
            Hi, {user.name?.split(' ')[0]}
          </Text>
          <Text style={styles.gradeText}>
            Grade {user.grade} • {selectedYear}
          </Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnTxt}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={logout}
            style={[styles.headerBtn, { borderColor: '#d9534f' }]}
          >
            <Text style={[styles.headerBtnTxt, { color: '#d9534f' }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => setShowBank(true)}
        style={[
          {
            fontSize: 13,
            fontWeight: 'bold',
            color: '#ffffff',
            borderColor: '#eeff00',
            margin: 10,
            backgroundColor: '#e60400',
            borderWidth: 1,
            borderRadius: 6,
            paddingVertical: 4,
            paddingHorizontal: 10,
            alignSelf: 'flex-start',
          },
        ]}
      >
        <Text style={[styles.headerBtnTxt, { color: '#ffffff' }]}>
          🏦 Bank Details
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => fetchClasses(false, selectedMonth)}
        style={{
          borderWidth: 1,
          borderRadius: 6,
          paddingVertical: 4,
          paddingHorizontal: 10,
          alignSelf: 'flex-start',
          margin: 10,
          marginTop: 0,
          borderColor: '#000000',
          backgroundColor: '#b6fffb',
          fontWeight: 'bold',
          fontSize: 13,
          textAlign: 'center',
        }}
        disabled={loading}
      >
        <Text>↻ Refresh</Text>
      </TouchableOpacity>

      {/* Month picker */}
      {/* height is normal */}

      {renderMonthYearPicker()}

      {/* Class List */}
      <View style={{ flex: 1, zIndex: 0 }}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#5cb85c"
            style={{ marginTop: 40 }}
          />
        ) : classes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>No classes for {selectedMonth}</Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={item => item.id.toString()}
            renderItem={renderClass}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchClasses(true)}
              />
            }
          />
        )}
      </View>
      <Modal visible={showBank} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Details</Text>
              <TouchableOpacity onPress={() => setShowBank(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.zoomHint}>Pinch to zoom</Text>
            <View style={styles.webviewContainer}>
              <WebView
                source={{
                  html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
              <style>
                * { margin:0; padding:0; background:#fff; }
                body { display:flex; justify-content:center; align-items:center; min-height:100vh; }
                img { width:100%; height:auto; }
              </style>
            </head>
            <body>
              <img src="https://susanthabandara.com/assets/img/bank_slip.png" />
            </body>
            </html>
          `,
                }}
                style={styles.webview}
                scalesPageToFit={false}
                scrollEnabled
                javaScriptEnabled
              />
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowBank(false)}
            >
              <Text style={styles.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  modalCloseX: { fontSize: 18, color: '#888', padding: 4 },
  zoomHint: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 8,
  },
  webviewContainer: {
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  webview: { flex: 1 },
  modalClose: {
    marginTop: 12,
    backgroundColor: '#5cb85c',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalCloseTxt: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  welcome: { fontSize: 18, fontWeight: 'bold', color: '#333', maxWidth: 180 },
  gradeText: { fontSize: 13, color: '#888', marginTop: 2 },
  headerBtns: { gap: 6 },
  headerBtn: {
    borderWidth: 1,
    borderColor: '#5cb85c',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  headerBtnTxt: { fontSize: 13, color: '#5cb85c', fontWeight: '600' },
  monthList: {
    backgroundColor: '#fff',
    paddingVertical: 1,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  dropdownWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    zIndex: 999,
  },
  dropdownBtn: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 10,
    backgroundColor: '#f9f9f9',
  },
  dropdownBtnTxt: { fontSize: 14, fontWeight: '600', color: '#333' },
  dropdownList: {
    position: 'absolute',
    top: 52,
    left: 10,
    width: 180,
    backgroundColor: '#fff',
    elevation: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    zIndex: 999,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  dropdownItemActive: { backgroundColor: '#f0f9f0' },
  dropdownItemTxt: { fontSize: 14, color: '#333' },
  dropdownItemTxtActive: { color: '#5cb85c', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  month: { fontSize: 12, color: '#e05555', fontWeight: '600' },
  grade: { fontSize: 12, color: '#888' },
  topic: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  desc: { fontSize: 13, color: '#666', marginBottom: 10 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fee: { fontSize: 14, fontWeight: '600', color: '#333' },
  date: { fontSize: 13, color: '#888' },
  statusBadge: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  selectBadge: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#222',
  },
  selectText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyTxt: { fontSize: 16, color: '#aaa' },
});
